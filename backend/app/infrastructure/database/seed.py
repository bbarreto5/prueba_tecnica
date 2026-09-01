"""Idempotent seed of initial development data: users, companies with their
associated users, and requests created by those company users.

Run from `backend/` with:

    python -m app.infrastructure.database.seed
"""

import asyncio
import os
import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.database import async_session_factory
from app.core.security import hash_password
from app.domain.entities.company import Company
from app.domain.entities.request import Request
from app.domain.entities.user import User
from app.domain.enums.request import RequestPriority, RequestStatus, RequestType
from app.domain.enums.user import UserRole
from app.infrastructure.database.repositories.company_repository import CompanyRepository
from app.infrastructure.database.repositories.request_repository import RequestRepository
from app.infrastructure.database.repositories.user_repository import UserRepository

SEED_USERS = [
    {
        "email": "admin@example.com",
        "name": "System Administrator",
        "role": UserRole.ADMIN,
        "password_env": "SEED_ADMIN_PASSWORD",
        "password_default": "Admin123!",
    },
    {
        "email": "support1@example.com",
        "name": "Support User 1",
        "role": UserRole.SUPPORT,
        "password_env": "SEED_SUPPORT_PASSWORD",
        "password_default": "Support123!",
    },
    {
        "email": "support2@example.com",
        "name": "Support User 2",
        "role": UserRole.SUPPORT,
        "password_env": "SEED_SUPPORT_PASSWORD",
        "password_default": "Support123!",
    },
]

# Each company gets exactly 5 users: 1 with role=COMPANY (the company's
# primary contact) and 4 with role=USER. Users are matched across runs by
# email; companies are matched by name (the closest thing to a natural
# identifier CompanyModel has — there is no unique constraint on it, so this
# check is the only thing preventing duplicate companies with the same name).
SEED_COMPANIES = [
    {
        "name": "Acme Solutions",
        "users": [
            {"email": "acme.company@example.com", "name": "John Doe", "role": UserRole.COMPANY},
            {"email": "acme.user1@example.com", "name": "Jane Smith", "role": UserRole.USER},
            {"email": "acme.user2@example.com", "name": "Michael Brown", "role": UserRole.USER},
            {"email": "acme.user3@example.com", "name": "Emily Davis", "role": UserRole.USER},
            {"email": "acme.user4@example.com", "name": "Daniel Wilson", "role": UserRole.USER},
        ],
    },
    {
        "name": "TechNova Industries",
        "users": [
            {"email": "technova.company@example.com", "name": "Olivia Martinez", "role": UserRole.COMPANY},
            {"email": "technova.user1@example.com", "name": "James Anderson", "role": UserRole.USER},
            {"email": "technova.user2@example.com", "name": "Sophia Taylor", "role": UserRole.USER},
            {"email": "technova.user3@example.com", "name": "Benjamin Thomas", "role": UserRole.USER},
            {"email": "technova.user4@example.com", "name": "Camila Rodriguez", "role": UserRole.USER},
        ],
    },
    {
        "name": "Global Services Corp",
        "users": [
            {"email": "global.company@example.com", "name": "Mateo Gonzalez", "role": UserRole.COMPANY},
            {"email": "global.user1@example.com", "name": "Valentina Perez", "role": UserRole.USER},
            {"email": "global.user2@example.com", "name": "Lucas Fernandez", "role": UserRole.USER},
            {"email": "global.user3@example.com", "name": "Isabella Ramirez", "role": UserRole.USER},
            {"email": "global.user4@example.com", "name": "Gabriel Torres", "role": UserRole.USER},
        ],
    },
    {
        "name": "Andes Digital",
        "users": [
            {"email": "andes.company@example.com", "name": "Sofia Castro", "role": UserRole.COMPANY},
            {"email": "andes.user1@example.com", "name": "Diego Morales", "role": UserRole.USER},
            {"email": "andes.user2@example.com", "name": "Valeria Ortiz", "role": UserRole.USER},
            {"email": "andes.user3@example.com", "name": "Andres Silva", "role": UserRole.USER},
            {"email": "andes.user4@example.com", "name": "Paula Reyes", "role": UserRole.USER},
        ],
    },
    {
        "name": "Caribbean Logistics",
        "users": [
            {"email": "caribbean.company@example.com", "name": "Carlos Mendez", "role": UserRole.COMPANY},
            {"email": "caribbean.user1@example.com", "name": "Laura Jimenez", "role": UserRole.USER},
            {"email": "caribbean.user2@example.com", "name": "Roberto Diaz", "role": UserRole.USER},
            {"email": "caribbean.user3@example.com", "name": "Natalia Vega", "role": UserRole.USER},
            {"email": "caribbean.user4@example.com", "name": "Diego Herrera", "role": UserRole.USER},
        ],
    },
]


