import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import patients, cases, ai_assist, auth, emergency, doctors, hospitals
from seed_data import seed_database
from config import settings
from services.ayurveda_engine import search_ayurvedic_medicines, calculate_prakriti_scores, generate_samprapti_ghataka, get_pathya_apathya_recommendation

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SwasthSaarthi — AyurSaarthi & MedRoute Engine",
    description="Ministry of Ayush SIH26047 Solution - AyurSaarthi AI Digital Case Sheet & MedRoute Emergency Routing Engine",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(patients.router)
app.include_router(cases.router)
app.include_router(doctors.router)
app.include_router(ai_assist.router)
app.include_router(auth.router)
app.include_router(emergency.router)
app.include_router(hospitals.router)

@app.on_event("startup")
def startup_event():
    print(f"[+] Starting SwasthSaarthi v2.0 Engine...")
    seed_database()

@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "SwasthSaarthi Backend"}

@app.get("/")
@app.head("/")
def root():
    return {
        "status": "online",
        "system": "SwasthSaarthi — AyurSaarthi AI Platform & MedRoute Engine (SIH26047)",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.get("/health")
@app.head("/health")
def health_check():
    return {"status": "healthy", "service": "SwasthSaarthi Backend"}

@app.get("/api/ayurveda/medicines")
def search_medicines(query: str = ""):
    return search_ayurvedic_medicines(query)

@app.get("/api/ayurveda/prakriti-scores")
def get_prakriti_breakdown(prakriti_type: str):
    return calculate_prakriti_scores(prakriti_type)

@app.get("/api/ayurveda/samprapti")
def get_samprapti(chief_complaints: str, prakriti: str = "", vikriti: str = ""):
    return generate_samprapti_ghataka(chief_complaints, prakriti, vikriti)

@app.get("/api/ayurveda/pathya-apathya")
def get_pathya_advice(prakriti: str = "", vikriti: str = ""):
    return get_pathya_apathya_recommendation(prakriti, vikriti)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
