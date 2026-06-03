"""
D-NET — FastAPI Backend Main Application
Provides a fully functional FastAPI app that connects to Supabase.
Includes a fully realized local Memory/SQLite fallback database for zero-config run.
"""
import uuid
import logging
from datetime import datetime, date
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, Depends, HTTPException, Header, status
from fastapi.middleware.cors import CORSMiddleware
from jose import jwt, JWTError
from supabase import create_client, Client

from app.config import (
    SUPABASE_URL, SUPABASE_KEY, SUPABASE_JWT_SECRET, DREAM_REALMS
)
from app.models import (
    AuthVerifyRequest, AuthVerifyResponse,
    DreamAnalyzeRequest, DreamAnalysisResponse,
    DreamListResponse, DreamListItem,
    RealmListResponse, RealmInfo, RealmDetailResponse,
    ChronicleListResponse, ChronicleItem,
    ProfileResponse, ProfileStats, GlobalStatsResponse,
    ChatRequest, ChatResponse
)
from app.dream_service import (
    analyze_dream, generate_chronicle, generate_pattern_analysis
)
from app.ai_engine import ai_chat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dnet")

app = FastAPI(title="D-NET API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure CORS headers are present even on unhandled 500 errors
from fastapi.responses import JSONResponse
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={"Access-Control-Allow-Origin": "*"},
    )

# ═══════════════════════════════════════════════════════════
# DATABASE CLIENT / FALLBACK DATABASE
# ═══════════════════════════════════════════════════════════
supabase: Optional[Client] = None
use_fallback_db = True

if SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        # Verify if tables exist and are accessible (e.g. check profiles table)
        supabase.table("profiles").select("id").limit(1).execute()
        use_fallback_db = False
        logger.info("Supabase client initialized successfully and tables verified.")
    except Exception as e:
        use_fallback_db = True
        logger.warning(f"Supabase client connection failed or tables missing. Running in local fallback DB mode. Error: {e}")

# In-Memory DB for Development (Zero-Config)
db_users: Dict[str, Dict[str, Any]] = {}
db_dreams: Dict[str, Dict[str, Any]] = {}
db_realms: Dict[str, Dict[str, Any]] = {
    r["name"]: {
        "name": r["name"],
        "color": r["color"],
        "icon": r["icon"],
        "population": 100 + idx * 45,
        "today_count": 5 + idx * 2,
        "dominant_emotion": ["anxiety", "wonder", "mystery", "calm"][idx % 4],
        "chronicle": f"The collective dreamers of D-NET have entered the {r['name']}. They report visions of patterns weaving through the deep void. A sense of collective transition is imminent.",
        "common_symbols": ["keys", "stars", "flying", "shadows"]
    }
    for idx, r in enumerate(DREAM_REALMS)
}
db_chronicles: List[Dict[str, Any]] = [
    {
        "id": str(uuid.uuid4()),
        "realm_name": "Ocean Realm",
        "realm_color": "#00D4FF",
        "story": "A great tide rises in the collective mind. Dreamers describe floating on deep luminous currents, searching for submerged keys that open no doors.",
        "dream_count": 42,
        "generated_date": date.today().strftime("%Y-%m-%d")
    },
    {
        "id": str(uuid.uuid4()),
        "realm_name": "Shadow Maze",
        "realm_color": "#6C63FF",
        "story": "Through winding paths of darkness, the minds of many are seeking escape. There is a sense of being pursued by whispers, yet the walls of the maze are turning into starlight.",
        "dream_count": 28,
        "generated_date": date.today().strftime("%Y-%m-%d")
    }
]

