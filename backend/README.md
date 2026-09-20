# Backend de HairSaloon

## Objetivo

Separar la lógica de negocio y la persistencia del frontend para que la aplicación pueda crecer sin depender de `localStorage` ni del estado global del navegador.

## Arquitectura propuesta

El backend se va a estructurar como una API REST independiente con estas capas:

- Capa HTTP: rutas y controladores
- Capa de servicios: validaciones, reglas de negocio, consultas y transformaciones
- Capa de persistencia: acceso al archivo JSON o a una base de datos posterior
- Capa de configuración: variables de entorno y puerto

## Responsabilidad por capa

### Frontend

- Renderizado de pantallas y componentes
- Formularios y feedback visual
- Filtros, búsquedas y navegación
- Llamadas HTTP al backend
- Manejo de estados visuales y UX

### Backend

- Validación de profesionales y turnos
- Verificación de conflictos de horario
- Reglas de negocio como:
  - no eliminar profesional con turnos activos
  - no reservar turno duplicado
  - no editar un turno cancelado
  - no asignar profesional inexistente
- Persistencia centralizada
- Consulta y administración de datos

## Entidades principales

### Profesional

- id: number
- nombre: string
- apellido: string
- especialidad: string
- diasDisponibles: string[]
- horariosDisponibles: string[]
- descripcion: string
- avatarUrl: string

### Turno

- id: number
- profesionalId: number
- dia: string
- hora: string
- clienteNombre: string
- especialidad: string
- estado: 'confirmado' | 'cancelado'

### Configuración

- ultimoIdProfesional
- ultimoIdTurno

## Regla de negocio central

El backend debe ser la fuente de verdad. El cliente solo envía datos y recibe resultado. Todas las decisiones críticas se validan en el backend antes de persistir cambios.

## Persistencia inicial

Se mantiene el dataset en un archivo JSON dentro del backend, con la misma estructura que hoy tiene `src/data/db.json`, para no romper el flujo de trabajo. Más adelante se puede migrar a PostgreSQL, MySQL o MongoDB.

## Endpoints propuestos

### Profesionales

- `GET /api/profesionales` -> listar todos los profesionales
- `GET /api/profesionales/:id` -> obtener un profesional por id
- `POST /api/profesionales` -> crear profesional
- `PUT /api/profesionales/:id` -> actualizar profesional
- `DELETE /api/profesionales/:id` -> eliminar profesional si no tiene turnos activos

### Turnos

- `GET /api/turnos` -> listar todos los turnos
- `GET /api/turnos/profesional/:id` -> turnos por profesional
- `GET /api/turnos/cliente/:nombre` -> turnos por nombre de cliente
- `POST /api/turnos` -> reservar turno
- `PUT /api/turnos/:id` -> modificar turno
- `PATCH /api/turnos/:id/cancelar` -> cancelar turno

### Disponibilidad

- `GET /api/disponibilidad/profesional/:id?dia=...` -> consultar días y horarios disponibles

## Tecnologías sugeridas

- Node.js + Express
- Estructura modular por carpetas
- fs/promises para persistencia inicial en JSON
- Variables de entorno en `.env`
- Base de datos posterior mediante Prisma o Sequelize

## Estructura inicial

```text
backend/
  README.md
  package.json
  src/
    app.js
    server.js
    config/
      index.js
    controllers/
      profesionalesController.js
      turnosController.js
    routes/
      profesionales.routes.js
      turnos.routes.js
    services/
      agendaService.js
    data/
      db.json
```

## Siguiente paso

La primera integración será dejar el backend corriendo en un puerto separado y conectar el frontend a estas rutas con `fetch`, manteniendo la UI intacta mientras se reemplaza la persistencia local por la API.
