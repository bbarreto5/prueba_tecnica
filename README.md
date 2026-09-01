# Gestión de Solicitudes - Prueba Técnica

Sistema de gestión de solicitudes e incidencias desarrollado como prueba técnica. El proyecto permite administrar empresas, usuarios y solicitudes mediante un modelo de acceso por roles (**ADMIN**, **SUPPORT**, **COMPANY** y **USER**), incluyendo asignación de soporte, mensajería, cambios de estado y notificaciones por correo.

> Este repositorio está organizado como un **monorepo**, manteniendo el frontend y el backend en un único proyecto para facilitar el desarrollo y la sincronización entre ambos componentes.

---

## Arquitectura del proyecto

```text
.
├── backend/     # API REST (FastAPI + PostgreSQL)
├── frontend/    # Aplicación web (Next.js + TypeScript)
└── README.md    # Documentación general del monorepo
```

- **Frontend:** aplicación desarrollada con Next.js, TypeScript y Tailwind CSS, organizada por funcionalidades (`app`, `features`, `components`, `services`, `hooks`, etc.).
- **Backend:** API REST desarrollada en FastAPI, con arquitectura por capas, autenticación JWT, gestión de roles, servicios desacoplados y soporte para notificaciones por email.

Cada componente contiene su propia documentación de instalación y ejecución:

- 📁 `frontend/README.md`
- 📁 `backend/README.md`

---

## Requisitos

Antes de ejecutar el proyecto es necesario contar con:

- **Node.js** (para el frontend).
- **Python 3.12+** (para el backend).
- **PostgreSQL** como base de datos principal.

El backend requiere una base de datos PostgreSQL configurada mediante variables de entorno antes de iniciar la aplicación.

---

## Puesta en marcha

Cada aplicación se configura y ejecuta de forma independiente.

### Frontend

Consultar:

```text
frontend/README.md
```

### Backend

Consultar:

```text
backend/README.md
```

---

## Documentación del entregable

El documento con las decisiones de arquitectura, interpretación del producto y alcance del MVP se encuentra en:

**Documento de decisiones (Entregable):**

[Ver documento de decisiones de la prueba técnica](https://drive.google.com/file/d/1G41_3-89DKsY54aRb77xpLbR4Cr8nByA/view?usp=sharing)

---

## Tecnologías principales

| Frontend | Backend |
|----------|---------|
| Next.js | FastAPI |
| TypeScript | Python 3.12 |
| Tailwind CSS | PostgreSQL |
| Skill UI | JWT + SMTP (Email) |
