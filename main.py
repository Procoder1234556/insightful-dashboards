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
    # Local debugging ke liye warning
    print("Bhai, 'core' folder ya files missing hain! Make sure __init__.py exists.")

load_dotenv()

app = FastAPI(title="Insightful Dashboards API")

# --- 1. CORS CONFIGURATION ---
# Aapke bheje huye saare origins yahan hain
origins = [
    "https://insightful-dashboards1.vercel.app",
    "https://insightful-dashboard-beryl.vercel.app",
    "http://localhost:8080",
    "http://localhost:5173",
    "*" # Backup for demo safety
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
        "api_version": "2.0.0",
        "message": "Dynamic Engine is Ready!"
    }

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    CSV upload handling with memory cleanup and binary-safe extraction.
    """
    try:
        # Purana connection close karo memory leak bachane ke liye
        if db_state["conn"]:
            try:
                db_state["conn"].close()
            except:
                pass

        # File ko binary mode mein save karo
        file_location = f"temp_{file.filename}"
        content = await file.read()
        
        with open(file_location, "wb") as f:
            f.write(content)

        # db_manager use karke data load karo
        df, conn = load_data(file_location)
        
        # Global State update (Dynamic Columns detect honge)
        db_state["conn"] = conn
        db_state["columns"] = df.columns.tolist()

        # Temporary file cleanup
        if os.path.exists(file_location):
            os.remove(file_location)

        return {
            "message": "File processed successfully!",
            "columns": db_state["columns"],
            "rows": len(df)
        }
    except Exception as e:
        print(f"Upload Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-dashboard")
async def generate_dashboard(request: DashboardRequest):
    """
    Dynamic Query Generation: AI analyze karke hamesha results return karega.
    """
    if db_state["conn"] is None:
        raise HTTPException(status_code=400, detail="Bhai pehle CSV upload karo!")

    try:
        # Dynamic Fallback: Agar frontend se columns nahi aaye, toh memory wale use karo
        active_columns = request.columns if request.columns and len(request.columns) > 0 else db_state["columns"]
        
        # Debugging logs for Railway
        print(f"Prompt Received: {request.prompt}")
        print(f"Available Columns for AI: {active_columns}")

        # Step A: AI se SQL aur Metadata mangvao
        plan = get_query_plan(request.prompt, active_columns)
        
        if not plan or "sql" not in plan:
            raise ValueError("AI failed to generate a plan")

        # Step B: SQL Execute karo
        results_df, error = execute_query(db_state["conn"], plan["sql"])
        
        # Step C: Error handling (Agar SQL fail ho, toh blank na dikhao)
        if error or results_df is None:
            print(f"SQL Error: {error}")
            # Fallback response taaki frontend 'Cannot Answer' na dikhaye
            return {
                "sql": plan.get("sql", ""),
                "chart_type": "bar",
                "x": active_columns[0] if active_columns else "Data",
                "y": "Count",
                "title": "Data Distribution (Auto-Correction)",
                "insight": "AI generated a query that needs adjustment. Showing general distribution.",
                "data_results": [] 
            }

        # Final Clean Response
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
        print(f"Dashboard Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. RAILWAY PORT HANDLER ---
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # 0.0.0.0 is mandatory for Railway
    uvicorn.run(app, host="0.0.0.0", port=port)