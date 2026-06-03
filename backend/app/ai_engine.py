"""
D-NET — AI Engine Service
5 FREE AI Engines — NO API Key, NO Auth, UNLIMITED!
Fallback Chain: DuckDuckGo -> LLM7 -> BlackBox -> Pollinations -> Pollinations Simple
"""
import logging
import asyncio
import re
import json
import random
import httpx

from app.config import (
    POLLINATIONS_API_BASE, POLLINATIONS_MODEL,
    DDG_API_BASE, DDG_MODEL,
    BLACKBOX_API_BASE,
    LLM7_API_BASE, LLM7_MODEL,
    POLLINATIONS_SIMPLE_BASE, POLLINATIONS_SIMPLE_MODEL,
    AI_TIMEOUT, AI_ENGINE_ORDER,
)

logger = logging.getLogger("dnet")

_last_engine = None


def get_last_engine():
    return _last_engine


# ═══════════════════════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════════════════════
def _is_html(text: str) -> bool:
    t = text.strip()
    return (
        t.startswith("<!DOCTYPE") or
        t.startswith("<html") or
        t.startswith("<div") or
        "<script" in t or
        "window.location" in t or
        "502 Bad Gateway" in t or
        "Queue full" in t or
        "Sorry, AI servers are busy" in t
    )


# ═══════════════════════════════════════════════════════════
# ENGINE 1: POLLINATIONS
# ═══════════════════════════════════════════════════════════
async def _try_pollinations(messages: list) -> str | None:
    logger.info("[AI] Trying Pollinations...")
    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            res = await client.post(
                POLLINATIONS_API_BASE,
                headers={"Content-Type": "application/json", "Accept": "application/json"},
                json={
                    "model": POLLINATIONS_MODEL,
                    "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
                    "stream": False,
                },
            )
            if res.status_code != 200:
                return None
            data = res.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            if not content or _is_html(content):
                return None
            return content.strip()
    except Exception as e:
        logger.warning(f"[Pollinations] Error: {e}")
        return None


# ═══════════════════════════════════════════════════════════
# ENGINE 2: DUCKDUCKGO
# ═══════════════════════════════════════════════════════════
async def _try_duckduckgo(messages: list) -> str | None:
    logger.info("[AI] Trying DuckDuckGo...")
    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            res = await client.post(
                DDG_API_BASE,
                headers={"Content-Type": "application/json", "Accept": "application/json"},
                json={
                    "model": DDG_MODEL,
                    "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
                },
            )
            if res.status_code != 200:
                return None

            try:
                data = res.json()
                content = (
                    data.get("choices", [{}])[0].get("message", {}).get("content", "") or
                    data.get("response", "") or
                    (data.get("message", {}).get("content", "") if isinstance(data.get("message"), dict) else data.get("message", ""))
                )
                if content and not _is_html(content):
                    return content.strip()
            except Exception:
                pass

            # Fallback: streaming text
            text = res.text
            full_text = ""
            for line in text.split("\n"):
                line = line.strip()
                if not line.startswith("data: ") or "[DONE]" in line:
                    continue
                try:
                    chunk = json.loads(line[6:])
                    if chunk.get("message"):
                        full_text += chunk["message"]
                except Exception:
                    pass
            if full_text.strip():
                return full_text.strip()
            return None
    except Exception as e:
        logger.warning(f"[DDG] Error: {e}")
        return None


# ═══════════════════════════════════════════════════════════
# ENGINE 3: BLACKBOX AI
# ═══════════════════════════════════════════════════════════
async def _try_blackbox(messages: list) -> str | None:
    logger.info("[AI] Trying BlackBox AI...")
    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            res = await client.post(
                BLACKBOX_API_BASE,
                headers={"Content-Type": "application/json", "Accept": "application/json"},
                json={
                    "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
                    "maxTokens": 4096,
                    "mobileClient": True,
                    "agentMode": {"ImageGenerationMode": False},
                },
            )
            if res.status_code != 200:
                return None
            text = res.text
            text = re.sub(r'\$~~~\$[\s\S]*?\$~~~\$', '', text)
            text = re.sub(r'\[\^\d+\^\]', '', text).strip()
            if not text or len(text) < 5 or _is_html(text):
                return None
            return text.strip()
    except Exception as e:
        logger.warning(f"[BlackBox] Error: {e}")
        return None


