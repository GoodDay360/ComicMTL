from core.settings import DEBUG
import sys

if len(sys.argv) > 1 and not (sys.argv[1] in ['migrate', "makemigrations", "clear_all_sessions"]):
    print("[Worker] Starting Thread...")
    from backend.invoke_worker import (
        session,
    )
    print("[Worker] Thread Started!")

