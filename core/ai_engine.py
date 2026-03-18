import google.generativeai as genai
import json
import os

def get_query_plan(prompt, columns):
    """
    Strict Data Analyst Engine: 
    Filters out non-data questions and maps valid queries to SQL.
    """
    # 1. API Configuration
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "API Key is missing in Environment Variables."}
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # 2. Strict System Instruction (The Guardrail)
    sys_prompt = f"""
    You are a Strict Business Intelligence Analyst. 
    Your ONLY job is to analyze the data provided in 'data_table'.
    Available Columns: {columns}
    
    STRICT RULES:
    1. If the user's question is NOT about the data (e.g., "Who is X?", "Tell me a joke", "General Knowledge"), 
       REJECT it by returning a JSON with "error".
    2. Do NOT answer personal questions or questions about people unless they are explicitly in the dataset.
    3. If the query is about 'Online' vs 'Store' behavior, map it to the correct spend/order columns.
    4. Return ONLY a valid JSON object. No prose, no explanations.

    VALID DATA QUERY JSON:
    {{
        "sql": "SELECT...",
        "chart_type": "bar" or "line" or "pie",
        "x": "column_name",
        "y": "column_name",
        "title": "Professional Chart Title",
        "insight": "Business insight from this data"
    }}

    INVALID/OUT-OF-SCOPE JSON:
    {{
        "error": "I am a data assistant. I can only answer questions related to your uploaded CSV file.",
        "is_out_of_scope": true
    }}
    """
    
    try:
        # 3. AI Generation
        response = model.generate_content([sys_prompt, f"User Question: {prompt}"])
        text = response.text.strip()
        
        # 4. JSON Cleaning (Markdown removal)
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        plan = json.loads(text.strip())
        
        # 5. Logical Check: Agar AI ne SQL diya hai par columns galat hain
        if "sql" in plan and "error" not in plan:
            # Check if columns in SQL actually exist in our list
            for col in columns:
                if col.lower() in plan["sql"].lower():
                    return plan
            # If no matching columns found in SQL, trigger fallback
            raise ValueError("SQL columns do not match dataset.")

        return plan
        
    except Exception as e:
        # 6. Emergency Fallback (Safe Response)
        print(f"AI Logic Error: {e}")
        return {
            "error": "I couldn't find relevant data for this query. Please ask something related to your CSV columns.",
            "is_out_of_scope": True
        }