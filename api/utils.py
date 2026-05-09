import os

UPLOAD_DIR = "uploads"

def ensure_upload_dir():
    try:
        if not os.path.exists(UPLOAD_DIR):
            os.makedirs(UPLOAD_DIR, exist_ok=True)
    except OSError as e:
        if not os.path.isdir(UPLOAD_DIR):
            print(f"Warning: Could not create upload directory {UPLOAD_DIR}: {e}")
            # We don't raise here to allow the app to start if the dir exists but was misidentified
