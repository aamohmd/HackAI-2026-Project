import logging
import time
from sqlalchemy import create_engine, exc
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from os import getenv
from dotenv import load_dotenv

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

if not load_dotenv():
    logger.warning("No .env file found. Using default environment variables.")

def get_env_with_warning(key, default):
    value = getenv(key)
    if value is None:
        logger.warning(f"Environment variable '{key}' not set. Falling back to default: '{default}'")
        return default
    return value

DB_TYPE = getenv("DB_TYPE", "postgres")

if DB_TYPE == "sqlite":
    SQLITE_PATH = getenv("SQLITE_DB_PATH", "mizan.db")
    URL_DATABASE = f"sqlite:///./{SQLITE_PATH}"
    engine = create_engine(URL_DATABASE, connect_args={"check_same_thread": False})
else:
    DB_HOST = get_env_with_warning("DB_HOST", "localhost")
    DB_NAME = get_env_with_warning("DB_NAME", "hackathon_db")
    DB_USER = get_env_with_warning("DB_USER", "postgres")
    DB_PASSWORD = get_env_with_warning("DB_PASSWORD", "postgres")
    DB_PORT = get_env_with_warning("DB_PORT", "5432")
    URL_DATABASE = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    engine = create_engine(URL_DATABASE)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()