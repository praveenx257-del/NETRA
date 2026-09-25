import io
import re
import numpy as np
import pandas as pd
from PIL import Image
import imagehash
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sklearn.ensemble import IsolationForest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI(title="NETRA AI Risk Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- OFFICIAL DATA MODEL TRAINING -----------------
import os

print("Booting AI Engine: Loading official MPLADS data...")
csv_path = "official_mplads_works.csv"

if os.path.exists(csv_path):
    official_df = pd.read_csv(csv_path)
    
    # 1. Dynamically find the financial and text columns in the official dataset
    cost_col = [col for col in official_df.columns if 'cost' in col.lower() or 'amount' in col.lower() or 'value' in col.lower()][0]
    text_col = [col for col in official_df.columns if 'work' in col.lower() or 'description' in col.lower() or 'activity' in col.lower()][0]
    
    # 2. Clean the financial data for the Isolation Forest
    official_df[cost_col] = pd.to_numeric(official_df[cost_col], errors='coerce').fillna(0)
    district_mean = official_df[cost_col].mean()
    
    train_df = pd.DataFrame({
        'sanction_amount': official_df[cost_col],
        'cost_deviation': official_df[cost_col] / (district_mean + 1)
    })
    
    # Train financial anomaly detector on real MoSPI cost distributions
    iso_forest = IsolationForest(contamination=0.04, random_state=42)
    iso_forest.fit(train_df[['sanction_amount', 'cost_deviation']])
    
    # 3. Clean the text data for the NLP duplicate detector
    historical_titles = official_df[text_col].dropna().astype(str).tolist()
    
    # Train NLP vectorizer on real historical work descriptions
    vectorizer = TfidfVectorizer(stop_words='english', max_features=10000)
    historical_tfidf = vectorizer.fit_transform(historical_titles)
    
    print(f"✅ AI successfully trained on {len(official_df)} official MPLADS records.")
else:
    print("⚠️ 'official_mplads_works.csv' not found. Falling back to synthetic safe-mode baseline.")
    # (Fallback synthetic code from before can remain here just in case)
    baseline_costs = np.random.uniform(500000, 3000000, 200)
    baseline_deviations = np.random.uniform(0.9, 1.2, 200)
    train_df = pd.DataFrame({'sanction_amount': baseline_costs, 'cost_deviation': baseline_deviations})
    iso_forest = IsolationForest(contamination=0.04, random_state=42)
    iso_forest.fit(train_df[['sanction_amount', 'cost_deviation']])
    
    historical_titles = ["Construction of concrete road", "Solar street lights", "Water tank"]
    vectorizer = TfidfVectorizer(stop_words='english')
    historical_tfidf = vectorizer.fit_transform(historical_titles)

known_image_hashes = {}
# ----------------------------------------------------------------
# ----------------- DETECTION FUNCTIONS -----------------
def run_benfords_test(amount: float) -> float:
    """Computes deviation score against Benford's Law expected distribution."""
    first_digit = int(str(abs(int(amount)))[0]) if amount > 0 else 1
    observed_prob = 1.0
    expected_prob = np.log10(1 + (1 / first_digit))
    return round(float(abs(observed_prob - expected_prob) * 100), 2)

# ----------------- API ENDPOINTS -----------------
class WorkProposal(BaseModel):
    project_id: str
    district: str
    work_name: str
    sanction_amount: float
    district_mean_cost: float
    physical_progress: int
    funds_released: float

@app.post("/api/evaluate-work")
def evaluate_work(proposal: WorkProposal):
    flags = []
    points = 0

    # 1. Financial Anomaly via Isolation Forest
    deviation = proposal.sanction_amount / (proposal.district_mean_cost + 1)
    iso_pred = iso_forest.predict([[proposal.sanction_amount, deviation]])[0]
    if iso_pred == -1:
        flags.append(f"Financial Outlier: Sanction deviates {deviation:.2f}x from district baseline.")
        points += 35

    # 2. Ghost Project Detection (High fund release with 0% progress)
    if proposal.physical_progress == 0 and proposal.funds_released >= (proposal.sanction_amount * 0.5):
        flags.append("Execution Anomaly: Funds >50% released while physical progress is 0%.")
        points += 40

    # 3. Benford's Number Test
    benford_dev = run_benfords_test(proposal.sanction_amount)
    if benford_dev > 70.0:
        flags.append(f"Benford Pattern Alert: Leading digit deviation index ({benford_dev}).")
        points += 15

    # 4. NLP Duplicate Detection
    clean_title = re.sub(r'[^a-zA-Z\s]', '', proposal.work_name.lower())
    title_vec = vectorizer.transform([clean_title])
    similarities = cosine_similarity(title_vec, historical_tfidf).flatten()
    max_sim = float(np.max(similarities))
    if max_sim > 0.65:
        match_idx = int(np.argmax(similarities))
        flags.append(f"Duplicate Work Risk: {max_sim*100:.1f}% text match with: '{historical_titles[match_idx]}'.")
        points += 30

    # 5. Risk Tier Assignment[cite: 1]
    if points >= 60:
        tier = "Priority"
    elif points >= 35:
        tier = "Review"
    elif points >= 15:
        tier = "Watch"
    else:
        tier = "Low"

    return {
        "project_id": proposal.project_id,
        "risk_tier": tier,
        "composite_score": min(points, 100),
        "flags": flags if flags else ["Normal baseline execution. No anomalies identified."],
        "metrics": {
            "deviation_ratio": round(deviation, 2),
            "benford_score": benford_dev,
            "max_title_similarity": round(max_sim * 100, 1)
        }
    }

@app.post("/api/verify-photo")
async def verify_photo(project_id: str = Form(...), file: UploadFile = File(...)):
    """Photo Forensics: Uses perceptual hashing (pHash) to catch re-used photographs[cite: 1]."""
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))
    computed_hash = str(imagehash.phash(image))

    is_duplicate = False
    matching_project = None

    for pid, existing_hash in known_image_hashes.items():
        if pid != project_id:
            diff = imagehash.hex_to_hash(computed_hash) - imagehash.hex_to_hash(existing_hash)
            if diff <= 4:  # Perceptual match threshold
                is_duplicate = True
                matching_project = pid
                break

    known_image_hashes[project_id] = computed_hash

    return {
        "project_id": project_id,
        "photo_hash": computed_hash,
        "is_tampered_or_duplicate": is_duplicate,
        "duplicate_matched_with": matching_project,
        "status": "FLAGGED: Re-uploaded existing asset photo." if is_duplicate else "VERIFIED: Original image structure."
    }

class FeedbackSubmission(BaseModel):
    project_id: str
    decision: str  # "Valid Anomaly" or "False Positive"[cite: 1]
    officer_notes: str

@app.post("/api/officer-feedback")
def record_feedback(entry: FeedbackSubmission):
    officer_audit_logs.append(entry.dict())
    return {"status": "Feedback logged successfully", "total_records": len(officer_audit_logs)}

@app.get("/api/feedback-logs")
def get_feedback_logs():
    return officer_audit_logs

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)