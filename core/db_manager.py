import pandas as pd
import sqlite3

def load_data(file_path):
    df = pd.read_csv(file_path)
    conn = sqlite3.connect(':memory:', check_same_thread=False)
    df.to_sql('data_table', conn, index=False, if_exists='replace')
    return df, conn

def execute_query(conn, sql):
    try:
        results = pd.read_sql_query(sql, conn)
        return results, None
    except Exception as e:
        return None, str(e)
