import os
import json
import urllib.request
import logging
from typing import List
from sqlalchemy.orm import Session
from app.models.models import Restaurant, Review
from app.schemas.schemas import AIRecommendRequest, AIRestaurantPick, RestaurantOut, AIChatRequest, AIChatResponse, AIFilters

logger = logging.getLogger(__name__)

MOOD_KEYWORDS = {
    "romantic date": ["rooftop", "candlelight", "fine dining", "italian", "wine", "romantic", "intimate", "cocktails", "lounge", "ambiance"],
    "casual hangout": ["cafe", "coffee", "burgers", "pizza", "bistro", "outdoor seating", "casual", "friends", "chill", "snacks", "fast food"],
    "family dinner": ["family", "buffet", "thali", "north indian", "south indian", "chinese", "spacious", "traditional", "dine-in", "kids"],
    "party / celebration": ["bar", "pub", "nightlife", "cocktails", "drinks", "dance", "dj", "club", "party", "celebration", "microbrewery"],
    "late night munchies": ["midnight", "24/7", "late night", "delivery", "fast food", "biryani", "street food", "shawarma", "snacks"],
    "work / client meeting": ["cafe", "coffee", "quiet", "bakery", "wifi", "elegant", "formal", "tea", "bistro", "breakfast"],
    "healthy / clean eating": ["salad", "healthy", "vegan", "gluten-free", "organic", "soup", "diet", "pure veg", "grill", "fresh"],
}

MOOD_REASONS = {
    "romantic date": "Features a wonderful intimate setting and premium vibe perfect for a romantic evening out.",
    "casual hangout": "Has a lively, relaxed atmosphere and crowd-favorite dishes perfect for catching up with friends.",
    "family dinner": "Offers a welcoming, spacious dining experience with a versatile menu that appeals to all age groups.",
    "party / celebration": "Boasts an energetic vibe, excellent beverages, and upbeat ambiance ideal for celebrating special moments.",
    "late night munchies": "Known for quick service and lip-smacking comfort food that perfectly satisfies late-night cravings.",
    "work / client meeting": "Provides a quiet, sophisticated setting with great coffee and prompt service suitable for discussions.",
    "healthy / clean eating": "Focuses on fresh, nutritious ingredients and wholesome recipes that align with clean eating goals.",
}


def get_ai_recommendations(req: AIRecommendRequest, db: Session) -> List[AIRestaurantPick]:
    query = db.query(Restaurant)
    if req.city and req.city.lower() not in ["all", "any"]:
        query = query.filter(Restaurant.city.ilike(f"%{req.city}%"))

    if req.budget == "budget":
        query = query.filter(Restaurant.cost <= 500)
    elif req.budget == "mid":
        query = query.filter(Restaurant.cost >= 500, Restaurant.cost <= 1200)
    elif req.budget == "premium":
        query = query.filter(Restaurant.cost >= 1200)

    if req.cuisine and req.cuisine.lower() not in ["any", "all categories", ""]:
        query = query.filter(Restaurant.cuisines.ilike(f"%{req.cuisine}%"))

    candidates = query.order_by(Restaurant.avg_rating.desc()).limit(40).all()

    # Fallback if filters were too restrictive
    if len(candidates) < 3:
        fallback_query = db.query(Restaurant)
        if req.city and req.city.lower() not in ["all", "any"]:
            fallback_query = fallback_query.filter(Restaurant.city.ilike(f"%{req.city}%"))
        candidates = fallback_query.order_by(Restaurant.avg_rating.desc()).limit(20).all()

    if not candidates:
        return []

    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        try:
            return _call_gemini_api(req, candidates, gemini_key, db)
        except Exception as e:
            logger.error(f"Gemini API error, falling back to heuristic: {e}")

    return _heuristic_recommendations(req, candidates, db)


