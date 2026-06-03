"""
D-NET Backend — Configuration
All environment variables and constants.

AI Engine: 5 FREE engines — NO API keys required
Fallback: DuckDuckGo -> LLM7 -> BlackBox -> Pollinations -> Pollinations Simple
"""
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dnet")

# ═══════════════════════════════════════════════════════════
# SUPABASE
# ═══════════════════════════════════════════════════════════
SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")  # anon key
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")  # service role key

# ═══════════════════════════════════════════════════════════
# JWT (Supabase Auth uses its own JWT, but we verify it)
# ═══════════════════════════════════════════════════════════
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")

# ═══════════════════════════════════════════════════════════
# 5 FREE AI ENGINES
# ═══════════════════════════════════════════════════════════

# ENGINE 1: POLLINATIONS (OpenAI-compatible)
POLLINATIONS_API_BASE = os.getenv("POLLINATIONS_API_BASE", "https://text.pollinations.ai/openai")
POLLINATIONS_MODEL = os.getenv("POLLINATIONS_MODEL", "openai")

# ENGINE 2: DUCKDUCKGO (via Cloudflare Worker)
DDG_API_BASE = os.getenv("DDG_API_BASE", "https://bitter-sea-46dc.keerthan4531.workers.dev/chat")
DDG_MODEL = os.getenv("DDG_MODEL", "gpt-4o-mini")

# ENGINE 3: BLACKBOX AI
BLACKBOX_API_BASE = os.getenv("BLACKBOX_API_BASE", "https://api.blackbox.ai/api/chat")

# ENGINE 4: LLM7
LLM7_API_BASE = os.getenv("LLM7_API_BASE", "https://api.llm7.io/v1/chat/completions")
LLM7_MODEL = os.getenv("LLM7_MODEL", "gpt-4o-mini")

# ENGINE 5: POLLINATIONS SIMPLE (Last resort)
POLLINATIONS_SIMPLE_BASE = os.getenv("POLLINATIONS_SIMPLE_BASE", "https://text.pollinations.ai")
POLLINATIONS_SIMPLE_MODEL = os.getenv("POLLINATIONS_SIMPLE_MODEL", "openai")

# AI Engine Fallback Order
AI_ENGINE_ORDER = os.getenv(
    "AI_ENGINE_ORDER",
    "duckduckgo,llm7,blackbox,pollinations,pollinations-simple"
).split(",")

# AI Request Timeout (seconds)
AI_TIMEOUT = int(os.getenv("AI_TIMEOUT", "90"))

# ═══════════════════════════════════════════════════════════
# SERVER
# ═══════════════════════════════════════════════════════════
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# ═══════════════════════════════════════════════════════════
# REALMS — The dream universe
# ═══════════════════════════════════════════════════════════
DREAM_REALMS = [
    {"name": "Ocean Realm", "color": "#00D4FF", "icon": "waves"},
    {"name": "Falling City", "color": "#FF4B6E", "icon": "city-variant"},
    {"name": "Lost Forest", "color": "#00E5A0", "icon": "pine-tree"},
    {"name": "Flying Realm", "color": "#A78BFA", "icon": "bird"},
    {"name": "Void", "color": "#4A4A6A", "icon": "circle-off-outline"},
    {"name": "Being Watched", "color": "#FF8C42", "icon": "eye-outline"},
    {"name": "Shadow Maze", "color": "#6C63FF", "icon": "map-marker-path"},
]
