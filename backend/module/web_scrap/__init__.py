
import sys
if len(sys.argv) > 1 and not (sys.argv[1] in ['migrate', "makemigrations", "clear_all_sessions"]):
    print("[Worker] Starting Thread...")
    from backend.module.web_scrap import ColaManga

    source_control = {
        "colamanga": ColaManga
    }
    print("[Worker] Thread Started!")

