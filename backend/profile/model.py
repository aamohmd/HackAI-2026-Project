import sqlite3
import json
from typing import Optional
import os
from backend.schemas import UserProfile

DB_PATH = os.environ.get("SQLITE_DB_PATH", "mizan.db")
PROFILE_TABLE = "user_profiles"  # separate from SQLAlchemy 'users' table

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(f"""
            CREATE TABLE IF NOT EXISTS {PROFILE_TABLE} (
                user_id TEXT PRIMARY KEY,
                wilaya TEXT,
                literacy_score REAL,
                topics_asked TEXT,
                low_conf_count INTEGER,
                feedback_log TEXT
            )
        """)

def get_profile(user_id: str) -> Optional[UserProfile]:
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.execute(f"SELECT * FROM {PROFILE_TABLE} WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return UserProfile(
                user_id=row[0],
                wilaya=row[1],
                topics_asked=json.loads(row[3]),
                low_conf_count=row[4],
                feedback_log=json.loads(row[5])
            )
    return None

def save_profile(profile: UserProfile):
    init_db()
    with sqlite3.connect(DB_PATH) as conn:
        conn.execute(f"""
            INSERT OR REPLACE INTO {PROFILE_TABLE} 
            (user_id, wilaya, literacy_score, topics_asked, low_conf_count, feedback_log)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            profile.user_id,
            profile.wilaya,
            0.5, # unused literacy_score
            json.dumps(profile.topics_asked),
            profile.low_conf_count,
            json.dumps(profile.feedback_log)
        ))
