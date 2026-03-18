import pandas as pd
import sqlite3
import io
import os

def load_data(file_path):
    """
    Railway Fail-Safe: Handles normal CSVs and the specific binary-wrapped 
    CSV provided by the organizers.
    """
    try:
        # 1. Binary mode mein read karo (bplist issue fix)
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # 2. Header marker dhundo
        start_marker = b'age,monthly_income'
        start_index = content.find(start_marker)
        
        if start_index != -1:
            # Data extract karo aur HTML tags hatao
            csv_raw = content[start_index:]
            end_marker = b'</pre>'
            end_index = csv_raw.find(end_marker)
            if end_index != -1:
                csv_raw = csv_raw[:end_index]
            
            df = pd.read_csv(io.BytesIO(csv_raw))
        else:
            # Normal CSV fallback
            df = pd.read_csv(file_path)

        # 3. SQLite In-Memory setup
        conn = sqlite3.connect(':memory:', check_same_thread=False)
        df.to_sql('data_table', conn, index=False, if_exists='replace')
        
        print(f"✅ Successful! Loaded {len(df)} rows.")
        return df, conn

    except Exception as e:
        print(f"❌ DB Error: {str(e)}")
        raise e

def execute_query(conn, sql):
    """Query execute karke result return karta hai"""
    try:
        results = pd.read_sql_query(sql, conn)
        return results, None
    except Exception as e:
        return None, str(e)