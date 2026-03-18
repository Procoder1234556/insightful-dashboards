import google.generativeai as genai
import json
import os

def get_query_plan(prompt, columns):
    # API Key configure karo
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # AI ko expert analyst banao jo kisi bhi file ko samajh sake
    sys_prompt = f"""
    You are a Senior Data Scientist. Analyze the following columns from a user-uploaded CSV:
    Columns: {columns}
    Table Name: 'data_table'

    INSTRUCTIONS:
    1. If the user prompt is a generic dashboard button (e.g., 'Gender', 'Income'), find the closest matching column from the list.
    2. For 'chart_type', choose 'bar' for categories, 'line' for trends, or 'scatter' for correlations.
    3. Ensure the SQL is valid SQLite. Always use 'data_table'.
    4. If the user asks for 'Analysis' or 'Overview', pick the most interesting numerical column and group it by a categorical column.
    
    RETURN ONLY A VALID JSON OBJECT:
    {{
        "sql": "SELECT...",
        "chart_type": "bar/line/pie/scatter",
        "x": "column_name_for_x_axis",
        "y": "column_name_for_y_axis",
        "title": "A very professional and descriptive title",
        "insight": "A deep business insight based on what this data represents"
    }}
    """
    
    try:
        # Prompt aur System Instruction dono bhej rahe hain
        response = model.generate_content([sys_prompt, f"User Request: {prompt}"])
        
        # Clean JSON logic
        text = response.text
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0]
        elif "```" in text:
            text = text.split("```")[1].split("```")[0]
        
        clean_text = text.strip()
        return json.loads(clean_text)
        
    except Exception as e:
        # Fallback: Agar AI confuse ho jaye, toh pehle do columns ka default chart dikhao
        return {
            "sql": f"SELECT {columns[0]}, COUNT(*) as count FROM data_table GROUP BY {columns[0]} LIMIT 10",
            "chart_type": "bar",
            "x": columns[0],
            "y": "count",
            "title": "Data Overview",
            "insight": "AI could not parse the specific request, showing a general distribution."
        }