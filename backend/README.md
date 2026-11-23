# Backend de HairSaloonV2

API REST de la aplicación, implementada con Node.js 22 o superior y Express. El backend valida permisos y reglas de negocio, y persiste profesionales, turnos y cuentas registradas en un archivo JSON.

## Desarrollo local

1. Desde esta carpeta, instalá las dependencias con `npm install`.
2. Copiá `.env.example` como `.env` y reemplazá los valores de ejemplo por la configuración local. No compartas ni publiques `.env`.
3. Iniciá el servidor con `npm run dev` (modo de desarrollo con recarga) o `npm start`.

El servidor usa el puerto `3001` de forma predeterminada. Comprobá que esté disponible en `http://localhost:3001/api/health`. El frontend Vite usa `http://localhost:3001/api` por defecto; si la API corre en otra dirección, configurá `VITE_API_BASE_URL` en el frontend.

El perfil «Backend: administrador asignado» de VS Code carga este mismo archivo `.env`. Si no configurás `ADMIN_EMAIL` y `ADMIN_PASSWORD` en desarrollo, el servidor puede iniciar, pero no habrá una cuenta administrativa inicial configurada.

## Variables de entorno

| Variable | Requisito y uso |
|---|---|
| `NODE_ENV` | Usá `production` en producción. En desarrollo, las cookies no llevan `Secure` y usan `SameSite=Lax`. |
| `PORT` | Puerto HTTP. Predeterminado: `3001`; en un host, usá el puerto que el host asigne. |
| `ADMIN_EMAIL` | Correo reservado para el acceso de la cuenta administradora inicial. Debe acompañarse de `ADMIN_PASSWORD`; es obligatorio en producción. |
| `ADMIN_PASSWORD` | Contraseña de la cuenta inicial, de al menos 12 caracteres. Es obligatoria junto con `ADMIN_EMAIL` en producción. |
| `SESSION_SECRET` | Secreto de sesión de al menos 32 caracteres; obligatorio en producción. En desarrollo, si se omite, se genera uno nuevo al iniciar el proceso. |
| `CORS_ORIGINS` | Orígenes frontend permitidos, separados por comas y sin rutas ni barras finales. Obligatoria en producción; en desarrollo, por defecto permite `http://localhost:5173` y `http://127.0.0.1:5173`. |
| `DATA_FILE_PATH` | Ruta opcional al archivo JSON de datos. Por defecto se usa `backend/src/data/db.json`. |
| `TRUST_PROXY` | Opcional. Configurá el número de saltos confiables o las IP/rangos del proxy. No uses `true`; el backend lo rechaza. |

En producción, serví el frontend y la API por HTTPS. Las cookies de sesión usan `HttpOnly`, `SameSite=None` y `Secure` para solicitudes con credenciales entre dominios. Si el navegador bloquea cookies entre sitios, usá dominios propios del mismo sitio, por ejemplo `app.ejemplo.com` y `api.ejemplo.com`.

## Roles y autenticación

- **Cliente:** se registra públicamente en `/acceso` y entra por `/acceso`. El backend crea exclusivamente cuentas de rol `cliente`; la contraseña debe tener entre 12 y 128 caracteres.
- **Administrador inicial:** se configura con `ADMIN_EMAIL` y `ADMIN_PASSWORD` en el entorno del backend. Inicia sesión en `/admin/acceso`; no se crea mediante el registro público ni se guarda como una cuenta normal en el JSON.
- **Administradores adicionales:** se registran desde `/admin/acceso/registro` o `POST /api/auth/admin/registro` únicamente cuando ya hay una sesión administradora. El enlace de registro no habilita un alta anónima: primero se debe iniciar sesión con la cuenta administrativa inicial. La contraseña debe tener entre 12 y 128 caracteres.
- Los correos son únicos entre las cuentas registradas de ambos roles. El correo de `ADMIN_EMAIL` queda reservado para la cuenta inicial y no puede registrarse como cliente ni como administrador adicional.
- Los dos formularios usan flujos separados y no aceptan las credenciales del otro rol. El navegador mantiene una sola sesión a la vez; iniciar sesión como otro rol reemplaza la sesión vigente.

