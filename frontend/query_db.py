# Empathy_Project_frontend/frontend/query_db.py
import os
import sys
import json
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parents[2] / "New-Empathy-Project" / "Empathy-project New" / "backend"
load_dotenv(backend_dir / ".env")

from pymongo import MongoClient

def get_snapshot(username):
    client = MongoClient(os.environ["MONGODB_URI"], serverSelectionTimeoutMS=5000)
    db = client[os.environ["MONGODB_DATABASE"]]
    user = db.users.find_one({"username": username})
    if not user:
        return {"error": f"User {username} not found"}
    sid = user.get("student_id")
    prog = list(db.student_progress.find({"student_id": sid}, {"_id": 0})) if sid else []
    events = list(db.safety_events.find({"student_id": sid}, {"_id": 0})) if sid else []
    safety_status = db.student_safety_states.find_one({"student_id": sid}, {"_id": 0})
    interactions = list(db.learning_interactions.find({"student_id": sid}, {"_id": 0})) if sid else []
    return {
        "student_id": sid,
        "username": username,
        "progress_count": len(prog),
        "safety_events_count": len(events),
        "interactions_count": len(interactions),
        "safety_status": safety_status,
        "progress": prog,
        "safety_events": events,
    }

if __name__ == "__main__":
    if len(sys.argv) > 2 and sys.argv[1] == "--ensure":
        sys.path.insert(0, str(backend_dir))
        from auth import UserStore
        store = UserStore()
        target_uname = sys.argv[2]
        u = store.find_by_username(target_uname)
        if not u:
            u = store.create_user(f"Test {target_uname}", target_uname, f"{target_uname}@test.com", "Password123!", role="student")
        print(json.dumps({"ensured": True, "student_id": u.get("student_id")}))
        sys.exit(0)

    uname = sys.argv[1] if len(sys.argv) > 1 else "browser_student_p10_live"
    print(json.dumps(get_snapshot(uname), default=str))
