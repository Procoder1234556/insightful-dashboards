from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import uvicorn
from dotenv import load_dotenv

# --- Core logic imports ---
try:
    from core.db_manager import load_data, execute_query
    from core.ai_engine import get_query_plan
except ImportError:
    print("⚠️ Warning: 'core' folder logic missing! Backend checking locally...")

load_dotenv()

app = FastAPI(title="Insightful Dashboards API - Secured Version")

# --- 1. CORS CONFIGURATION ---
origins = [
    "https://insightful-dashboards1.vercel.app",
    "https://insightful-dashboard-beryl.vercel.app",
    "http://localhost:8080",
    "http://localhost:5173",
    "*" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. GLOBAL STATE ---
db_state = {
    "conn": None,
    "columns": []
}

# --- 3. REQUEST MODELS ---
class DashboardRequest(BaseModel):
    prompt: str
    columns: Optional[List[str]] = []

# --- 4. ROUTES ---

@app.get("/")
def health_check():
    return {
        "status": "online",
        "db_connected": db_state["conn"] is not None,
        "api_version": "2.2.0",
        "active_columns": db_state["columns"]
    }

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Ensures fresh data upload and schema detection.
    """
    try:
        if db_state["conn"]:
            try:
                db_state["conn"].close()
            except:
                pass
            db_state["conn"] = None
            db_state["columns"] = []

        file_location = f"temp_{file.filename}"
        content = await file.read()
        with open(file_location, "wb") as f:
            f.write(content)

        # Load Data (Universal Dynamic Loader)
        df, conn = load_data(file_location)
        
        db_state["conn"] = conn
        db_state["columns"] = df.columns.tolist()

        if os.path.exists(file_location):
            os.remove(file_location)

        print(f"✅ Success: Loaded {len(db_state['columns'])} columns.")

        return {
            "message": "CSV uploaded successfully!",
            "columns": db_state["columns"],
            "rows": len(df)
        }
    except Exception as e:
        print(f"🔥 Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-dashboard")
async def generate_dashboard(request: DashboardRequest):
    """
    Dynamic Generation with Security Guardrails.
    """
    if db_state["conn"] is None:
        raise HTTPException(status_code=400, detail="Bhai, please upload a CSV first!")

    try:
        active_columns = db_state["columns"] if not request.columns else request.columns
        
        # Step A: Get Plan from AI (AI ab guardrails check karega)
        plan = get_query_plan(request.prompt, active_columns)
        
        # --- NEW: GUARDRAIL CHECK ---
        # Agar AI ne kaha ki query 'Out of Scope' hai
        if "error" in plan or plan.get("is_out_of_scope"):
            return {
                "error": True,
                "detail": plan.get("error", "This query is outside the scope of the dataset."),
                "insight": "I am a Data Assistant. Please ask something related to your CSV columns.",
                "data_results": [],
                "chart_type": "none"
            }

        # Step B: Execute SQL Query
        results_df, error = execute_query(db_state["conn"], plan["sql"])
        
        # Step C: Result Handling
        if error or results_df is None:
            return {
                "error": True,
                "detail": f"SQL Error: {error}",
                "insight": "I couldn't visualize this. Try rephrasing based on your data columns.",
                "data_results": []
            }

        # Final Response
        return {
            "sql": plan.get("sql"),
            "chart_type": plan.get("chart_type", "bar"),
            "x": plan.get("x"),
            "y": plan.get("y"),
            "title": plan.get("title", "Data Insight"),
            "insight": plan.get("insight", "Analysis Successful"),
            "data_results": results_df.to_dict(orient="records")
        }

    except Exception as e:
        print(f"❌ Execution Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. SERVER RUNNER ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)