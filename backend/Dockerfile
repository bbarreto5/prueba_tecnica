FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["alembic", "upgrade", "head"]

RUN python -m app.infrastructure.database.seed


CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

