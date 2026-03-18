from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os
import uvicorn
from dotenv import load_dotenv

# Core logic imports
try:
    from core.db_manager import load_data, execute_query
    from core.ai_engine import get_query_plan
except ImportError:
    raise ImportError("Bhai, 'core' folder ya files missing hain! Check karo ki __init__.py wahan hai ya nahi.")

load_dotenv()

app = FastAPI(title="Insightful Dashboards API")

# --- 1. CORS CONFIGURATION (Including your Origins) ---
# Yahan tumhare bheje gaye URLs include kar diye hain
origins = [
    "https://insightful-dashboards1.vercel.app",
    "https://insightful-dashboard-beryl.vercel.app",
    "http://localhost:8080",
    "http://localhost:5173",
    "*" # Safety net for hackathon
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
    columns: List[str]

# --- 4. ROUTES ---

@app.get("/")
def health_check():
    return {
        "status": "online",
        "db_connected": db_state["conn"] is not None,
        "api_version": "1.2.0",
        "message": "Railway is active and ready!"
    }

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    try:
        # Purana connection close karo memory cleanup ke liye
        if db_state["conn"]:
            db_state["conn"].close()

        # File ko correctly await karke read karo
        file_location = f"temp_{file.filename}"
        content = await file.read() 
        
        with open(file_location, "wb") as f:
            f.write(content)

        # Load data (Using our Binary-Safe loader for that Online/Offline file)
        df, conn = load_data(file_location)
        
        # Update Global State
        db_state["conn"] = conn
        db_state["columns"] = df.columns.tolist()

        # Temporary file ko delete karo disk space bachane ke liye
        if os.path.exists(file_location):
            os.remove(file_location)

        return {
            "message": "File processed successfully!",
            "columns": db_state["columns"],
            "rows": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload Error: {str(e)}")

@app.post("/generate-dashboard")
async def generate_dashboard(request: DashboardRequest):
    if db_state["conn"] is None:
        raise HTTPException(status_code=400, detail="Bhai pehle CSV upload karo!")

    try:
        # Frontend se aaye huye columns ya global state ka use karein
        current_cols = request.columns if request.columns else db_state["columns"]
        
        # Step A: AI se SQL Query mangvao
        plan = get_query_plan(request.prompt, current_cols)
        
        if not plan or "sql" not in plan:
            raise HTTPException(status_code=400, detail="AI could not generate SQL.")

        # Step B: Execute Query on Memory DB
        results_df, error = execute_query(db_state["conn"], plan["sql"])
        
        if error:
            return {
                "error": True,
                "detail": f"SQL Error: {error}",
                "insight": "AI generated a slightly wrong query. Try a different prompt.",
                "data_results": []
            }

        # Step C: Return Response synced with Dashboard Frontend
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
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. RAILWAY PORT HANDLER ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)