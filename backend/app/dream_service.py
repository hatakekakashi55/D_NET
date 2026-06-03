"""
D-NET — Dream Analysis Service
Analyzes dream text using AI and returns structured data.
"""
import json
import logging
import re
from typing import Optional

from app.ai_engine import ai_chat_with_retry

logger = logging.getLogger("dnet")

VALID_REALMS = [
    "Ocean Realm",
    "Falling City",
    "Lost Forest",
    "Flying Realm",
    "Void",
    "Being Watched",
    "Shadow Maze",
]

REALM_COLORS = {
    "Ocean Realm": "#00D4FF",
    "Falling City": "#FF4B6E",
    "Lost Forest": "#00E5A0",
    "Flying Realm": "#A78BFA",
    "Void": "#4A4A6A",
    "Being Watched": "#FF8C42",
    "Shadow Maze": "#6C63FF",
}


def safe_json_parse(text: str) -> Optional[dict]:
    """Extract and parse JSON from AI response text."""
    if not text:
        return None

    # Try direct parse
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to extract JSON from markdown code block
    patterns = [
        r'```json\s*([\s\S]*?)\s*```',
        r'```\s*([\s\S]*?)\s*```',
        r'\{[\s\S]*\}',
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            try:
                candidate = match.group(1) if match.lastindex else match.group(0)
                return json.loads(candidate)
            except (json.JSONDecodeError, IndexError):
                continue

    return None


def validate_analysis(data: dict) -> dict:
    """Validate and fix the AI analysis result."""
    # Ensure symbols
    symbols = data.get("symbols", [])
    if not isinstance(symbols, list):
        symbols = []
    symbols = symbols[:5]

    # Ensure emotions sum to 100
    emotions = data.get("emotions", {})
    if not isinstance(emotions, dict) or not emotions:
        emotions = {"wonder": 40, "anxiety": 35, "mystery": 25}
    total = sum(emotions.values())
    if total != 100 and total > 0:
        factor = 100 / total
        emotions = {k: max(1, int(v * factor)) for k, v in emotions.items()}
        # Fix rounding
        diff = 100 - sum(emotions.values())
        if diff != 0:
            first_key = list(emotions.keys())[0]
            emotions[first_key] += diff

    # Ensure realm is valid
    realm = data.get("realm", "")
    if realm not in VALID_REALMS:
        realm = "Void"

    return {
        "symbols": symbols,
        "emotions": emotions,
        "archetype": data.get("archetype", "The Unknown"),
        "theme": data.get("theme", "A mysterious journey through the subconscious"),
        "realm": realm,
        "realm_color": REALM_COLORS.get(realm, "#4A4A6A"),
        "insight": data.get("insight", "Your dream reveals deep subconscious processing."),
        "pattern_note": data.get("pattern_note", ""),
    }


async def analyze_dream(dream_text: str) -> dict:
    """Analyze a dream using the AI engine and return structured data."""
    prompt = f"""Analyze this dream. Return ONLY valid JSON, no explanation or markdown:
{{
  "symbols": ["max 5 key symbols from the dream"],
  "emotions": {{"emotion_name": percentage_int}},
  "archetype": "dream archetype name (e.g. The Chase, The Fall, The Discovery)",
  "theme": "one sentence theme description",
  "realm": "EXACTLY one of: Ocean Realm, Falling City, Lost Forest, Flying Realm, Void, Being Watched, Shadow Maze",
  "insight": "2-3 sentence psychological insight about this dream",
  "pattern_note": "brief pattern observation or empty string"
}}
Rules:
- Emotions must sum to exactly 100
- Maximum 3-4 emotions
- Realm must be exactly one from the list above
- Symbols should be concrete nouns from the dream
- Insight should be thoughtful and specific

Dream text: {dream_text}"""

    messages = [{"role": "user", "content": prompt}]
    result = await ai_chat_with_retry(messages, max_retries=2)

    parsed = safe_json_parse(result)
    if parsed:
        return validate_analysis(parsed)

    # Fallback if parsing fails
    logger.warning("[Dream] Failed to parse AI response, using fallback")
    return validate_analysis({
        "symbols": ["unknown"],
        "emotions": {"mystery": 50, "wonder": 30, "confusion": 20},
        "archetype": "The Unknown",
        "theme": "A journey through uncharted dreamscape",
        "realm": "Void",
        "insight": "Your dream contains complex imagery that suggests deep subconscious processing. The themes present indicate a period of internal reflection.",
        "pattern_note": "",
    })


async def generate_chronicle(realm_name: str, dream_count: int, common_symbols: list[str]) -> str:
    """Generate a collective dream chronicle for a realm."""
    symbols_str = ", ".join(common_symbols[:5]) if common_symbols else "shadows, light, movement"
    prompt = f"""Write a short, evocative collective dream chronicle (150-200 words) for the "{realm_name}" realm in a dream universe app called D-NET.

Context:
- {dream_count} dreamers visited this realm recently
- Common symbols: {symbols_str}
- Write in third person, present tense
- Tone: mysterious, poetic, but grounded
- NO emojis
- Start directly with the narrative, no title needed

Write the chronicle now:"""

    messages = [{"role": "user", "content": prompt}]
    result = await ai_chat_with_retry(messages, max_retries=2)

    if result and "temporarily unavailable" not in result:
        return result.strip()

    return f"The {realm_name} stirs with the dreams of {dream_count} minds. Symbols of {symbols_str} weave through the collective unconscious, forming patterns only the universe understands."


async def generate_pattern_analysis(dreams: list[dict]) -> str:
    """Generate AI pattern analysis for a user's dream history."""
    if not dreams:
        return "Record more dreams to unlock pattern analysis."

    dream_summaries = []
    for d in dreams[:10]:
        dream_summaries.append(
            f"- Realm: {d.get('realm', 'Unknown')}, "
            f"Archetype: {d.get('archetype', 'Unknown')}, "
            f"Symbols: {', '.join(d.get('symbols', []))}"
        )

    prompt = f"""Analyze these dream patterns for a D-NET user. Write 3-4 sentences about recurring themes, emotional patterns, and what the subconscious might be processing. Be specific and insightful. NO emojis.

Recent dreams:
{chr(10).join(dream_summaries)}

Pattern analysis:"""

    messages = [{"role": "user", "content": prompt}]
    result = await ai_chat_with_retry(messages, max_retries=2)

    if result and "temporarily unavailable" not in result:
        return result.strip()

    return "Your dream patterns are still forming. Keep recording to reveal deeper insights."