# Each entry is created by one of the users from SEED_COMPANIES (matched by
# email) for that same company, optionally assigned to one of the SUPPORT
# users from SEED_USERS. Matched across runs by (company, title) — there is
# no natural unique key on Request, so title stands in for one, same as
# company name does for Company above.
SEED_REQUESTS = [
    {
        "company_name": "Acme Solutions",
        "created_by_email": "acme.user1@example.com",
        "assigned_to_email": None,
        "title": "No se puede acceder al portal de facturación",
        "description": (
            "Desde ayer por la tarde el portal de facturación no carga, muestra un error 500 "
            "al iniciar sesión. Ya intentamos con otro navegador y el problema persiste."
        ),
        "type": RequestType.INCIDENT,
        "priority": RequestPriority.URGENT,
        "status": RequestStatus.PENDING,
    },
    {
        "company_name": "Acme Solutions",
        "created_by_email": "acme.company@example.com",
        "assigned_to_email": "support1@example.com",
        "title": "Solicitud de aumento de licencias",
        "description": (
            "Necesitamos 10 licencias adicionales para el equipo de ventas que se incorpora "
            "este mes. ¿Podrían indicarnos el costo y el tiempo de activación?"
        ),
        "type": RequestType.REQUEST,
        "priority": RequestPriority.MEDIUM,
        "status": RequestStatus.RESOLVED,
    },
    {
        "company_name": "TechNova Industries",
        "created_by_email": "technova.user2@example.com",
        "assigned_to_email": "support2@example.com",
        "title": "Error al generar reportes mensuales",
        "description": (
            "El reporte de ventas mensual se queda cargando indefinidamente y nunca termina "
            "de generarse, sin importar el rango de fechas que seleccionemos."
        ),
        "type": RequestType.INCIDENT,
        "priority": RequestPriority.HIGH,
        "status": RequestStatus.IN_PROGRESS,
    },
    {
        "company_name": "TechNova Industries",
        "created_by_email": "technova.user1@example.com",
        "assigned_to_email": None,
        "title": "Consulta sobre integración con API",
        "description": (
            "Queremos integrar nuestro CRM con la API del portal para sincronizar tickets "
            "automáticamente, ¿tienen documentación técnica disponible?"
        ),
        "type": RequestType.QUESTION,
        "priority": RequestPriority.LOW,
        "status": RequestStatus.PENDING,
    },
    {
        "company_name": "Global Services Corp",
        "created_by_email": "global.user3@example.com",
        "assigned_to_email": "support1@example.com",
        "title": "El sistema se cae al subir archivos grandes",
        "description": (
            "Al subir archivos de más de 20MB la aplicación se congela por completo y hay "
            "que recargar la página, perdiendo el progreso de la carga."
        ),
        "type": RequestType.INCIDENT,
        "priority": RequestPriority.URGENT,
        "status": RequestStatus.IN_PROGRESS,
    },
    {
        "company_name": "Global Services Corp",
        "created_by_email": "global.company@example.com",
        "assigned_to_email": None,
        "title": "Duda sobre cambio de plan",
        "description": (
            "Queríamos evaluar cambiar de plan, pero tras revisarlo internamente decidimos "
            "mantenernos en el plan actual por ahora."
        ),
        "type": RequestType.QUESTION,
        "priority": RequestPriority.MEDIUM,
        "status": RequestStatus.CANCELLED,
    },
    {
        "company_name": "Andes Digital",
        "created_by_email": "andes.user2@example.com",
        "assigned_to_email": None,
        "title": "Los correos de notificación no llegan",
        "description": (
            "Los usuarios no están recibiendo los correos de notificación cuando se responde "
            "una de sus solicitudes. Revisamos spam y no aparecen ahí tampoco."
        ),
        "type": RequestType.INCIDENT,
        "priority": RequestPriority.HIGH,
        "status": RequestStatus.PENDING,
    },
    {
        "company_name": "Andes Digital",
        "created_by_email": "andes.company@example.com",
        "assigned_to_email": "support2@example.com",
        "title": "Solicitud de nuevo usuario administrador",
        "description": (
            "Necesitamos dar de alta a un nuevo usuario con permisos administrativos para "
            "nuestra compañía, reemplazando a un colaborador que ya no está en el equipo."
        ),
        "type": RequestType.REQUEST,
        "priority": RequestPriority.LOW,
        "status": RequestStatus.RESOLVED,
    },
    {
        "company_name": "Caribbean Logistics",
        "created_by_email": "caribbean.user1@example.com",
        "assigned_to_email": None,
        "title": "Fallo al exportar datos a Excel",
        "description": (
            "El botón de exportar a Excel no responde y no se descarga ningún archivo, "
            "tanto en el listado de solicitudes como en el de usuarios."
        ),
        "type": RequestType.INCIDENT,
        "priority": RequestPriority.MEDIUM,
        "status": RequestStatus.PENDING,
    },
    {
        "company_name": "Caribbean Logistics",
        "created_by_email": "caribbean.user4@example.com",
        "assigned_to_email": "support1@example.com",
        "title": "Consulta sobre tiempos de respuesta del soporte",
        "description": (
            "¿Cuál es el tiempo de respuesta esperado para solicitudes de prioridad baja? "
            "Queremos ajustar las expectativas internas de nuestro equipo."
        ),
        "type": RequestType.QUESTION,
        "priority": RequestPriority.LOW,
        "status": RequestStatus.IN_PROGRESS,
    },
]


