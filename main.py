from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
from dotenv import load_dotenv

# Import your existing logic
from core.db_manager import load_data, execute_query
from core.ai_engine import get_query_plan

load_dotenv()

app = FastAPI(title="Nexus BI API")

# 3. Handle CORS (Crucial for Lovable integration)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (change to your Lovable URL for production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Define the Request Model (Matches your frontend fetch body)
class DashboardRequest(BaseModel):
    prompt: str
    columns: List[str]

@app.get("/")
def health_check():
    return {"status": "online", "model": "Gemini 3 Flash"}

@app.post("/generate-dashboard")
async def generate_dashboard(request: DashboardRequest):
    try:
        # Step A: Get the AI Plan (SQL + Insights)
        # Note: We assume the data is already loaded or we use a persistent DB connection
        plan = get_query_plan(request.prompt, request.columns)
        
        if "error" in plan:
            raise HTTPException(status_code=400, detail=plan["error"])

        # Step B: Execute the SQL (This part usually requires the 'conn' from your db_manager)
        # For a hackathon, ensure 'conn' is accessible here
        # results, error = execute_query(global_conn, plan['sql'])
        
        # Format for Lovable Frontend
        return {
            "sql": plan.get("sql"),
            "chart_type": plan.get("chart_type"),
            "x": plan.get("x"),
            "y": plan.get("y"),
            "title": plan.get("title"),
            "insight": plan.get("insight"),
            "data_results": [] # You will populate this with results.to_dict(orient='records')
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
