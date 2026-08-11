from fastapi import APIRouter
from backend.services.market_data import get_nifty50_data
from backend.models.schemas import Nifty50Response

router = APIRouter(prefix="/api/market", tags=["Market"])

@router.get("/nifty50", response_model=Nifty50Response)
def nifty50_endpoint():
    """
    Returns real online data for the NIFTY 50 index.
    """
    data = get_nifty50_data()
    return data
