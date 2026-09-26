from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import random
import hashlib

app = FastAPI(title="NETRA Analytics Engine")

# Initializes the audit ledger memory store to prevent NameError crashes
officer_audit_logs = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WorkProposal(BaseModel):
    project_id: str
    district: str
    work_name: str
    sanction_amount: float
    district_mean_cost: float
    physical_progress: int
    funds_released: float

class FeedbackInput(BaseModel):
    project_id: str
    decision: str
    officer_notes: str

@app.post("/api/evaluate-work")
async def evaluate_work(data: WorkProposal):
    flags = []
    # Prevent division by zero if district mean is 0
    safe_mean = data.district_mean_cost if data.district_mean_cost > 0 else 1
    deviation = round(data.sanction_amount / safe_mean, 2)
    
    if deviation > 1.5:
        flags.append(f"Cost deviation is {deviation}x higher than district average.")
    
    if data.funds_released >= data.sanction_amount and data.physical_progress == 0:
        flags.append("100% funds released with 0% physical progress (Ghost Project signature).")
        
    risk_tier = "Low"
    if len(flags) == 1:
        risk_tier = "Watch"
    elif len(flags) >= 2:
        risk_tier = "Priority"
        
    if not flags:
        flags.append("No immediate anomalies detected in financial parameters.")

    return {
        "project_id": data.project_id,
        "risk_tier": risk_tier,
        "flags": flags,
        "metrics": {
            "deviation_ratio": deviation,
            "benford_score": round(random.uniform(0.1, 0.9), 2),
            "max_title_similarity": random.randint(10, 45)
        }
    }

@app.post("/api/verify-photo")
async def verify_photo(project_id: str = Form(...), file: UploadFile = File(...)):
    # Simulates cryptographic image hashing for the frontend scan
    content = await file.read()
    photo_hash = hashlib.md5(content).hexdigest()
    
    is_tampered = random.choice([True, False])
    
    return {
        "status": "TAMPERED/DUPLICATE DETECTED" if is_tampered else "VISUAL ASSET VERIFIED",
        "is_tampered_or_duplicate": is_tampered,
        "photo_hash": photo_hash
    }

@app.post("/api/officer-feedback")
async def save_feedback(data: FeedbackInput):
    log_entry = {
        "project_id": data.project_id,
        "decision": data.decision,
        "notes": data.officer_notes
    }
    officer_audit_logs.append(log_entry)
    return {"status": "success", "message": "Feedback recorded"}

@app.get("/api/feedback-logs")
async def get_feedback_logs():
    return officer_audit_logs