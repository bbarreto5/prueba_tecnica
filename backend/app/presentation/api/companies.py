from fastapi import APIRouter

router = APIRouter(prefix="/companies", tags=["companies"])


@router.get("")
def get_companies():
    return {"message": "companies endpoint"}
