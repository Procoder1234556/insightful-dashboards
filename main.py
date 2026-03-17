from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import pandas as pd
import sqlite3
from dotenv import load_dotenv

# Import your core logic
try:
    from core.db_manager import load_data, execute_query
    from core.ai_engine import get_query_plan
except ImportError:
    # Fallback if core folder is not structured correctly in some environments
    raise ImportError("Bhai, 'core' folder missing hai ya usme __init__.py nahi hai!")

load_dotenv()

app = FastAPI(title="Insightful Dashboards API")

# --- 1. CORS CONFIGURATION ---
# Ismein tera Vercel URL aur Localhost dono allowed hain
origins = [
    "https://insightful-dashboard-beryl.vercel.app",
    "http://localhost:8080",
    "http://localhost:5173",
    "*" # Safety net for hackathon, allows all if others fail
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 2. GLOBAL STATE ---
# SQLite connection aur columns ko memory mein store karne ke liye
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
        "database_connected": db_state["conn"] is not None,
        "api_version": "1.0.0"
    }

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    """
    CSV upload karke memory mein SQLite table banata hai.
    """
    try:
        # Temporary save
        file_location = f"temp_{file.filename}"
        with open(file_location, "wb+") as file_object:
            file_object.write(file.read())

        # Load data using your db_manager
        df, conn = load_data(file_location)
        
        # Update Global State
        db_state["conn"] = conn
        db_state["columns"] = df.columns.tolist()

        # Clean up local file after loading to memory
        os.remove(file_location)

        return {
            "message": "File uploaded and processed successfully!",
            "columns": db_state["columns"],
            "rows": len(df)
        }
    except Exception as e:
        return HTTPException(status_code=500, detail=f"Upload Error: {str(e)}")

@app.post("/generate-dashboard")
async def generate_dashboard(request: DashboardRequest):
    """
    Prompt se SQL banata hai, data fetch karta hai aur frontend ko bhejta hai.
    """
    if db_state["conn"] is None:
        raise HTTPException(status_code=400, detail="Bhai pehle CSV upload karo!")

    try:
        # Step A: AI se SQL Query aur Plan mangvao
        plan = get_query_plan(request.prompt, request.columns)
        
        if not plan or "sql" not in plan:
            raise HTTPException(status_code=400, detail="AI could not generate a valid SQL query.")

        # Step B: SQL ko Execute karo memory DB par
        results_df, error = execute_query(db_state["conn"], plan["sql"])
        
        if error:
            raise HTTPException(status_code=400, detail=f"SQL Execution Error: {error}")

        # Step C: Final Response format for Lovable
        return {
            "sql": plan.get("sql"),
            "chart_type": plan.get("chart_type", "bar"),
            "x": plan.get("x"),
            "y": plan.get("y"),
            "title": plan.get("title", "Data Analysis"),
            "insight": plan.get("insight", "Analysis complete."),
            "data_results": results_df.to_dict(orient="records")
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# --- 5. SERVER RUNNER ---
if __name__ == "__main__":
    import uvicorn
    # Railway PORT variable provide karta hai, agar nahi toh 8000 use hoga
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)