def _heuristic_recommendations(req: AIRecommendRequest, candidates: List[Restaurant], db: Session) -> List[AIRestaurantPick]:
    scored = []
    mood_key = req.mood.lower().strip() if req.mood else ""
    keywords = MOOD_KEYWORDS.get(mood_key, ["delicious", "fresh", "great"])
    default_reason_suffix = MOOD_REASONS.get(mood_key, "Highly acclaimed by guests for exceptional service and delightful food quality.")

    for r in candidates:
        base_score = (r.avg_rating / 5.0) * 45
        sentiment = r.sentiment_score if r.sentiment_score is not None else 0.7
        sentiment_score = sentiment * 30

        text_to_search = f"{r.name} {r.cuisines or ''} {r.collections or ''} {r.category or ''}".lower()
        keyword_matches = sum(1 for kw in keywords if kw in text_to_search)
        mood_bonus = min(25, keyword_matches * 8)

        if req.notes:
            notes_words = [w.strip() for w in req.notes.lower().split() if len(w) > 3]
            if any(nw in text_to_search for nw in notes_words):
                mood_bonus += 10

        total_score = min(99, max(78, int(base_score + sentiment_score + mood_bonus)))

        # Build custom reason
        cuisines_str = r.cuisines or "delicious dishes"
        primary_cuisine = cuisines_str.split(",")[0].strip()
        reason = f"Perfect match for '{req.mood}'! Featuring top-notch {primary_cuisine} (★{r.avg_rating}). {default_reason_suffix}"
        if req.notes:
            reason += " Handpicked to match your specific taste preferences."

        # Convert ORM to Pydantic RestaurantOut
        rest_out = RestaurantOut.from_orm(r)
        scored.append((total_score, rest_out, reason))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_picks = scored[:4]

    results = []
    for score, rest_out, reason in top_picks:
        results.append(AIRestaurantPick(
            restaurant=rest_out,
            match_score=score,
            reason=reason
        ))

    return results


def _call_gemini_api(req: AIRecommendRequest, candidates: List[Restaurant], api_key: str, db: Session) -> List[AIRestaurantPick]:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    cand_data = []
    for r in candidates[:15]:
        cand_data.append({
            "id": r.id,
            "name": r.name,
            "cuisines": r.cuisines,
            "cost": r.cost,
            "rating": r.avg_rating,
            "collections": r.collections,
            "area": r.area
        })

    prompt = f"""
You are an expert AI Food Concierge for Foodlytics.
A user is looking for restaurant recommendations in {req.city}.
User's Mood/Vibe: {req.mood}
Preferred Cuisine: {req.cuisine}
Budget Level: {req.budget}
Additional Notes: {req.notes}

Here are the candidate restaurants:
{json.dumps(cand_data, indent=2)}

Select the top 4 best matching restaurants for the user based on their mood, cuisine, and budget.
For each selected restaurant, provide:
1. "id": the restaurant ID
2. "match_score": an integer between 85 and 99 representing how well it matches
3. "reason": a 2-sentence engaging and persuasive explanation tailored specifically to the user's mood and notes.

Output strictly valid JSON in this structure:
[
  {{"id": 101, "match_score": 98, "reason": "..."}}
]
"""
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"response_mime_type": "application/json"}
    }

    req_obj = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )

    with urllib.request.urlopen(req_obj, timeout=10) as response:
        res_body = response.read()
        res_json = json.loads(res_body.decode("utf-8"))
        
        text_resp = res_json["candidates"][0]["content"]["parts"][0]["text"]
        text_resp = text_resp.strip().removeprefix("```json").removesuffix("```").strip()
        ai_picks = json.loads(text_resp)

        cand_map = {r.id: r for r in candidates}
        results = []
        for item in ai_picks:
            r_id = item.get("id")
            if r_id in cand_map:
                r_orm = cand_map[r_id]
                rest_out = RestaurantOut.from_orm(r_orm)
                results.append(AIRestaurantPick(
                    restaurant=rest_out,
                    match_score=item.get("match_score", 95),
                    reason=item.get("reason", "Selected by AI Concierge.")
                ))

        if not results:
            return _heuristic_recommendations(req, candidates, db)
        return results[:4]


