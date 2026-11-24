# HairSaloonV2

Aplicación web para consultar profesionales y reservar turnos. Los clientes administran sus propias reservas y el personal administrador gestiona profesionales y la agenda global.

Un remake pensando en un proyecto previo de reserva de turnos de peluquería de Hair Saloon para CoderHouse en 2024: https://caropenait.github.io/simulador-turnos-JS-CoderHouse-CaroPena/

## Tecnologías y lenguajes

- **Frontend:** React 19, React Router 7 y Vite 8.
- **Backend:** Node.js 22 o superior y Express 4, como API REST.
- **Lenguajes y formatos:** JavaScript con módulos ES, JSX para los componentes React, CSS para los estilos, JSON para los datos y HTML como documento de entrada. El proyecto no usa TypeScript.
- **Pruebas:** Vitest.
- **Persistencia actual:** archivo JSON en el backend; no se requiere una base de datos externa.

## Componentes principales

- **Estructura y navegación:** `Layout`, `Navbar` y `Footer`.
- **Acceso:** `Acceso`, con formularios separados para clientes y administradores.
- **Área de cliente:** `ClienteHome`, `ReservarTurno` y `MisTurnos`.
- **Administración:** `AdminHome`, `GestionProfesionales` y `GestionTurnos`.
- **Profesionales:** `ProfesionalList`, `ProfesionalCard`, `ProfesionalForm` y `FiltroEspecialidad`.
- **Turnos:** `TurnoList`, `TurnoCard`, `TurnoForm`, `SelectorProfesional`, `SelectorFechaHora` y `ConfirmacionTurno`.
- **Elementos reutilizables:** `Boton`, `Modal`, `MensajeVacio` y `AvatarProfesional`.
- **Estado y lógica compartida:** `AppContext` y los hooks `useProfesionales`, `useTurnos` y `useDisponibilidad`.

El frontend está organizado en `src/pages`, `src/components`, `src/context`, `src/hooks`, `src/services`, `src/styles` y `src/utils`. La API está en `backend/src`, separada en rutas, controladores, servicios, middleware y configuración.

El backend es la fuente principal de datos y el frontend realiza las operaciones mediante la API. Se conserva lógica local heredada de `localStorage` y del JSON de `src/data` como estado inicial de respaldo; no reemplaza la persistencia del backend.

## Iniciar en desarrollo

Se necesita Node.js 22 o superior. Ejecutá el frontend y el backend en terminales separadas:

1. En la raíz del proyecto, ejecutá `npm install` y después `npm run dev`. Vite publica la aplicación en `http://localhost:5173`.
2. En `backend/`, ejecutá `npm install`. Copiá `backend/.env.example` como `backend/.env`, editá las variables de administración y ejecutá `npm run dev` (recarga al cambiar archivos) o `npm start`.
3. Abrí la dirección que muestra Vite. El frontend usa por defecto la API en `http://localhost:3001/api`.

El perfil de depuración «Backend: administrador asignado» en VS Code también carga `backend/.env`. No publiques ese archivo ni sus credenciales. La guía completa de variables y despliegue está en [backend/README.md](./backend/README.md).

## Acceso de cada rol

- **Cliente:** en `/acceso`, creá una cuenta o iniciá sesión con una cuenta cliente. El registro es público y las contraseñas nuevas deben tener al menos 12 caracteres. El cliente puede reservar, ver y gestionar sus propios turnos.
- **Administrador:** en `/admin/acceso`, iniciá sesión con la cuenta inicial configurada por `ADMIN_EMAIL` y `ADMIN_PASSWORD`, o con las credenciales de una cuenta administradora adicional ya registrada. No hay credenciales predeterminadas en el código; en desarrollo se configuran en `backend/.env` y en producción como variables del servicio.
- **Administradores adicionales:** una vez iniciada una sesión de administrador, se pueden crear desde el panel o en `/admin/acceso/registro`. Esta operación no es un registro público y no puede realizarse desde una sesión cliente o anónima. Si abrís esa ruta sin sesión administrativa, volverás al acceso de administración.

Los accesos son independientes y cada uno valida únicamente las cuentas de su rol. El navegador mantiene una sola sesión activa: al iniciar sesión con otro rol se reemplaza la sesión anterior. Cerrá sesión antes de cambiar de cuenta o rol.

## Pruebas y despliegue

- `npm run build` genera la versión de producción del frontend en `dist/`.
- `npm test` ejecuta las pruebas del proyecto desde la raíz.
- Netlify aloja el frontend mediante la configuración de `netlify.toml`. Definí `VITE_API_BASE_URL` con la URL HTTPS del backend y el sufijo `/api`; la variable se incorpora durante la publicación.
- El backend debe desplegarse como un servicio Node persistente con almacenamiento persistente para el JSON y una sola instancia. No se debe ejecutar como función efímera de Netlify: el archivo de datos y el bloqueo de instancia requieren disco persistente.

Para secretos, CORS, cookies, persistencia y el resto de los requisitos de producción, consultá [backend/README.md](./backend/README.md).
