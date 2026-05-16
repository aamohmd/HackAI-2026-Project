import sqlite3
import os
import json
from rapidfuzz import process, fuzz
from typing import Optional, Dict

class OfflineCache:
    def __init__(self, db_path: str = "api/knowledge/cache/offline.db"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS qa_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT UNIQUE,
                answer_json TEXT,
                domain TEXT
            )
        """)
        conn.commit()
        conn.close()

    def add_to_cache(self, query: str, answer_dict: Dict, domain: str):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        try:
            cursor.execute(
                "INSERT OR REPLACE INTO qa_cache (query, answer_json, domain) VALUES (?, ?, ?)",
                (query, json.dumps(answer_dict), domain)
            )
            conn.commit()
        except Exception as e:
            print(f"Cache insertion error: {e}")
        finally:
            conn.close()

    def get_cached_answer(self, query: str, domain: Optional[str] = None) -> Optional[Dict]:
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        if domain:
            cursor.execute("SELECT query, answer_json FROM qa_cache WHERE domain = ?", (domain,))
        else:
            cursor.execute("SELECT query, answer_json FROM qa_cache")
            
        rows = cursor.fetchall()
        conn.close()
        
        if not rows:
            return None
            
        queries = [row[0] for row in rows]
        # Use RapidFuzz to find the best match
        best_match = process.extractOne(query, queries, scorer=fuzz.token_sort_ratio)
        
        if best_match and best_match[1] > 85: # Threshold of 85% similarity
            matched_query = best_match[0]
            for q, a_json in rows:
                if q == matched_query:
                    return json.loads(a_json)
        
        return None
