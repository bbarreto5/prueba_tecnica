from fastapi import APIRouter

router = APIRouter(prefix="/requests", tags=["requests"])


@router.get("")
def get_requests():
    return {"message": "requests endpoint"}
