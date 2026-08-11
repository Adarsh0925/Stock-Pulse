from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api import market, company, news, research

app = FastAPI(
    title="Stock Market Research & Prediction Engine",
    description="Backend API powered by Python, Pandas, Matplotlib, Scikit-learn, and Financial NLP",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(market.router)
app.include_router(company.router)
app.include_router(news.router)
app.include_router(research.router)

@app.get("/api/health")
def health_check():
    """
    System health check endpoint.
    """
    return {
        "status": "HEALTHY",
        "service": "Stock Market Research & Prediction Backend",
        "engine": "Python FastAPI + Pandas + Scikit-Learn"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
