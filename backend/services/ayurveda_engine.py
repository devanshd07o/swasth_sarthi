import json
import os

MEDICINES_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "ayurvedic_medicines.json")

def load_ayurvedic_medicines():
    if os.path.exists(MEDICINES_FILE):
        with open(MEDICINES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

AYURVEDIC_MEDICINES = load_ayurvedic_medicines()

def calculate_prakriti_scores(prakriti_type: str) -> dict:
    """
    Calculates numerical Vata, Pitta, Kapha percentages based on assessment.
    """
    scores = {"vata": 33, "pitta": 33, "kapha": 34}
    p = (prakriti_type or "").lower()
    
    if "vata dominant" in p:
        scores = {"vata": 65, "pitta": 20, "kapha": 15}
    elif "pitta dominant" in p:
        scores = {"vata": 20, "pitta": 65, "kapha": 15}
    elif "kapha dominant" in p:
        scores = {"vata": 15, "pitta": 20, "kapha": 65}
    elif "vata-pitta" in p:
        scores = {"vata": 45, "pitta": 40, "kapha": 15}
    elif "pitta-kapha" in p:
        scores = {"vata": 15, "pitta": 45, "kapha": 40}
    elif "vata-kapha" in p:
        scores = {"vata": 45, "pitta": 15, "kapha": 40}
    elif "tridoshaja" in p or "sama" in p:
        scores = {"vata": 34, "pitta": 33, "kapha": 33}
        
    return scores

def generate_samprapti_ghataka(chief_complaints: str, prakriti: str, vikriti: str) -> dict:
    """
    Generates Ayurvedic Samprapti (Pathogenesis) clinical parameters.
    """
    text = (chief_complaints + " " + (vikriti or "")).lower()
    
    dosha = "Vata Pradhana"
    dushya = "Rasa, Rakta, Mamsa"
    srotas = "Annavaha & Rasavaha Srotas"
    udbhavasthana = "Amashaya (Stomach)"
    vyaktasthana = "Sarvanga (Systemic)"
    
    if any(k in text for k in ["joint", "knee", "pain", "shoola", "stiffness", "sandhi"]):
        dosha = "Vata-Kapha Pradhana"
        dushya = "Asthi, Majja, Mamsa, Sandhi"
        srotas = "Asthivaha & Majjavaha Srotas"
        udbhavasthana = "Pakvashaya (Colon)"
        vyaktasthana = "Janu Sandhi (Knee Joint)"
    elif any(k in text for k in ["acidity", "burning", "pitta", "amlapitta", "reflux", "ulcer"]):
        dosha = "Pitta Pradhana (Vidagdhajirna)"
        dushya = "Rasa, Rakta"
        srotas = "Annavaha Srotas"
        udbhavasthana = "Amashaya"
        vyaktasthana = "Uras & Kanthadasa (Chest & Throat)"
    elif any(k in text for k in ["fever", "cough", "kasa", "jwara", "cold", "kapha"]):
        dosha = "Kapha-Vata Pradhana"
        dushya = "Rasa, Dhatu"
        srotas = "Pranavaha Srotas"
        udbhavasthana = "Amashaya"
        vyaktasthana = "Phupphusa (Lungs)"
        
    return {
        "dosha": dosha,
        "dushya": dushya,
        "srotas_drishti": f"{srotas} (Sanga & Vimarga Gamana)",
        "udbhavasthana": udbhavasthana,
        "vyaktasthana": vyaktasthana,
        "agni_status": "Manda / Vishama Agni"
    }

def get_pathya_apathya_recommendation(prakriti: str, vikriti: str) -> dict:
    """
    Returns clinical Pathya (Do's) and Apathya (Don'ts) based on Dosha balance.
    """
    p = ((prakriti or "") + " " + (vikriti or "")).lower()
    
    if "pitta" in p:
        return {
            "pathya": [
                "Fresh Cow Milk, Ghee, Pomegranate (Dadima)",
                "Cooling herbal teas (Coriander seeds, Fennel)",
                "Barley (Yava), Rice, Moong Dal",
                "Sweet, Bitter (Tikta), and Astringent (Kashaya) tastes"
            ],
            "apathya": [
                "Excessive chili, spices, tamarind, vinegar",
                "Fried foods, alcohol, excessive coffee/tea",
                "Daytime sleeping (Diva Swapna), anger, sun exposure"
            ]
        }
    elif "vata" in p:
        return {
            "pathya": [
                "Warm, freshly cooked unctuous (Snigdha) food",
                "Garlic, Ginger, Sesame oil massage (Abhyanga)",
                "Wheat, Milk, Dates, Almonds, Warm water",
                "Sweet (Madhura), Sour (Amla), and Salty (Lavana) tastes"
            ],
            "apathya": [
                "Dry (Rooksha), cold, stale foods, raw salads",
                "Excessive fasting, irregular meal times",
                "Late night awakening (Ratri Jagarana), cold weather exposure"
            ]
        }
    else:
        return {
            "pathya": [
                "Light, dry, warm cooked food with Honey",
                "Barley, Bitter vegetables (Karela, Patola)",
                "Warm water with Trikatu churna",
                "Pungent (Katu), Bitter (Tikta), and Astringent tastes"
            ],
            "apathya": [
                "Heavy, oily, fried, cold food and drinks",
                "Curd, milk products at night, sweets",
                "Daytime sleep, sedentary lifestyle"
            ]
        }

def search_ayurvedic_medicines(query: str) -> list:
    if not query:
        return AYURVEDIC_MEDICINES[:8]
    q = query.lower()
    results = [
        m for m in AYURVEDIC_MEDICINES
        if q in m["name"].lower() or q in m["indications"].lower() or q in m["dosha"].lower()
    ]
    return results
