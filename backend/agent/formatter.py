from backend.types import FinalAnswer, UserProfile

TRIBUNAL_MAP = {
    "casablanca": "المحكمة الابتدائية بالدار البيضاء - شارع الحسن الثاني",
    "khenifra": "المحكمة الابتدائية بخنيفرة - وسط المدينة",
    # Mock data for demonstration
}

def format_answer(answer: FinalAnswer, profile: UserProfile) -> FinalAnswer:
    """
    Appends nearest tribunal and lawyer referral banners if needed.
    (Register adaptation is primarily handled during the Primary Agent prompt, 
    but we can do additional string adjustments here).
    """
    formatted_text = answer.answer_darija
    
    if profile.literacy_score < 0.35:
        # Simple register: we could strip out complex citations using regex, but for now we rely on the LLM's initial generation
        pass 
        
    # Append Tribunal Info based on Wilaya
    wilaya = profile.wilaya.lower()
    if wilaya in TRIBUNAL_MAP:
        formatted_text += f"\n\nمعلومة إضافية: تقدر تمشي لـ {TRIBUNAL_MAP[wilaya]}."
        
    # Append Lawyer Banner if confidence was low
    if answer.recommend_lawyer:
        banner = "\n\n⚠️ هاد الحالة معقدة شوية. كنصحك تمشي لمحامي باش يعطيك استشارة دقيقة."
        formatted_text += banner
        
    # Return a new FinalAnswer object with the formatted string
    return FinalAnswer(
        answer_darija=formatted_text,
        citations=answer.citations,
        confidence=answer.confidence,
        recommend_lawyer=answer.recommend_lawyer
    )
