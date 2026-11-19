import json
import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone

from backend.config import DATABASE_PATH


@contextmanager
def get_connection():
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row

    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def initialize_database():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS reports (
                report_id TEXT PRIMARY KEY,
                status TEXT NOT NULL,
                report_json TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS reviews (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                report_id TEXT NOT NULL,
                decision TEXT NOT NULL,
                reviewer TEXT NOT NULL,
                comments TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (report_id)
                    REFERENCES reports(report_id)
            )
        """)


def save_report(report):
    with get_connection() as conn:
        conn.execute("""
            INSERT OR REPLACE INTO reports
            (report_id, status, report_json, created_at)
            VALUES (?, ?, ?, ?)
        """, (
            report["report_id"],
            report["status"],
            json.dumps(report),
            report["created_at"]
        ))

    return report["report_id"]


def get_reports():
    with get_connection() as conn:
        rows = conn.execute("""
            SELECT report_json
            FROM reports
            ORDER BY created_at DESC
        """).fetchall()

    return [json.loads(row["report_json"]) for row in rows]


def get_report(report_id):
    with get_connection() as conn:
        row = conn.execute("""
            SELECT report_json
            FROM reports
            WHERE report_id = ?
        """, (report_id,)).fetchone()

    if not row:
        return None

    return json.loads(row["report_json"])


def save_review(review):
    created_at = datetime.now(timezone.utc).isoformat()

    with get_connection() as conn:
        row = conn.execute("""
            SELECT report_json
            FROM reports
            WHERE report_id = ?
        """, (review["report_id"],)).fetchone()

        if not row:
            raise ValueError("Report not found")

        report_data = json.loads(row["report_json"])
        report_data["status"] = review["decision"]

        cursor = conn.execute("""
            INSERT INTO reviews
            (report_id, decision, reviewer, comments, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            review["report_id"],
            review["decision"],
            review["reviewer"],
            review.get("comments"),
            created_at
        ))

        conn.execute("""
            UPDATE reports
            SET status = ?, report_json = ?
            WHERE report_id = ?
        """, (
            review["decision"],
            json.dumps(report_data),
            review["report_id"]
        ))

        return cursor.lastrowid
