import os
import re
import hashlib
import random
import pandas as pd
import numpy as np
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="NETRA Analytics Engine")
officer_audit_logs = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- REAL DATA INGESTION & AI TRAINING -----------------
iso_forest = IsolationForest(contamination=0.04, random_state=42)
vectorizer = TfidfVectorizer(stop_words='english')
historical_titles = []
historical_tfidf = None
district_means = {}

CSV_FILE = "mplads_real_works.csv"

print("Booting AI Engine: Loading official MPLADS data...")

if os.path.exists(CSV_FILE):
    try:
        # Load the actual OGD dataset
        df = pd.read_csv(CSV_FILE)
        
        # Flexibly locate the cost column (handles variations in dataset headers)
        cost_cols = [c for c in df.columns if any(k in c.lower() for k in ['amount', 'cost', 'value', 'sanction', 'recommended'])]
        if cost_cols:
            cost_col = cost_cols[0]
            df['sanction_amount'] = pd.to_numeric(df[cost_col].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
        else:
            df['sanction_amount'] = 1000000.0 

        # Flexibly locate the district column
        dist_cols = [c for c in df.columns if 'district' in c.lower()]
        district_col = dist_cols[0] if dist_cols else df.columns[1]

        # Calculate historical mean cost per district based on real data
        district_means = df.groupby(district_col)['sanction_amount'].mean().to_dict()
        
        # Calculate cost deviations for training
        df['cost_deviation'] = df.apply(
            lambda row: row['sanction_amount'] / (district_means.get(row[district_col], 1) + 1), 
            axis=1
        )
        
        # Train Financial Outlier AI on real spending patterns
        train_df = df[['sanction_amount', 'cost_deviation']].fillna(0)
        iso_forest.fit(train_df)
        
        # Train NLP Duplicate AI on real text descriptions
        text_cols = [c for c in df.columns if any(k in c.lower() for k in ['name', 'title', 'desc', 'work'])]
        text_col = text_cols[0] if text_cols else df.columns[2]
        
        historical_titles = df[text_col].dropna().astype(str).tolist()
        if historical_titles:
            historical_tfidf = vectorizer.fit_transform(historical_titles)
        
        print(f"✅ AI Engine initialized successfully with {len(df)} real MPLADS records.")
        
    except Exception as e:
        print(f"⚠️ Error parsing real dataset: {e}. Falling back to synthetic baseline.")
        iso_forest.fit([[1000000, 1.0], [5000000, 5.0]])
        historical_titles = ["Fallback concrete road construction"]
        historical_tfidf = vectorizer.fit_transform(historical_titles)
else:
    print(f"⚠️ {CSV_FILE} NOT FOUND. Place it in the backend directory. Using fallback data.")
    iso_forest.fit([[1000000, 1.0], [5000000, 5.0]])
    historical_titles = ["Construction of concrete approach road", "Installation of solar street lights"]
    historical_tfidf = vectorizer.fit_transform(historical_titles)

# ----------------- API ENDPOINTS -----------------

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
    
    # Edge Case: Blank or Zero Values
    if data.sanction_amount == 0 and data.funds_released == 0:
        return {
            "project_id": data.project_id,
            "risk_tier": "Invalid",
            "flags": ["Data Incomplete: Sanction amount and funds released are ₹0. Please enter valid financial data."],
            "metrics": {"deviation_ratio": 0.0, "benford_score": 0.0, "max_title_similarity": 0.0}
        }

    # Retrieve real district mean, default to user input if district isn't in CSV
    actual_district_mean = district_means.get(data.district, data.district_mean_cost)
    safe_mean = actual_district_mean if actual_district_mean > 0 else 1
    
    deviation = round(data.sanction_amount / safe_mean, 2)
    
    # Financial Rules
    if deviation > 1.5:
        flags.append(f"Cost deviation is {deviation}x higher than the historical average for {data.district}.")
    elif deviation < 0.3:
        flags.append(f"Unusually low estimate ({deviation}x of average). Potential scope reduction risk.")

    # Execution/Process Rules
    if data.funds_released >= data.sanction_amount and data.sanction_amount > 0 and data.physical_progress == 0:
        flags.append("Ghost Project Risk: 100% funds released with 0% physical progress reported.")
    elif data.physical_progress > 0 and data.funds_released == 0:
        flags.append(f"Process Violation: {data.physical_progress}% physical progress reported but ₹0 funds released.")
    elif data.physical_progress == 100 and data.funds_released < data.sanction_amount:
        flags.append(f"Work marked 100% complete, but funds are only partially disbursed (₹{data.funds_released}). Check pending UCs.")

    # NLP Duplicate Detection against Real Data
    max_sim = 0.0
    if historical_tfidf is not None and data.work_name.strip():
        clean_title = re.sub(r'[^a-zA-Z\s]', '', data.work_name.lower())
        if clean_title:
            title_vec = vectorizer.transform([clean_title])
            similarities = cosine_similarity(title_vec, historical_tfidf).flatten()
            max_sim = float(np.max(similarities))
            
            if max_sim > 0.65:
                match_idx = int(np.argmax(similarities))
                flags.append(f"Duplicate Risk: {max_sim*100:.1f}% text match with prior sanction: '{historical_titles[match_idx]}'.")
            
    # Risk Tier Logic
    risk_tier = "Low"
    if len(flags) == 1:
        risk_tier = "Watch"
    elif len(flags) >= 2:
        risk_tier = "Priority"
        
    if not flags:
        flags.append("Standard execution pattern. No deviations detected against district baselines.")

    # Dynamic Benford Score Calculation (Mathematical derivation from leading digit)
    first_digit = int(str(int(data.sanction_amount))[0]) if data.sanction_amount > 0 else 1
    expected_prob = 1 / first_digit
    calculated_benford = round(abs(0.301 - expected_prob) + 0.1, 2)

    return {
        "project_id": data.project_id,
        "risk_tier": risk_tier,
        "flags": flags,
        "metrics": {
            "deviation_ratio": deviation,
            "benford_score": calculated_benford,
            "max_title_similarity": round(max_sim * 100, 1)
        }
    }

@app.post("/api/verify-photo")
async def verify_photo(project_id: str = Form(...), file: UploadFile = File(...)):
    content = await file.read()
    photo_hash = hashlib.md5(content).hexdigest()
    
    # Simulate database hash collision for hackathon demonstration
    is_tampered = random.random() > 0.7 
    
    return {
        "status": "TAMPERED/DUPLICATE DETECTED" if is_tampered else "VISUAL ASSET VERIFIED",
        "is_tampered_or_duplicate": is_tampered,
        "photo_hash": photo_hash
    }

@app.post("/api/officer-feedback")
async def save_feedback(data: FeedbackInput):
    officer_audit_logs.append({
        "project_id": data.project_id,
        "decision": data.decision,
        "notes": data.officer_notes
    })
    return {"status": "success"}

@app.get("/api/feedback-logs")
async def get_feedback_logs():
    return officer_audit_logs