# Backend — API de Gestión de Solicitudes

API REST construida con FastAPI + PostgreSQL + SQLAlchemy 2.x (async) + Alembic, siguiendo Clean Architecture.

## Requisitos

- **Python 3.12+**
- **PostgreSQL** en ejecución y accesible

## 1. Instalar dependencias

Desde `backend/`, crea y activa un entorno virtual, e instala las dependencias:

```bash
python3 -m venv .venv
source .venv/bin/activate   # En Windows: .venv\Scripts\activate

pip install -r requirements.txt
```

## 2. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores (mínimo `DATABASE_URL` y `JWT_SECRET_KEY`):

```bash
cp .env.example .env
```

Las notificaciones por email (`SMTP_*`) son opcionales — si se dejan en blanco, la app funciona con normalidad y simplemente no envía correos.

## 3. Aplicar las migraciones

Con `DATABASE_URL` apuntando a una base PostgreSQL existente:

```bash
alembic upgrade head
```

## 4. Cargar datos de desarrollo (seed)

Crea de forma idempotente los usuarios, empresas y solicitudes iniciales (se puede ejecutar varias veces sin duplicar datos):

```bash
python -m app.infrastructure.database.seed
```

Las contraseñas de los usuarios sembrados se toman de `SEED_ADMIN_PASSWORD`, `SEED_SUPPORT_PASSWORD` y `SEED_COMPANY_USER_PASSWORD` (definidas en `.env`), con valores por defecto si no se configuran.

Los valores por defecto se encuentran definidos en app.infrastructure.database.seed.

## 5. Levantar el servidor

```bash
uvicorn app.main:app --reload
```

La API queda disponible en [http://localhost:8000](http://localhost:8000), con documentación interactiva (Swagger) en [http://localhost:8000/docs](http://localhost:8000/docs).

## Solución de problemas

Si aparece:

zsh: command not found: alembic

verificar que el entorno virtual esté activo:

source .venv/bin/activate

y comprobar que Alembic esté instalado:

alembic --version

Si python no es reconocido o apunta a una versión incorrecta, se recomienda recrear el entorno virtual utilizando Python 3.12:

deactivate
rm -rf .venv
/opt/homebrew/bin/python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
