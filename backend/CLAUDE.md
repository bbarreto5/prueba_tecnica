# CLAUDE.md

Guía de arquitectura para trabajar en este repositorio. Léela antes de tocar código backend.

## Contexto

Monorepo (`backend/` + `frontend/`; `frontend/` está vacío todavía, no implementado). Este documento cubre `backend/`: una API de gestión de incidencias/solicitudes (Requests) construida con FastAPI + PostgreSQL + SQLAlchemy 2.x (async) + Alembic, siguiendo Clean Architecture.

## Estructura real

```text
backend/app/
├── main.py                    # crea la app FastAPI, registra los routers bajo /api/v1
├── core/                      # config, JWT + password hashing, engine/sesión SQLAlchemy
│   ├── config.py
│   ├── security.py
│   └── database.py
├── domain/
│   ├── entities/               # User, Company, Request, Message (dataclasses puros)
│   └── enums/                  # UserRole, RequestType/Priority/Status
├── application/                # casos de uso, un subpaquete por recurso
│   ├── auth/
│   ├── users/
│   ├── companies/
│   ├── requests/
│   └── messages/
├── infrastructure/
│   ├── database/
│   │   ├── models/              # SQLAlchemy ORM
│   │   ├── repositories/        # persistencia (Repository Pattern)
│   │   ├── mappers.py           # domain entity ↔ ORM model
│   │   ├── migrations/          # Alembic
│   │   └── seed.py              # seed idempotente de datos de desarrollo
│   └── security/                # vacío actualmente — no mover aquí el código de core/security.py
└── presentation/api/
    ├── dependencies.py          # get_current_user, require_roles()
    └── auth.py, users.py, companies.py, requests.py, messages.py

tests/                           # espeja infrastructure/database/ y presentation/api/
```

## Arquitectura y dirección de dependencias

```text
presentation → application → domain ← infrastructure
```

- **`domain`**: entidades y enums puros (dataclasses/Enum). Sin FastAPI, sin SQLAlchemy, sin HTTP.
- **`application`**: casos de uso (funciones async). Nunca importan `Depends`, `HTTPException`, `APIRouter` ni ejecutan queries SQLAlchemy.
- **`infrastructure`**: modelos SQLAlchemy, repositories, mappers, migraciones. Implementa lo que `application` necesita persistir.
- **`presentation`**: routers FastAPI. Reciben el request, validan el schema Pydantic, obtienen el usuario autenticado, invocan el caso de uso, traducen sus excepciones a `HTTPException`, devuelven el response.
- **`core`**: configuración (env vars), JWT + hashing de passwords, engine/sesión de base de datos. Es la única capa que usan todas las demás.

Ejemplos de dónde vive cada cosa (no lo dupliques en otro lugar):
- Implementación de JWT y password hashing → `app/core/security.py`
- Reglas y estados de Request → `app/domain/entities/request.py`, `app/domain/enums/request.py`, `app/application/requests/`
- Configuración de base de datos (engine, sesión) → `app/core/database.py`

## Regla principal

Antes de escribir código nuevo: **inspecciona lo que ya existe y reutilízalo**.

- Antes de crear un repository, caso de uso, excepción o dependencia, comprueba si ya existe uno equivalente — los módulos `companies`, `requests`, `users`, `messages` siguen todos el mismo patrón (schemas.py + casos de uso + excepciones propias).
- Sigue el patrón del módulo más parecido en vez de inventar uno nuevo.
- Prefiere cambios pequeños y coherentes con lo existente sobre refactors amplios.
- No dupliques lógica de autorización: `app/application/requests/authorization.py` (`can_access_request`) ya es reutilizado por `app/application/messages/`. Sigue ese mismo patrón si añades algo que dependa de un Request.

## Autenticación y autorización

JWT ya está implementado — reutilízalo, no lo reimplementes.

- Autenticación: `Depends(get_current_user)` en `app/presentation/api/dependencies.py`
- Autorización por rol: `require_roles(...)` en el mismo archivo
- Roles existentes: `ADMIN`, `SUPPORT`, `COMPANY`, `USER` (`app/domain/enums/user.py`)

"Tiene el rol correcto" **no** es lo mismo que "puede acceder a este recurso concreto". Para Requests y Messages la autorización combina RBAC + acceso al recurso + aislamiento por compañía (`current_user.company_id == request.company_id`). Ver `app/application/requests/authorization.py` y `app/application/users/authorization.py`.

## Requests y Messages

Request tiene una máquina de estados (`app/domain/enums/request.py`) con transiciones explícitas — take/return/resolve/cancel — no un PATCH genérico de estado. Ver `app/application/requests/`. Las transiciones se aplican como un UPDATE condicional atómico en el repository para evitar condiciones de carrera sin locking explícito — ver `app/infrastructure/database/repositories/request_repository.py`.

Message pertenece a un Request; su autorización se deriva siempre de la del Request, nunca es una política independiente:

```text
sin acceso al Request → sin acceso a sus Messages
```

## Base de datos

PostgreSQL + SQLAlchemy 2.x (async) + Alembic.

- Engine/sesión → `app/core/database.py`
- Migraciones → `app/infrastructure/database/migrations/`, configuración en `alembic.ini`
- Seed de desarrollo (idempotente) → `app/infrastructure/database/seed.py`

No modifiques una migración ya aplicada para reflejar un cambio de modelo — crea una nueva. Antes de tocar un modelo SQLAlchemy, revisa sus relaciones y la migración que lo creó.

## Tests

`tests/` espeja la estructura de `app/` (`tests/infrastructure/database/`, `tests/presentation/api/`). Corren contra una base PostgreSQL de test real (ver `tests/infrastructure/database/conftest.py`), no contra mocks ni SQLite.

Al modificar comportamiento existente, prioriza tests de: autorización, aislamiento por compañía, transiciones de Request, autenticación, y el caso de uso concreto que estés tocando.

## API implementada

```text
/auth
/users
/companies
/requests           (+ /take, /return, /resolve, /cancel)
/requests/{id}/messages
```

No copies aquí los endpoints ni sus schemas — la fuente de verdad es `app/presentation/api/` y la documentación OpenAPI que genera FastAPI (`/docs`).

## Cómo evolucionar el proyecto

1. Reutiliza antes de crear.
2. Mantén la dirección de dependencias entre capas.
3. Reglas de negocio en `domain`/`application`, nunca en `infrastructure` ni `presentation`.
4. Persistencia únicamente en `infrastructure`.
5. HTTP únicamente en `presentation`.
6. Evita cambios estructurales innecesarios.
7. Mantén compatibilidad con las funcionalidades existentes.
8. Si cambias comportamiento, añade o actualiza tests.
9. Prefiere soluciones simples sobre abstracciones prematuras.

## Recursos clave

- Arquitectura general → `app/`
- Entidades de dominio → `app/domain/entities/`
- Enums de dominio → `app/domain/enums/`
- Casos de uso → `app/application/`
- Modelos SQLAlchemy → `app/infrastructure/database/models/`
- Repositories → `app/infrastructure/database/repositories/`
- Migraciones Alembic → `app/infrastructure/database/migrations/`
- Seed de desarrollo → `app/infrastructure/database/seed.py`
- Autenticación / password hashing → `app/core/security.py`
- Configuración → `app/core/config.py`
- Base de datos (engine/sesión) → `app/core/database.py`
- Dependencias de auth (`Depends`) → `app/presentation/api/dependencies.py`
- Rutas de la API → `app/presentation/api/`
- Tests → `tests/`
- Documentación de la API → OpenAPI de FastAPI (`/docs`)
