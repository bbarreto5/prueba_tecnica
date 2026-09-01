# Prueba Técnica — Resumen

## 1. Interpretación de producto

### ¿Cuál crees que era el problema real del cliente?

La consultora no dispone de un canal centralizado y trazable para gestionar las incidencias y solicitudes de sus clientes. Actualmente la información se encuentra dispersa entre email, llamadas y WhatsApp, dificultando el seguimiento, la visibilidad del estado, la consulta del historial y la detección de solicitudes duplicadas.

### ¿Qué funcionalidades has decidido implementar primero, y por qué?

El MVP incluye autenticación y autorización por roles, gestión de empresas y usuarios, creación y gestión de solicitudes, asignación a soporte, mensajería, manejo de estados (cancelación, devolución y resolución), dashboards según el rol, historial, filtros y notificaciones por email.

La prioridad fue construir primero el MVP funcional de extremo a extremo, antes que funcionalidades secundarias o de optimización.

### ¿Qué funcionalidades dejé fuera y por qué?

Se dejaron para una siguiente etapa funcionalidades como chatbot con IA, analítica avanzada, reportes, notificaciones en tiempo real e integraciones externas. No eran necesarias para validar el flujo principal.

### ¿Qué preguntas haría antes de desarrollar una V2?

- ¿Cómo debe funcionar la asignación automática de solicitudes?
- ¿Qué SLA y prioridades existen?
- ¿Qué métricas necesita el equipo de soporte?
- ¿Se requieren archivos adjuntos?
- ¿Se necesita auditoría completa de acciones?
- ¿Se requieren notificaciones en tiempo real?
- ¿Qué volumen de usuarios y solicitudes se espera?

## 2. Arquitectura

### ¿Por qué has elegido esta arquitectura?

Se utilizó una arquitectura modular con separación de responsabilidades. El backend separa la lógica de negocio de infraestructura y servicios externos, mientras que el frontend organiza las funcionalidades por módulos. El objetivo fue mantener el MVP sencillo, evitando sobrearquitectura y dejando espacio para evolucionarlo.

### ¿Cómo has modelado los datos?

El núcleo del modelo está compuesto por:

```text
Company ---> Users
User ---> Requests ---> Messages
Support ---> Requests asignadas
```

Una solicitud pertenece a un usuario y una empresa, puede tener un soporte asignado y mantiene sus mensajes e historial. Los permisos dependen del rol del usuario.

### ¿Qué decisiones tomé pensando en la escalabilidad?

Se priorizó una arquitectura modular con separación de responsabilidades, servicios independientes por funcionalidad, DTOs y validaciones de entrada, paginación y filtros en los listados, y desacoplamiento de servicios externos como el email. La configuración se gestiona mediante variables de entorno y se evita incorporar dependencias o complejidad innecesaria mientras no exista una necesidad real.

La arquitectura permite posteriormente incorporar cache, colas, procesamiento asíncrono o servicios adicionales sin tener que modificar completamente el dominio.

### ¿Qué aspectos de seguridad has considerado?

Se implementaron autenticación mediante JWT y autorización por roles. También se validan permisos sobre operaciones sensibles, como la gestión de usuarios por empresa y la atención de solicitudes asignadas. Las credenciales externas se mantienen en variables de entorno y no se exponen contraseñas, tokens ni secretos en logs o emails.

## 3. Estado de la entrega

### ¿Qué está terminado, qué está a medias y qué no has llegado a tocar?

**Terminado:**

- Autenticación y manejo de sesión.
- Autorización por roles.
- Dashboards de ADMIN, SUPPORT y COMPANY.
- Gestión de empresas y usuarios.
- Gestión completa de solicitudes y mensajes.
- Asignación, devolución, cancelación y resolución.
- Historial y paginación.
- Integración frontend/backend.
- Notificaciones por email.

**Pendiente de evolución:**

El producto está funcional como MVP, pero antes de producción reforzaría pruebas automatizadas, QA, seguridad, manejo de errores y observabilidad.

**No implementado:**

- Chatbot con IA.
- Analítica y reportes avanzados.
- Notificaciones en tiempo real.
- Integraciones externas.
- Sistema de colas para procesos asíncronos.

### ¿Cómo continuaría el trabajo?

Continuaría con QA y pruebas automatizadas, seguido de hardening de seguridad y observabilidad. Después priorizaría las funcionalidades según feedback real del negocio, especialmente métricas de soporte, archivos adjuntos, notificaciones en tiempo real e IA. Criterio principal: mantener la solución simple y agregar complejidad únicamente cuando exista una necesidad real del producto.
