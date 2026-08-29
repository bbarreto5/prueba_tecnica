from fastapi import FastAPI

from app.presentation.api import auth, companies, messages, requests, users

app = FastAPI(title="Incident & Request Management API")

app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(companies.router, prefix="/api/v1")
app.include_router(requests.router, prefix="/api/v1")
app.include_router(messages.router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "ok"}
