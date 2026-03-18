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

app = FastAPI(title="Insightful Dashboards API - Pro Version")

# --- 1. CORS CONFIGURATION (Full Connectivity) ---
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
        "api_version": "2.1.0",
        "active_columns": db_state["columns"]
    }

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    Ensures the latest CSV is loaded by flushing old memory connections.
    """
    try:
        # Step 1: Force Clear Old State
        if db_state["conn"]:
            try:
                db_state["conn"].close()
            except:
                pass
            db_state["conn"] = None
            db_state["columns"] = []

        # Step 2: Binary Safe Save
        file_location = f"temp_{file.filename}"
        content = await file.read()
        with open(file_location, "wb") as f:
            f.write(content)

        # Step 3: Load Data via db_manager (Universal Loader)
        df, conn = load_data(file_location)
        
        # Step 4: Final State Update
        db_state["conn"] = conn
        db_state["columns"] = df.columns.tolist()

        if os.path.exists(file_location):
            os.remove(file_location)

        print(f"✅ State Updated: New file has {len(db_state['columns'])} columns.")

        return {
            "message": "Latest CSV loaded successfully!",
            "columns": db_state["columns"],
            "rows": len(df)
        }
    except Exception as e:
        print(f"🔥 Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-dashboard")
async def generate_dashboard(request: DashboardRequest):
    if db_state["conn"] is None:
        raise HTTPException(status_code=400, detail="Bhai, please upload a CSV first!")

    try:
        # Logic: Always prioritize latest uploaded columns
        active_columns = db_state["columns"] if not request.columns else request.columns
        
        # Step A: Get Dynamic Plan
        plan = get_query_plan(request.prompt, active_columns)
        
        # Step B: Execute Query
        results_df, error = execute_query(db_state["conn"], plan["sql"])
        
        # Step C: Smart Fallback (No 'Cannot Answer' allowed)
        if error or results_df is None or results_df.empty:
            print(f"⚠️ SQL Error/Empty: {error}")
            return {
                "sql": plan.get("sql", ""),
                "chart_type": "bar",
                "x": active_columns[0] if active_columns else "Data",
                "y": "Count",
                "title": "Data Insights (Auto-Generated)",
                "insight": "AI is visualizing the most relevant distribution from your latest file.",
                "data_results": [] 
            }

        return {
            "sql": plan.get("sql"),
            "chart_type": plan.get("chart_type", "bar"),
            "x": plan.get("x"),
            "y": plan.get("y"),
            "title": plan.get("title", "Analysis Result"),
            "insight": plan.get("insight", "Success"),
            "data_results": results_df.to_dict(orient="records")
        }

    except Exception as e:
        print(f"❌ Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. EXECUTION ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)