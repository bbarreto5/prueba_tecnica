from fastapi import APIRouter

router = APIRouter(prefix="/messages", tags=["messages"])


@router.get("")
def get_messages():
    return {"message": "messages endpoint"}
