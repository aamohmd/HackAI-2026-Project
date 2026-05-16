from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
import random
from twilio.rest import Client
from dotenv import load_dotenv

from ..database import get_db
from ..models.user import User, VerificationCode
from ..schemas import UserCreate, UserRead, Token
from ..limiter import limiter
from ..dependencies import (
    SECRET_KEY,
    ALGORITHM,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS,
    oauth2_scheme,
    get_current_user,
)

load_dotenv()

router = APIRouter(prefix="/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Twilio Client
TWILIO_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER", "+14155238886")
twilio_client = Client(TWILIO_SID, TWILIO_TOKEN) if TWILIO_SID and TWILIO_TOKEN else None

# Utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def set_refresh_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        expires=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        samesite="lax",
        secure=False, # Set to True in production (HTTPS)
    )

# Endpoints
@router.post("/send-otp")
@limiter.limit("3/minute")
def send_otp(request: Request, phone_number: str, db: Session = Depends(get_db)):
    # 1. Sanitize Phone Number (Ensure E.164 format for Twilio)
    # Remove any spaces or dashes
    clean_phone = phone_number.replace(" ", "").replace("-", "")
    
    # If it starts with '0', assume Moroccan (+212)
    if clean_phone.startswith("0") and len(clean_phone) == 10:
        clean_phone = "+212" + clean_phone[1:]
    
    # Ensure it starts with '+'
    if not clean_phone.startswith("+"):
        clean_phone = "+" + clean_phone

    # Generate 4-digit code
    otp_code = str(random.randint(1000, 9999))
    
    # Store or update in DB (Using the cleaned phone)
    existing = db.query(VerificationCode).filter(VerificationCode.phone_number == clean_phone).first()
    if existing:
        existing.code = otp_code
        existing.created_at = datetime.now().isoformat()
    else:
        new_code = VerificationCode(phone_number=clean_phone, code=otp_code)
        db.add(new_code)
    
    db.commit()

    # Send via Twilio WhatsApp (best-effort delivery)
    delivery_method = "simulated"
    if twilio_client:
        try:
            print(f"Twilio: Attempting to send code {otp_code} to {clean_phone}")
            message = twilio_client.messages.create(
                from_=f"whatsapp:{TWILIO_WHATSAPP_NUMBER}",
                body=f"Your Mizan verification code is: {otp_code}. Don't share it with anyone.",
                to=f"whatsapp:{clean_phone}"
            )
            delivery_method = "whatsapp"
        except Exception as e:
            print(f"Twilio Error for {clean_phone}: {e}")
            delivery_method = "failed"
    else:
        print(f"\n[SMS SIMULATION] Code {otp_code} for {clean_phone}\n")

    # Always return the OTP in dev to allow auto-fill on mobile
    return {
        "detail": f"OTP sent to {clean_phone}",
        "otp_code": otp_code,
        "delivery": delivery_method
    }

@router.post("/register", response_model=UserRead)
@limiter.limit("5/minute")
def register(request: Request, user: UserCreate, verification_code: str, db: Session = Depends(get_db)):
    # 0. Sanitize input phone
    clean_phone = user.phone_number.replace(" ", "").replace("-", "")
    if clean_phone.startswith("0") and len(clean_phone) == 10:
        clean_phone = "+212" + clean_phone[1:]
    if not clean_phone.startswith("+"):
        clean_phone = "+" + clean_phone
        
    # 1. Verify OTP
    v_record = db.query(VerificationCode).filter(
        VerificationCode.phone_number == clean_phone,
        VerificationCode.code == verification_code
    ).first()
    
    if not v_record:
        raise HTTPException(status_code=400, detail="Invalid or expired verification code")
    
    # 2. Check if already exists
    db_user = db.query(User).filter(User.phone_number == clean_phone).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    # 3. Create User
    hashed_pwd = get_password_hash(user.password)
    new_user = User(phone_number=clean_phone, hashed_password=hashed_pwd)
    db.add(new_user)
    
    # 4. Clean up OTP
    db.delete(v_record)
    
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 0. Sanitize input phone (form_data.username)
    clean_phone = form_data.username.replace(" ", "").replace("-", "")
    if clean_phone.startswith("0") and len(clean_phone) == 10:
        clean_phone = "+212" + clean_phone[1:]
    if not clean_phone.startswith("+"):
        clean_phone = "+" + clean_phone

    user = db.query(User).filter(User.phone_number == clean_phone).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect phone number or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Access Token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_token(
        data={"sub": str(user.id), "type": "access"}, expires_delta=access_token_expires
    )
    
    # Refresh Token
    refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    refresh_token = create_token(
        data={"sub": str(user.id), "type": "refresh"}, expires_delta=refresh_token_expires
    )
    
    set_refresh_cookie(response, refresh_token)
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/refresh", response_model=Token)
@limiter.limit("20/minute")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    old_refresh_token = request.cookies.get("refresh_token")
    if not old_refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    
    try:
        payload = jwt.decode(old_refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None or token_type != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
            
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    
    new_access_token = create_token(
        data={"sub": str(user.id), "type": "access"}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    
    new_refresh_token = create_token(
        data={"sub": str(user.id), "type": "refresh"}, expires_delta=timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    )
    
    set_refresh_cookie(response, new_refresh_token)
    
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(key="refresh_token")
    return {"detail": "Successfully logged out"}