# ═══════════════════════════════════════════════════════════
# AUTHENTICATION DEPENDENCY
# ═══════════════════════════════════════════════════════════
async def get_current_user(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """Verify authorization token and return user profile details."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_412_PRECONDITION_FAILED,
            detail="Missing or invalid Authorization header"
        )
    
    token = authorization.split(" ")[1]
    
    # Mock fallback bypass
    if token == "mock-wayne-token":
        return {
            "id": "usr_wayne",
            "email": "wayne@dnet.io",
            "display_name": "wayne",
            "bio": "Default dreamer account.",
            "avatar_color": "#8B8BF5",
            "streak_count": 5,
            "total_dreams": 12
        }
    if token == "mock-token-for-dev":
        return {"id": "dev-user-uuid", "email": "dev@dnet.io", "display_name": "Dreamer"}

    # Verify token directly with Supabase Auth API (most reliable approach)
    user_id = None
    user_email = None
    if supabase:
        try:
            user_resp = supabase.auth.get_user(token)
            if user_resp and user_resp.user:
                user_id = user_resp.user.id
                user_email = user_resp.user.email
        except Exception as e:
            logger.warning(f"Supabase token verification failed: {e}")

    # Fallback: try local JWT decode (for dev mock tokens)
    if not user_id:
        payload = None
        try:
            payload = jwt.decode(token, "fallback-secret-for-dev-runs", algorithms=["HS256"],
                                 options={"verify_aud": False})
        except Exception:
            pass
        if payload:
            user_id = payload.get("sub")
            user_email = payload.get("email", "unknown@dnet.io")

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    # Fetch user details from database
    if use_fallback_db:
        user_profile = db_users.get(user_id)
        if not user_profile:
            display_name = (user_email or "unknown@dnet.io").split("@")[0].capitalize()
            user_profile = {
                "id": user_id,
                "email": user_email or "unknown@dnet.io",
                "display_name": display_name,
                "bio": "Explore and sync your dreams.",
                "avatar_color": "#8B8BF5",
                "streak_count": 0,
                "total_dreams": 0
            }
            db_users[user_id] = user_profile
        return user_profile

    try:
        res = supabase.table("profiles").select("*").eq("id", user_id).execute()
        if not res.data:
            display_name = (user_email or "unknown@dnet.io").split("@")[0].capitalize()
            new_profile = {
                "id": user_id,
                "display_name": display_name,
                "streak_count": 0,
                "total_dreams": 0
            }
            supabase.table("profiles").insert(new_profile).execute()
            return {"id": user_id, "email": user_email, **new_profile}

        return {"id": user_id, "email": user_email, **res.data[0]}
    except Exception as e:
        logger.error(f"Supabase profile lookup failed: {e}")
        display_name = (user_email or "unknown@dnet.io").split("@")[0].capitalize()
        return {
            "id": user_id,
            "email": user_email or "unknown@dnet.io",
            "display_name": display_name,
            "bio": "Subconscious Explorer",
            "avatar_color": "#8B8BF5",
            "streak_count": 0,
            "total_dreams": 0
        }




# ═══════════════════════════════════════════════════════════
# ROUTE ENDPOINTS
# ═══════════════════════════════════════════════════════════

@app.post("/api/auth/verify", response_model=AuthVerifyResponse)
async def verify_auth(req: AuthVerifyRequest):
    """Verify Supabase JWT token and return status."""
    token = req.token
    
    if token == "mock-wayne-token":
        return AuthVerifyResponse(valid=True, user_id="usr_wayne", email="wayne@dnet.io")

    if token == "mock-token-for-dev":
        return AuthVerifyResponse(valid=True, user_id="dev-user-uuid", email="dev@dnet.io")

    if use_fallback_db or not SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(token, "fallback-secret-for-dev-runs", algorithms=["HS256"])
            return AuthVerifyResponse(
                valid=True,
                user_id=payload.get("sub"),
                email=payload.get("email")
            )
        except JWTError:
            return AuthVerifyResponse(valid=False, error="Invalid fallback token")

    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"])
        return AuthVerifyResponse(
            valid=True,
            user_id=payload.get("sub"),
            email=payload.get("email")
        )
    except JWTError as e:
        return AuthVerifyResponse(valid=False, error=str(e))


@app.post("/api/dream/analyze", response_model=DreamAnalysisResponse)
async def analyze_and_save_dream(req: DreamAnalyzeRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Analyze dream text, save to DB, update user stats, return analysis."""
    # Run AI engine fallback analysis
    analysis = await analyze_dream(req.text)
    dream_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    
    if use_fallback_db:
        # Save to local db dict
        db_dreams[dream_id] = {
            "id": dream_id,
            "user_id": user["id"],
            "raw_text": req.text,
            **analysis,
            "created_at": created_at
        }
        # Update profile stats
        user_profile = db_users.get(user["id"], {
            "total_dreams": 0,
            "streak_count": 0,
            "last_dream_date": None
        })
        
        user_profile["total_dreams"] += 1
        today_date = date.today().isoformat()
        
        # Simple streak update logic
        if user_profile["last_dream_date"] != today_date:
            user_profile["streak_count"] += 1
            user_profile["last_dream_date"] = today_date
            
        db_users[user["id"]] = user_profile
        
        # Update realm counters
        realm_name = analysis["realm"]
        if realm_name in db_realms:
            db_realms[realm_name]["population"] += 1
            db_realms[realm_name]["today_count"] += 1
    else:
        try:
            # Save dream to Supabase
            new_dream = {
                "id": dream_id,
                "user_id": user["id"],
                "raw_text": req.text,
                "symbols": analysis["symbols"],
                "emotions": analysis["emotions"],
                "archetype": analysis["archetype"],
                "theme": analysis["theme"],
                "realm": analysis["realm"],
                "insight": analysis["insight"],
                "pattern_note": analysis["pattern_note"],
                "created_at": created_at
            }
            supabase.table("dreams").insert(new_dream).execute()
            
            # Increment profiles total_dreams and update streak
            today_date = date.today().isoformat()
            profile = supabase.table("profiles").select("*").eq("id", user["id"]).execute().data[0]
            new_streak = profile.get("streak_count", 0)
            
            if profile.get("last_dream_date") != today_date:
                new_streak += 1
                
            supabase.table("profiles").update({
                "total_dreams": profile.get("total_dreams", 0) + 1,
                "streak_count": new_streak,
                "last_dream_date": today_date
            }).eq("id", user["id"]).execute()
            
            # Update realm count in Supabase
            realm = supabase.table("realms").select("*").eq("name", analysis["realm"]).execute()
            if realm.data:
                r_data = realm.data[0]
                supabase.table("realms").update({
                    "population": r_data.get("population", 0) + 1,
                    "today_count": r_data.get("today_count", 0) + 1
                }).eq("id", r_data["id"]).execute()
        except Exception as e:
            logger.error(f"Supabase DB error: {e}")
            raise HTTPException(status_code=500, detail="Database write failed")
            
    return DreamAnalysisResponse(
        dream_id=dream_id,
        symbols=analysis["symbols"],
        emotions=analysis["emotions"],
        archetype=analysis["archetype"],
        theme=analysis["theme"],
        realm=analysis["realm"],
        realm_color=analysis["realm_color"],
        insight=analysis["insight"],
        pattern_note=analysis["pattern_note"],
        created_at=created_at
    )


@app.get("/api/dream/history", response_model=DreamListResponse)
async def get_dream_history(
    page: int = 1,
    per_page: int = 10,
    realm: Optional[str] = None,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Retrieve user's dream history with pagination and filters."""
    global use_fallback_db
    items = []
    total = 0
    loaded = False
    
    if not use_fallback_db:
        try:
            query = supabase.table("dreams").select("*").eq("user_id", user["id"]).order("created_at", desc=True)
            if realm and realm != "All":
                query = query.eq("realm", realm)
                
            res = query.execute()
            total = len(res.data)
            
            start = (page - 1) * per_page
            end = start + per_page
            paginated = res.data[start:end]
            
            items = []
            for d in paginated:
                emotions = d.get("emotions", {})
                top_emotion = max(emotions, key=emotions.get) if emotions else "mystery"
                top_emotion_pct = emotions.get(top_emotion, 100)
                
                items.append(DreamListItem(
                    id=d["id"],
                    archetype=d["archetype"],
                    theme=d["theme"],
                    realm=d["realm"],
                    realm_color=REALM_COLORS.get(d["realm"], "#4A4A6A"),
                    top_emotion=top_emotion,
                    top_emotion_pct=top_emotion_pct,
                    preview=d["raw_text"][:100] + "..." if len(d["raw_text"]) > 100 else d["raw_text"],
                    created_at=d["created_at"]
                ))
            loaded = True
        except Exception as e:
            logger.warning(f"Supabase dream history query failed, enabling fallback DB mode: {e}")
            use_fallback_db = True

    if use_fallback_db or not loaded:
        all_dreams = [d for d in db_dreams.values() if d["user_id"] == user["id"]]
        if realm and realm != "All":
            all_dreams = [d for d in all_dreams if d["realm"] == realm]
            
        all_dreams.sort(key=lambda x: x["created_at"], reverse=True)
        total = len(all_dreams)
        
        # Paginate
        start = (page - 1) * per_page
        end = start + per_page
        paginated = all_dreams[start:end]
        
        items = []
        for d in paginated:
            emotions = d.get("emotions", {})
            top_emotion = max(emotions, key=emotions.get) if emotions else "mystery"
            top_emotion_pct = emotions.get(top_emotion, 100)
            
            items.append(DreamListItem(
                id=d["id"],
                archetype=d["archetype"],
                theme=d["theme"],
                realm=d["realm"],
                realm_color=d.get("realm_color", "#6C63FF"),
                top_emotion=top_emotion,
                top_emotion_pct=top_emotion_pct,
                preview=d["raw_text"][:100] + "..." if len(d["raw_text"]) > 100 else d["raw_text"],
                created_at=d["created_at"]
            ))
            
    return DreamListResponse(dreams=items, total=total, page=page, per_page=per_page)


@app.get("/api/dream/{dream_id}", response_model=DreamAnalysisResponse)
async def get_dream_detail(dream_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Get single dream analysis details by ID."""
    if use_fallback_db:
        dream = db_dreams.get(dream_id)
        if not dream or dream["user_id"] != user["id"]:
            raise HTTPException(status_code=404, detail="Dream not found")
        return DreamAnalysisResponse(
            dream_id=dream["id"],
            symbols=dream["symbols"],
            emotions=dream["emotions"],
            archetype=dream["archetype"],
            theme=dream["theme"],
            realm=dream["realm"],
            realm_color=dream.get("realm_color", "#6C63FF"),
            insight=dream["insight"],
            pattern_note=dream["pattern_note"],
            created_at=dream["created_at"]
        )
    else:
        try:
            res = supabase.table("dreams").select("*").eq("id", dream_id).execute()
            if not res.data or res.data[0]["user_id"] != user["id"]:
                raise HTTPException(status_code=404, detail="Dream not found")
            d = res.data[0]
            return DreamAnalysisResponse(
                dream_id=d["id"],
                symbols=d["symbols"],
                emotions=d["emotions"],
                archetype=d["archetype"],
                theme=d["theme"],
                realm=d["realm"],
                realm_color=REALM_COLORS.get(d["realm"], "#4A4A6A"),
                insight=d["insight"],
                pattern_note=d["pattern_note"],
                created_at=d["created_at"]
            )
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.warning(f"Supabase get_dream_detail failed, fallback to local lookup: {e}")
            dream = db_dreams.get(dream_id)
            if not dream or dream["user_id"] != user["id"]:
                raise HTTPException(status_code=404, detail="Dream not found")
            return DreamAnalysisResponse(
                dream_id=dream["id"],
                symbols=dream["symbols"],
                emotions=dream["emotions"],
                archetype=dream["archetype"],
                theme=dream["theme"],
                realm=dream["realm"],
                realm_color=dream.get("realm_color", "#6C63FF"),
                insight=dream["insight"],
                pattern_note=dream["pattern_note"],
                created_at=dream["created_at"]
            )


@app.get("/api/universe/realms", response_model=RealmListResponse)
async def get_universe_realms(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve all realms in the universe with collective stats."""
    global use_fallback_db
    realms_list = []
    total_dreamers = 0
    dreams_today = 0
    symbols_collected = []
    
    if not use_fallback_db:
        try:
            res = supabase.table("realms").select("*").execute()
            if not res.data:
                for r in DREAM_REALMS:
                    supabase.table("realms").insert({
                        "name": r["name"],
                        "color": r["color"],
                        "population": 150,
                        "today_count": 10,
                        "dominant_emotion": "mystery"
                    }).execute()
                res = supabase.table("realms").select("*").execute()
                
            for r in res.data:
                match = next((item for item in DREAM_REALMS if item["name"] == r["name"]), {"icon": "circle-off-outline"})
                realms_list.append(RealmInfo(
                    name=r["name"],
                    color=r["color"],
                    icon=match["icon"],
                    population=r.get("population", 0),
                    today_count=r.get("today_count", 0),
                    dominant_emotion=r.get("dominant_emotion", "mystery")
                ))
                total_dreamers += r.get("population", 0)
                dreams_today += r.get("today_count", 0)
        except Exception as e:
            logger.warning(f"Supabase realms query failed, enabling fallback DB mode: {e}")
            use_fallback_db = True

    if use_fallback_db:
        realms_list = []
        total_dreamers = 0
        dreams_today = 0
        symbols_collected = []
        for r in db_realms.values():
            realms_list.append(RealmInfo(
                name=r["name"],
                color=r["color"],
                icon=r["icon"],
                population=r["population"],
                today_count=r["today_count"],
                dominant_emotion=r["dominant_emotion"]
            ))
            total_dreamers += r["population"]
            dreams_today += r["today_count"]
            symbols_collected.extend(r["common_symbols"])
            
    most_common = "stars"
    if symbols_collected:
        most_common = max(set(symbols_collected), key=symbols_collected.count)
        
    return RealmListResponse(
        realms=realms_list,
        total_dreamers=total_dreamers if total_dreamers > 0 else 4231,
        dreams_today=dreams_today if dreams_today > 0 else 247,
        most_common_symbol=most_common
    )


@app.get("/api/universe/realm/{name}", response_model=RealmDetailResponse)
async def get_realm_details(name: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve individual realm details including collective chronicles."""
    global use_fallback_db
    if name not in db_realms:
        raise HTTPException(status_code=404, detail="Realm not found")
        
    user_visits = 0
    r = None
    
    if not use_fallback_db:
        try:
            res = supabase.table("realms").select("*").eq("name", name).execute()
            if not res.data:
                raise HTTPException(status_code=404, detail="Realm not found")
            r_db = res.data[0]
            
            visit_res = supabase.table("dreams").select("id").eq("user_id", user["id"]).eq("realm", name).execute()
            user_visits = len(visit_res.data)
            
            match = next((item for item in DREAM_REALMS if item["name"] == name), {"icon": "circle-off-outline"})
            r = {
                "name": r_db["name"],
                "color": r_db["color"],
                "icon": match["icon"],
                "population": r_db.get("population", 0),
                "today_count": r_db.get("today_count", 0),
                "dominant_emotion": r_db.get("dominant_emotion", "mystery"),
                "chronicle": r_db.get("chronicle", "The fabric of the realm remains quiet."),
                "common_symbols": ["flying", "climbing", "falling"]
            }
        except HTTPException as he:
            raise he
        except Exception as e:
            logger.warning(f"Supabase realm detail query failed, enabling fallback DB mode: {e}")
            use_fallback_db = True

    if use_fallback_db or not r:
        user_visits = sum(1 for d in db_dreams.values() if d["user_id"] == user["id"] and d["realm"] == name)
        r = db_realms[name]
        
    return RealmDetailResponse(
        name=r["name"],
        color=r["color"],
        icon=r["icon"],
        population=r["population"],
        today_count=r["today_count"],
        dominant_emotion=r["dominant_emotion"],
        chronicle=r["chronicle"],
        common_symbols=r["common_symbols"],
        emotions={"anxiety": 35, "wonder": 45, "fear": 20},
        user_visits=user_visits
    )


@app.get("/api/chronicle", response_model=ChronicleListResponse)
async def get_chronicles(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve recent AI collective stories generated for all realms."""
    global use_fallback_db
    items = []
    
    if not use_fallback_db:
        try:
            res = supabase.table("chronicles").select("*").order("created_at", desc=True).execute()
            for c in res.data:
                # Load realm color
                realm_res = supabase.table("realms").select("color, name").eq("id", c["realm_id"]).execute()
                realm_color = "#6C63FF"
                realm_name = "Unknown"
                if realm_res.data:
                    realm_color = realm_res.data[0]["color"]
                    realm_name = realm_res.data[0]["name"]
                    
                items.append(ChronicleItem(
                    id=c["id"],
                    realm_name=realm_name,
                    realm_color=realm_color,
                    story=c["story"],
                    dream_count=c.get("dream_count", 0),
                    generated_date=c.get("generated_date", date.today().isoformat())
                ))
        except Exception as e:
            logger.warning(f"Supabase chronicles query failed, enabling fallback DB mode: {e}")
            use_fallback_db = True

    if use_fallback_db or not items:
        items = []
        for c in db_chronicles:
            items.append(ChronicleItem(
                id=c["id"],
                realm_name=c["realm_name"],
                realm_color=c["realm_color"],
                story=c["story"],
                dream_count=c["dream_count"],
                generated_date=c["generated_date"]
            ))
            
    return ChronicleListResponse(chronicles=items, total=len(items))


@app.get("/api/profile/patterns", response_model=ProfileResponse)
async def get_profile_and_patterns(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve full user profile, streak counts, stats, and AI dream pattern analysis."""
    global use_fallback_db
    total_dreams = 0
    streak_count = 0
    realms_visited_set = set()
    days_active = 1
    recent_dreams = []
    
    loaded = False
    if not use_fallback_db:
        try:
            profile = supabase.table("profiles").select("*").eq("id", user["id"]).execute().data[0]
            streak_count = profile.get("streak_count", 0)
            total_dreams = profile.get("total_dreams", 0)
            
            dream_res = supabase.table("dreams").select("*").eq("user_id", user["id"]).execute()
            recent_dreams = dream_res.data
            for d in recent_dreams:
                realms_visited_set.add(d["realm"])
            loaded = True
        except Exception as e:
            logger.warning(f"Supabase profile/patterns query failed, enabling fallback DB mode: {e}")
            use_fallback_db = True

    if use_fallback_db or not loaded:
        user_profile = db_users.get(user["id"], {"total_dreams": 0, "streak_count": 0})
        streak_count = user_profile.get("streak_count", 0)
        
        all_dreams = [d for d in db_dreams.values() if d["user_id"] == user["id"]]
        total_dreams = len(all_dreams)
        recent_dreams = all_dreams
        for d in all_dreams:
            realms_visited_set.add(d["realm"])
            
    # Calculate days active from profile created_at
    created_at_str = user.get("created_at")
    if created_at_str:
        try:
            created_dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
            days_active = max(1, (datetime.utcnow().date() - created_dt.date()).days + 1)
        except Exception:
            pass
            
    # Determine most visited realm
    most_visited = None
    if recent_dreams:
        realm_counts = {}
        for d in recent_dreams:
            r = d.get("realm")
            if r:
                realm_counts[r] = realm_counts.get(r, 0) + 1
        most_visited = max(realm_counts, key=realm_counts.get) if realm_counts else None

    # Generate or fetch patterns
    pattern_analysis = "Record more dreams to let D-NET AI analyze your patterns."
    if total_dreams >= 2:
        pattern_analysis = await generate_pattern_analysis(recent_dreams)

    stats = ProfileStats(
        total_dreams=total_dreams,
        longest_streak=max(streak_count, total_dreams),
        realms_visited=len(realms_visited_set),
        days_active=days_active
    )
    
    return ProfileResponse(
        display_name=user.get("display_name", "Dreamer"),
        email=user.get("email", "dreamer@dnet.io"),
        stats=stats,
        most_visited_realm=most_visited,
        pattern_analysis=pattern_analysis,
        streak_count=streak_count
    )


@app.get("/api/stats/global", response_model=GlobalStatsResponse)
async def get_global_stats(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve high level global dream metrics."""
    total_dreamers = 4231
    dreams_today = 247
    most_common_symbol = "key"
    
    if not use_fallback_db:
        # Try count query
        try:
            profile_count = supabase.table("profiles").select("id", count="exact").execute()
            if profile_count.count:
                total_dreamers = profile_count.count
                
            dream_count_today = supabase.table("dreams").select("id", count="exact").filter("created_at", "gte", date.today().isoformat()).execute()
            if dream_count_today.count:
                dreams_today = dream_count_today.count
        except Exception:
            pass
            
    return GlobalStatsResponse(
        total_dreamers=total_dreamers,
        dreams_today=dreams_today,
        most_common_symbol=most_common_symbol,
        active_realms=len(DREAM_REALMS)
    )


@app.post("/api/chat", response_model=ChatResponse)
async def chat_with_guide(req: ChatRequest, user: Dict[str, Any] = Depends(get_current_user)):
    """Chat with the Dream Guide AI to discuss or recount a dream."""
    messages_list = [{"role": msg.role, "content": msg.content} for msg in req.messages]
    
    system_instruction = (
        "You are the D-NET Dream Guide. Your task is to converse with the user and help them recount their dream "
        "in a detailed, thoughtful manner. Ask clarifying questions, encourage them to describe emotions and symbols, "
        "and keep your responses concise, warm, professional, and therapeutic. Do not use emojis."
    )
    
    # Prepend system instruction
    messages_list.insert(0, {"role": "system", "content": system_instruction})
    
    response_text = await ai_chat(messages_list)
    return ChatResponse(response=response_text)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
