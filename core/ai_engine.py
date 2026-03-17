import google.generativeai as genai
import json
import os

def get_query_plan(prompt, columns):
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    sys_prompt = f"""
    You are a SQL expert. Return ONLY a JSON object for SQLite.
    Table name: 'data_table'
    Columns: {columns}
    
    JSON Format:
    {{
        "sql": "SELECT...",
        "chart_type": "bar",
        "x": "column_name",
        "y": "column_name",
        "title": "Analysis Title",
        "insight": "Quick summary"
    }}
    """
    
    response = model.generate_content([sys_prompt, prompt])
    # Clean JSON output
    clean_text = response.text.replace('```json', '').replace('```', '').strip()
    return json.loads(clean_text)