async def seed_users(
    session_factory: async_sessionmaker[AsyncSession] = async_session_factory,
) -> tuple[int, int]:
    """Create the seed users that don't already exist (matched by email).

    Returns (created_count, skipped_count).
    """
    created = 0
    skipped = 0

    async with session_factory() as session:
        try:
            repo = UserRepository(session)

            for spec in SEED_USERS:
                if await repo.get_by_email(spec["email"]) is not None:
                    print(f"→ {spec['email']} already exists")
                    skipped += 1
                    continue

                password = os.getenv(spec["password_env"], spec["password_default"])
                now = datetime.now(timezone.utc)
                await repo.create(
                    User(
                        id=uuid.uuid4(),
                        company_id=None,
                        name=spec["name"],
                        email=spec["email"],
                        password_hash=hash_password(password),
                        role=spec["role"],
                        is_active=True,
                        created_at=now,
                        updated_at=now,
                    )
                )
                print(f"✓ Created {spec['email']}")
                created += 1

            await session.commit()
        except Exception:
            await session.rollback()
            raise

    return created, skipped


async def seed_companies(
    session_factory: async_sessionmaker[AsyncSession] = async_session_factory,
) -> tuple[int, int, int, int]:
    """Create the seed companies and their associated users that don't
    already exist (companies matched by name, users matched by email).

    Returns (companies_created, companies_skipped, users_created, users_skipped).
    """
    companies_created = 0
    companies_skipped = 0
    users_created = 0
    users_skipped = 0

    async with session_factory() as session:
        try:
            company_repo = CompanyRepository(session)
            user_repo = UserRepository(session)

            print("\nCompanies:")
            company_ids: dict[str, uuid.UUID] = {}
            for spec in SEED_COMPANIES:
                existing = await company_repo.get_by_name(spec["name"])
                if existing is not None:
                    print(f"→ {spec['name']} already exists")
                    companies_skipped += 1
                    company_ids[spec["name"]] = existing.id
                    continue

                now = datetime.now(timezone.utc)
                company = await company_repo.create(
                    Company(
                        id=uuid.uuid4(),
                        name=spec["name"],
                        is_active=True,
                        created_at=now,
                        updated_at=now,
                    )
                )
                print(f"✓ Created {spec['name']}")
                companies_created += 1
                company_ids[spec["name"]] = company.id

            print("\nCompany users:")
            password = os.getenv("SEED_COMPANY_USER_PASSWORD", "Company123!")
            for spec in SEED_COMPANIES:
                company_id = company_ids[spec["name"]]

                for user_spec in spec["users"]:
                    if await user_repo.get_by_email(user_spec["email"]) is not None:
                        print(f"→ {user_spec['email']} already exists")
                        users_skipped += 1
                        continue

                    now = datetime.now(timezone.utc)
                    await user_repo.create(
                        User(
                            id=uuid.uuid4(),
                            company_id=company_id,
                            name=user_spec["name"],
                            email=user_spec["email"],
                            password_hash=hash_password(password),
                            role=user_spec["role"],
                            is_active=True,
                            created_at=now,
                            updated_at=now,
                        )
                    )
                    print(f"✓ Created {user_spec['email']} → {spec['name']}")
                    users_created += 1

            await session.commit()
        except Exception:
            await session.rollback()
            raise

    return companies_created, companies_skipped, users_created, users_skipped


