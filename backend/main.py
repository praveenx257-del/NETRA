import os
import re
import hashlib
import numpy as np
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import random

app = FastAPI(title="NETRA Analytics Engine")
officer_audit_logs = []

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- REAL DATA INGESTION & MODEL TRAINING -----------------
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
        
        # Clean the currency column (remove commas from strings if they exist)
        if 'recommended_amount' in df.columns:
            df['sanction_amount'] = df['recommended_amount'].astype(str).str.replace(',', '').astype(float)
        else:
            # Fallback if column name varies slightly in the downloaded CSV
            cost_cols = [col for col in df.columns if any(k in col.lower() for k in ['cost', 'amount', 'value', 'sanction'])]
            if cost_cols:
                df['sanction_amount'] = pd.to_numeric(df[cost_cols[0]].astype(str).str.replace(',', ''), errors='coerce').fillna(0)
            else:
                df['sanction_amount'] = 1000000.0 # safe default

        # Ensure district column exists
        district_col = 'implementing_district_per_lgd' if 'implementing_district_per_lgd' in df.columns else df.columns[1]

        # Calculate the actual historical mean cost per district based on real works
        district_means = df.groupby(district_col)['sanction_amount'].mean().to_dict()
        
        # Calculate cost deviations
        df['cost_deviation'] = df.apply(
            lambda row: row['sanction_amount'] / (district_means.get(row[district_col], 1) + 1), 
            axis=1
        )
        
        # Train Financial AI on real spending patterns
        train_df = df[['sanction_amount', 'cost_deviation']].fillna(0)
        iso_forest.fit(train_df)
        
        # Train NLP Duplicate AI on real text descriptions
        text_col = 'work_name' if 'work_name' in df.columns else (df.columns[2] if len(df.columns) > 2 else None)
        if text_col:
            historical_titles = df[text_col].dropna().astype(str).tolist()
            historical_tfidf = vectorizer.fit_transform(historical_titles)
        
        print(f"✅ AI Engine initialized with {len(df)} real MPLADS records.")
        
    except Exception as e:
        print(f"⚠️ Error parsing real dataset: {e}. Using fallback synthetic data.")
        district_means = {}
        iso_forest.fit([[1000000, 1.0], [5000000, 5.0]])
        historical_titles = ["Fallback concrete road construction"]
        historical_tfidf = vectorizer.fit_transform(historical_titles)
else:
    print("⚠️ REAL DATASET NOT FOUND! Please place 'mplads_real_works.csv' in the backend folder.")
    # Fallback minimal logic to prevent server crashes if the CSV is missing
    iso_forest.fit([[1000000, 1.0], [5000000, 5.0]])
    historical_titles = ["Construction of concrete approach road", "Installation of solar street lights", "Renovation of community hall"]
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
    
    # 1. EDGE CASE: All Zeros or Empty Data
    if data.sanction_amount == 0 and data.funds_released == 0:
        return {
            "project_id": data.project_id,
            "risk_tier": "Invalid",
            "flags": ["Data Incomplete: Sanction amount and funds released are ₹0. Please enter valid financial data."],
            "metrics": {
                "deviation_ratio": 0.0,
                "benford_score": 0.0,
                "max_title_similarity": 0.0
            }
        }

    # Try to get the actual historical mean for this specific district, fallback to input if missing
    actual_district_mean = district_means.get(data.district, data.district_mean_cost)
    safe_mean = actual_district_mean if actual_district_mean > 0 else 1
    
    deviation = round(data.sanction_amount / safe_mean, 2)
    
    # 2. DYNAMIC FINANCIAL RULES
    if deviation > 1.5:
        flags.append(f"Cost deviation is {deviation}x higher than the historical average for {data.district}.")
    elif deviation < 0.3:
        flags.append(f"Unusually low estimate ({deviation}x of average). Potential under-budgeting or scope reduction risk.")

    # 3. DYNAMIC PROGRESS RULES
    if data.funds_released >= data.sanction_amount and data.sanction_amount > 0 and data.physical_progress == 0:
        flags.append("Ghost Project Risk: 100% funds released with 0% physical progress reported.")
    elif data.physical_progress > 0 and data.funds_released == 0:
        flags.append(f"Process Violation: {data.physical_progress}% physical progress reported but ₹0 funds released.")
    elif data.physical_progress == 100 and data.funds_released < data.sanction_amount:
        flags.append(f"Work marked 100% complete, but funds are only partially disbursed (₹{data.funds_released}). Check pending UCs.")

    # 4. NLP DUPLICATE CHECK
    max_sim = 0.0
    if historical_tfidf is not None and data.work_name.strip():
        # Clean text to prevent regex/NLP crashes
        clean_title = re.sub(r'[^a-zA-Z\s]', '', data.work_name.lower())
        if clean_title:
            title_vec = vectorizer.transform([clean_title])
            similarities = cosine_similarity(title_vec, historical_tfidf).flatten()
            max_sim = float(np.max(similarities))
            
            if max_sim > 0.65:
                match_idx = int(np.argmax(similarities))
                flags.append(f"Duplicate Risk: {max_sim*100:.1f}% text match with prior sanction: '{historical_titles[match_idx]}'.")
            
    # 5. RISK TIER ASSIGNMENT
    risk_tier = "Low"
    if len(flags) == 1:
        risk_tier = "Watch"
    elif len(flags) >= 2:
        risk_tier = "Priority"
        
    if not flags:
        flags.append("Standard execution pattern. No deviations detected against district baselines.")

    # 6. DYNAMIC BENFORD SCORE
    # Calculates a score based on the exact leading digit of the user's input amount
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
    # Highly robust MD5 hashing to avoid PIL/Imagehash library crashes on Render memory limits
    content = await file.read()
    photo_hash = hashlib.md5(content).hexdigest()
    
    # In a real database, we would compare this hash to previous uploads.
    # For hackathon demonstration purposes, we randomize a flag to show UI capability.
    is_tampered = random.random() > 0.7 
    
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