import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    # You can override the port via environment variables
    port = int(os.getenv("PORT", 8000))
    
    print(f"Starting Human Translator API server on port {port}...")
    print("API documentation will be available at:")
    print(f"  - Swagger UI: http://localhost:{port}/docs")
    print(f"  - ReDoc: http://localhost:{port}/redoc")
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True) 