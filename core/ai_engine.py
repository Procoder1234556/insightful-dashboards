import google.generativeai as genai
import json
import os

def get_query_plan(prompt, columns):
    """
    Never-Say-No Engine: 
    Ye AI ko force karta hai ki wo dataset ke columns ko prompt se map kare.
    """
    # 1. Gemini Configure karo
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"error": "API Key missing in Railway environment variables"}
        
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # 2. System Prompt: AI ko "Expert Analyst" banane ke liye
    sys_prompt = f"""
    You are a Data Analyst Expert. 
    Table: 'data_table'
    Columns available: {columns}
    
    RULES:
    1. NEVER return an error or say "I cannot answer".
    2. Map the user's keywords to the closest available columns.
    3. If they ask for 'Online' vs 'Store', use the relevant spend or order columns.
    4. If the user's query is vague, pick the first categorical column for X and first numerical for Y.
    5. Return ONLY a valid JSON object for SQLite.

    JSON STRUCTURE:
    {{
        "sql": "SELECT...",
        "chart_type": "bar" or "line" or "pie",
        "x": "column_name",
        "y": "column_name",
        "title": "Analysis Title",
        "insight": "Quick business summary"
    }}
    """
    
    try:
        # 3. AI se content generate karvao
        response = model.generate_content([sys_prompt, f"User Query: {prompt}"])
        text = response.text.strip()
        
        # 4. Robust JSON Extraction (Markdown tags hatao)
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        return json.loads(text.strip())
        
    except Exception as e:
        # 5. Emergency Fallback: Agar AI crash ho jaye, toh default data dikhao
        print(f"AI Engine Error: {e}")
        # Default categorical column dhoondo (usually gender or city_tier)
        default_x = columns[-1] if columns else "Data"
        return {
            "sql": f"SELECT {default_x}, COUNT(*) as count FROM data_table GROUP BY {default_x} LIMIT 5",
            "chart_type": "bar",
            "x": default_x,
            "y": "count",
            "title": "General Data Overview",
            "insight": "AI was unsure about the specific query, showing a general distribution of the dataset."
        }