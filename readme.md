python3.12 version
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

------------------------------

alembic --version
alembic upgrade head






------------

mi-proyecto/
├── frontend/
├── backend/
└── README.md