# ═══════════════════════════════════════════════════════════
# ENGINE 4: LLM7
# ═══════════════════════════════════════════════════════════
async def _try_llm7(messages: list) -> str | None:
    logger.info("[AI] Trying LLM7...")
    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            res = await client.post(
                LLM7_API_BASE,
                headers={"Content-Type": "application/json", "Accept": "application/json"},
                json={
                    "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
                    "model": LLM7_MODEL,
                    "stream": False,
                },
            )
            if res.status_code != 200:
                return None
            data = res.json()
            content = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            if not content or _is_html(content):
                return None
            return content.strip()
    except Exception as e:
        logger.warning(f"[LLM7] Error: {e}")
        return None


# ═══════════════════════════════════════════════════════════
# ENGINE 5: POLLINATIONS SIMPLE
# ═══════════════════════════════════════════════════════════
async def _try_pollinations_simple(messages: list) -> str | None:
    logger.info("[AI] Trying Pollinations Simple...")
    try:
        async with httpx.AsyncClient(timeout=AI_TIMEOUT) as client:
            res = await client.post(
                POLLINATIONS_SIMPLE_BASE,
                headers={"Content-Type": "application/json", "Accept": "text/plain,application/json"},
                json={
                    "messages": [{"role": m["role"], "content": m["content"]} for m in messages],
                    "model": POLLINATIONS_SIMPLE_MODEL,
                    "seed": random.randint(0, 10000),
                },
            )
            if res.status_code != 200:
                return None
            text = res.text
            if not text or len(text) < 5 or _is_html(text):
                return None
            return text.strip()
    except Exception as e:
        logger.warning(f"[PollinationsSimple] Error: {e}")
        return None


# ═══════════════════════════════════════════════════════════
# ENGINE REGISTRY
# ═══════════════════════════════════════════════════════════
_ENGINE_MAP = {
    "duckduckgo": _try_duckduckgo,
    "llm7": _try_llm7,
    "blackbox": _try_blackbox,
    "pollinations": _try_pollinations,
    "pollinations-simple": _try_pollinations_simple,
}


# ═══════════════════════════════════════════════════════════
# MAIN AI CHAT — Smart Fallback Chain
# ═══════════════════════════════════════════════════════════
async def ai_chat(messages: list) -> str:
    global _last_engine
    logger.info("[AI] Starting chat with 5-engine fallback...")

    for engine_name in AI_ENGINE_ORDER:
        engine_fn = _ENGINE_MAP.get(engine_name.strip())
        if not engine_fn:
            continue
        _last_engine = engine_name.strip()
        try:
            result = await engine_fn(messages)
            if result:
                logger.info(f"[AI] Success with {engine_name}")
                return result
        except Exception as e:
            logger.warning(f"[AI] {engine_name} failed: {e}")

    _last_engine = None
    logger.error("[AI] All 5 engines failed!")
    return "AI service temporarily unavailable. Please try again in a moment."


async def ai_generate(prompt: str) -> str:
    return await ai_chat([{"role": "user", "content": prompt}])


async def ai_chat_with_retry(messages: list, max_retries: int = 3) -> str:
    last_error = ""
    for i in range(max_retries):
        try:
            result = await ai_chat(messages)
            if "temporarily unavailable" not in result:
                return result
            last_error = result
        except Exception as e:
            last_error = str(e)
        if i < max_retries - 1:
            await asyncio.sleep((2 ** i) * 1)
    return last_error


logger.info("[AI] D-NET AI Engine Initialized: 5 FREE Engines Active!")
logger.info(f"   Fallback Order: {' -> '.join(AI_ENGINE_ORDER)}")