Las cuentas registradas se guardan en `usuarios` o `administradores` dentro del JSON, con la contraseña almacenada mediante scrypt y sal. La identidad de la cuenta inicial proviene de las variables de entorno.

La sesión se transporta en una cookie `HttpOnly` con duración de ocho horas. Cerrar sesión invalida el token en el proceso actual; al reiniciar el backend, las sesiones anteriores dejan de ser válidas. La revocación se mantiene en memoria, por lo que el despliegue debe tener una sola instancia de backend.

El inicio de sesión permite hasta 10 intentos por IP cada 15 minutos. Cada tipo de registro permite hasta 3 cuentas por IP cada hora.

## Permisos de la API

Todas las rutas usan el prefijo `/api`.

| Método y ruta | Acceso | Función |
|---|---|---|
| `GET /health` | Público | Verifica que la API responde. |
| `GET /profesionales` | Público | Lista profesionales. |
| `GET /profesionales/:id` | Público | Consulta un profesional. |
| `POST /profesionales` | Administrador | Crea un profesional. |
| `PUT /profesionales/:id` | Administrador | Actualiza un profesional. |
| `DELETE /profesionales/:id` | Administrador | Elimina un profesional si no tiene turnos confirmados. |
| `GET /turnos` | Administrador | Lista la agenda global. |
| `GET /turnos/profesional/:id` | Administrador | Lista turnos de un profesional. |
| `GET /turnos/mis` | Cliente | Lista los turnos de la cuenta autenticada. |
| `POST /turnos` | Cliente | Reserva un turno para la cuenta autenticada. |
| `PUT /turnos/:id` | Administrador o cliente propietario | Modifica un turno no cancelado. |
| `PATCH /turnos/:id/cancelar` | Administrador o cliente propietario | Cancela un turno. |
| `GET /disponibilidad/profesional/:id?dia=...` | Cliente o administrador | Consulta horarios libres. |
| `POST /auth/registro` | Público | Crea una cuenta cliente. |
| `POST /auth/admin/registro` | Administrador | Crea una cuenta administradora adicional. |
| `POST /auth/sesion` | Público | Inicia sesión como cliente. |
| `POST /auth/admin/sesion` | Público | Inicia sesión como administrador. |
| `GET /auth/sesion` | Sesión autenticada | Devuelve la sesión actual. Sin sesión responde `401`. |
| `DELETE /auth/sesion` | Público | Cierra la sesión actual y borra la cookie. |

Aunque un administrador puede gestionar cualquier turno, solo un cliente puede reservar y consultar el espacio personal de turnos. Las rutas administrativas de profesionales y agenda verifican el rol en el backend; ocultar o cambiar pantallas del frontend no otorga permisos.

## Persistencia y despliegue

De forma predeterminada, los datos se guardan en `src/data/db.json` de esta carpeta. Si `DATA_FILE_PATH` apunta a un archivo que todavía no existe, el servidor lo inicializa copiando el dataset incluido. Las escrituras se serializan dentro del proceso y reemplazan el JSON mediante un archivo temporal.

Al iniciar, el backend crea un archivo `.lock` junto al JSON para impedir que otra instancia use el mismo archivo. Ejecutá una sola instancia sobre cada archivo de datos. Si el proceso termina abruptamente y queda un `.lock`, confirmá que no haya otro backend activo antes de quitarlo manualmente.

Para desplegar:

1. Publicá el frontend en Netlify y configurá `VITE_API_BASE_URL` con la URL HTTPS de la API terminada en `/api`. `netlify.toml` define la publicación del frontend.
2. Desplegá esta API como un servicio Node persistente, no como una función efímera. Configurá `NODE_ENV=production`, `PORT`, `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS` y, si el host ofrece un disco persistente, `DATA_FILE_PATH` dentro de ese disco.
3. Incluí en `CORS_ORIGINS` los orígenes frontend exactos. Mantené una sola réplica: ni el JSON ni el archivo de bloqueo coordinan procesos o hosts distintos.

La API no tiene un script de pruebas propio. Las pruebas del proyecto se ejecutan desde la raíz con `npm test`.