async def seed_requests(
    session_factory: async_sessionmaker[AsyncSession] = async_session_factory,
) -> tuple[int, int]:
    """Create the seed requests that don't already exist yet, using the
    users and companies created by `seed_users`/`seed_companies` above —
    each request's `created_by` is one of a company's own seed users, and
    `assigned_to` (when set) is one of the SUPPORT seed users.

    Requests are matched across runs by (company, title) — there is no
    natural unique key on Request, same reasoning as company name above.

    Returns (created_count, skipped_count).
    """
    created = 0
    skipped = 0

    async with session_factory() as session:
        try:
            company_repo = CompanyRepository(session)
            user_repo = UserRepository(session)
            request_repo = RequestRepository(session)

            existing_titles_by_company: dict[uuid.UUID, set[str]] = {}

            for spec in SEED_REQUESTS:
                company = await company_repo.get_by_name(spec["company_name"])
                if company is None:
                    print(f"→ Skipping “{spec['title']}”: company {spec['company_name']!r} not found")
                    skipped += 1
                    continue

                creator = await user_repo.get_by_email(spec["created_by_email"])
                if creator is None:
                    print(f"→ Skipping “{spec['title']}”: user {spec['created_by_email']!r} not found")
                    skipped += 1
                    continue

                if company.id not in existing_titles_by_company:
                    existing = await request_repo.list_by_company(company.id)
                    existing_titles_by_company[company.id] = {r.title for r in existing}

                if spec["title"] in existing_titles_by_company[company.id]:
                    print(f"→ “{spec['title']}” already exists for {spec['company_name']}")
                    skipped += 1
                    continue

                assigned_to = None
                if spec["assigned_to_email"] is not None:
                    assignee = await user_repo.get_by_email(spec["assigned_to_email"])
                    assigned_to = assignee.id if assignee is not None else None

                now = datetime.now(timezone.utc)
                await request_repo.create(
                    Request(
                        id=uuid.uuid4(),
                        company_id=company.id,
                        created_by=creator.id,
                        assigned_to=assigned_to,
                        title=spec["title"],
                        description=spec["description"],
                        type=spec["type"],
                        priority=spec["priority"],
                        status=spec["status"],
                        created_at=now,
                        updated_at=now,
                        resolved_at=now if spec["status"] == RequestStatus.RESOLVED else None,
                    )
                )
                existing_titles_by_company[company.id].add(spec["title"])
                print(f"✓ Created “{spec['title']}” for {spec['company_name']}")
                created += 1

            await session.commit()
        except Exception:
            await session.rollback()
            raise

    return created, skipped


async def run() -> None:
    print("Starting database seed...\n")

    print("Users:")
    await seed_users()

    companies_created, companies_skipped, users_created, users_skipped = await seed_companies()

    print("\nRequests:")
    requests_created, requests_skipped = await seed_requests()

    print("\nSeed completed successfully.\n")
    print(f"Companies created: {companies_created}")
    print(f"Companies skipped: {companies_skipped}")
    print()
    print(f"Users created: {users_created}")
    print(f"Users skipped: {users_skipped}")
    print()
    print(f"Requests created: {requests_created}")
    print(f"Requests skipped: {requests_skipped}")


def main() -> None:
    asyncio.run(run())


if __name__ == "__main__":
    main()