def process_ai_chat(req: AIChatRequest, db: Session) -> AIChatResponse:
    gemini_key = os.getenv("GEMINI_API_KEY")
    filters_data = {}
    message = "Here are some recommendations based on your request!"

    if gemini_key:
        prompt = f"""
You are an expert AI Food Concierge. A user is asking for restaurant recommendations in '{req.city}'.
User Query: "{req.query}"

Task 1: Extract structured filters from the user query.
- mood: (string or null, e.g., romantic, professional, energetic)
- cuisine: (string or null, e.g., Italian, Chinese, Cafe)
- budget: ("budget", "mid", "premium", or null)
- ambience: (string or null, e.g., rooftop, quiet, outdoor)
- occasion: (string or null, e.g., date, meeting, party)
- dining_type: (string or null, e.g., dine-in, buffet)
- timing: (string or null, e.g., late night, breakfast)

Task 2: Write a short, friendly, personalized introduction message acknowledging their request (e.g., "These cafes are suitable for work because..."). Do not list the restaurants, just give the intro text.

Respond ONLY with valid JSON matching this exact structure:
{{
  "filters": {{
    "mood": null,
    "cuisine": null,
    "budget": null,
    "ambience": null,
    "occasion": null,
    "dining_type": null,
    "timing": null
  }},
  "message": "your intro message here"
}}
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={gemini_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }

        try:
            req_obj = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req_obj, timeout=10) as response:
                res_body = response.read()
                res_json = json.loads(res_body.decode("utf-8"))
                text_resp = res_json["candidates"][0]["content"]["parts"][0]["text"]
                text_resp = text_resp.strip().removeprefix("```json").removesuffix("```").strip()
                parsed = json.loads(text_resp)
                filters_data = parsed.get("filters", {})
                message = parsed.get("message", message)
        except Exception as e:
            logger.error(f"Gemini API error during intent extraction: {e}")

    # Fallback or clean up filters
    filters = AIFilters(**filters_data)

    # Query DB based on filters
    query = db.query(Restaurant)
    if req.city and req.city.lower() not in ["all", "any"]:
        query = query.filter(Restaurant.city.ilike(f"%{req.city}%"))

    if filters.budget == "budget":
        query = query.filter(Restaurant.cost <= 500)
    elif filters.budget == "mid":
        query = query.filter(Restaurant.cost >= 500, Restaurant.cost <= 1200)
    elif filters.budget == "premium":
        query = query.filter(Restaurant.cost >= 1200)

    if filters.cuisine:
        query = query.filter(Restaurant.cuisines.ilike(f"%{filters.cuisine}%"))

    candidates = query.order_by(Restaurant.avg_rating.desc()).limit(100).all()

    # Score candidates based on other filters
    scored = []
    
    # Collect search terms from other filters
    search_terms = []
    for f_val in [filters.mood, filters.ambience, filters.occasion, filters.dining_type, filters.timing]:
        if f_val:
            search_terms.extend([t.lower().strip() for t in f_val.split()])

    for r in candidates:
        base_score = (r.avg_rating / 5.0) * 50
        sentiment = r.sentiment_score if r.sentiment_score is not None else 0.7
        sentiment_score = sentiment * 20
        
        text_to_search = f"{r.name} {r.cuisines or ''} {r.collections or ''} {r.category or ''}".lower()
        
        bonus = 0
        matches = 0
        for term in search_terms:
            if len(term) > 3 and term in text_to_search:
                bonus += 10
                matches += 1
                
        total_score = min(99, max(75, int(base_score + sentiment_score + bonus)))
        
        # Determine reason
        reason_parts = []
        if matches > 0:
            reason_parts.append("Matches your specific preferences.")
        if r.avg_rating >= 4.5:
            reason_parts.append("Highly rated by users.")
        reason = " ".join(reason_parts) if reason_parts else "A great option based on your query."
        
        rest_out = RestaurantOut.from_orm(r)
        scored.append((total_score, rest_out, reason))

    scored.sort(key=lambda x: x[0], reverse=True)
    top_picks = scored[:4]

    results = []
    for score, rest_out, reason in top_picks:
        results.append(AIRestaurantPick(
            restaurant=rest_out,
            match_score=score,
            reason=reason
        ))

    return AIChatResponse(
        filters=filters,
        message=message,
        restaurants=results
    )
