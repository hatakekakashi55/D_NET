"""
D-NET — Pydantic Models (Request/Response schemas)
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ═══════════════════════════════════════════════════════════
# AUTH
# ═══════════════════════════════════════════════════════════
class AuthVerifyRequest(BaseModel):
    token: str


class AuthVerifyResponse(BaseModel):
    valid: bool
    user_id: Optional[str] = None
    email: Optional[str] = None
    error: Optional[str] = None


# ═══════════════════════════════════════════════════════════
# DREAM
# ═══════════════════════════════════════════════════════════
class DreamAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=10, max_length=5000)


class EmotionData(BaseModel):
    name: str
    percentage: int
    color: str = "#6C63FF"


class DreamAnalysisResponse(BaseModel):
    dream_id: str
    symbols: list[str]
    emotions: dict[str, int]
    archetype: str
    theme: str
    realm: str
    realm_color: str
    insight: str
    pattern_note: str
    created_at: Optional[str] = None


class DreamListItem(BaseModel):
    id: str
    archetype: str
    theme: str
    realm: str
    realm_color: str
    top_emotion: str
    top_emotion_pct: int
    preview: str
    created_at: str


class DreamListResponse(BaseModel):
    dreams: list[DreamListItem]
    total: int
    page: int
    per_page: int


# ═══════════════════════════════════════════════════════════
# UNIVERSE / REALMS
# ═══════════════════════════════════════════════════════════
class RealmInfo(BaseModel):
    name: str
    color: str
    icon: str
    population: int = 0
    today_count: int = 0
    dominant_emotion: str = "mystery"


class RealmListResponse(BaseModel):
    realms: list[RealmInfo]
    total_dreamers: int
    dreams_today: int
    most_common_symbol: str


class RealmDetailResponse(BaseModel):
    name: str
    color: str
    icon: str
    population: int
    today_count: int
    dominant_emotion: str
    chronicle: str
    common_symbols: list[str]
    emotions: dict[str, int]
    user_visits: int = 0


# ═══════════════════════════════════════════════════════════
# CHRONICLE
# ═══════════════════════════════════════════════════════════
class ChronicleItem(BaseModel):
    id: str
    realm_name: str
    realm_color: str
    story: str
    dream_count: int
    generated_date: str


class ChronicleListResponse(BaseModel):
    chronicles: list[ChronicleItem]
    total: int


# ═══════════════════════════════════════════════════════════
# PROFILE
# ═══════════════════════════════════════════════════════════
class ProfileStats(BaseModel):
    total_dreams: int = 0
    longest_streak: int = 0
    realms_visited: int = 0
    days_active: int = 0


class ProfileResponse(BaseModel):
    display_name: str
    email: str
    stats: ProfileStats
    most_visited_realm: Optional[str] = None
    pattern_analysis: str = ""
    streak_count: int = 0


# ═══════════════════════════════════════════════════════════
# GLOBAL STATS
# ═══════════════════════════════════════════════════════════
class GlobalStatsResponse(BaseModel):
    total_dreamers: int
    dreams_today: int
    most_common_symbol: str
    active_realms: int


# ═══════════════════════════════════════════════════════════
# AI CHAT
# ═══════════════════════════════════════════════════════════
class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    response: str

