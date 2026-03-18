import pandas as pd
import sqlite3
import io
import os
import re

def load_data(file_path):
    """
    Universal Dynamic Loader: 
    Detects the first valid CSV line automatically for ANY file.
    """
    try:
        with open(file_path, 'rb') as f:
            content = f.read()
        
        # 1. Dynamic Header Detection: 
        # Hum pehli aisi line dhoond rahe hain jisme commas hon aur binary kachra na ho.
        # Ye 'age,monthly_income' par dependent nahi hai.
        lines = content.split(b'\n')
        csv_start_index = -1
        
        for i, line in enumerate(lines[:50]): # Pehli 50 lines check karo
            # Agar line mein comma hai aur binary characters kam hain
            if b',' in line and len(line.split(b',')) > 1:
                # Basic check for ASCII-like header strings
                if re.match(r'^[a-zA-Z0-9_, \r\n]+$', line.decode('utf-8', 'ignore')):
                    csv_start_index = i
                    break
        
        if csv_start_index != -1:
            csv_raw = b'\n'.join(lines[csv_start_index:])
            # Footer cleaning (Safari/WebArchive tags)
            if b'</pre>' in csv_raw:
                csv_raw = csv_raw.split(b'</pre>')[0]
            
            df = pd.read_csv(io.BytesIO(csv_raw), skipinitialspace=True)
        else:
            # Normal CSV fallback agar binary wrapper nahi mila
            df = pd.read_csv(file_path)

        # 2. Cleanup Column Names (Spaces hatao)
        df.columns = [c.strip() for c in df.columns]

        # 3. SQLite In-Memory setup
        conn = sqlite3.connect(':memory:', check_same_thread=False)
        df.to_sql('data_table', conn, index=False, if_exists='replace')
        
        print(f"✅ Success! Columns Detected: {df.columns.tolist()}")
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