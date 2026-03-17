/**
 * Service to handle communication between the Lovable Frontend 
 * and the Python (FastAPI) Backend.
 */

// Define the structure of the data we expect back from Python
export interface AIResponse {
  sql?: string;
  chart_type?: 'bar' | 'line' | 'pie' | 'metric' | 'scatter';
  x?: string;
  y?: string;
  title?: string;
  insight?: string;
  error?: string;
  // This will hold the actual data rows returned by the SQL execution
  data_results?: any[]; 
}

// Replace this with your actual deployed Python API URL (e.g., on Render or Railway)
const API_BASE_URL = "https://web-production-a75ed.up.railway.app";

export const fetchDashboardData = async (
  userPrompt: string, 
  columnNames: string[]
): Promise<AIResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-dashboard`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: userPrompt,
        columns: columnNames,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Failed to fetch from Backend");
    }

    const data: AIResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Connection to Python Backend failed:", error);
    return { 
      error: "Could not connect to the AI Engine. Please ensure the backend is running." 
    };
  }
};
