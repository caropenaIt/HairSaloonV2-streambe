import { randomBytes } from 'node:crypto'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const enProduccion = process.env.NODE_ENV === 'production'
const secretoSesion = process.env.SESSION_SECRET
const administradorCorreo = process.env.ADMIN_EMAIL
const administradorContrasena = process.env.ADMIN_PASSWORD
const rutaDatos = process.env.DATA_FILE_PATH?.trim()
const origenesPermitidos = (
  process.env.CORS_ORIGINS ||
  'http://localhost:5173,http://127.0.0.1:5173'
)
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean)
const valorProxyConfiable = process.env.TRUST_PROXY?.trim()

if (valorProxyConfiable?.toLowerCase() === 'true') {
  throw new Error(
    'TRUST_PROXY no admite "true"; configurá los saltos o rangos de proxy confiables.'
  )
}

const proxyConfiable =
  !valorProxyConfiable || valorProxyConfiable.toLowerCase() === 'false'
    ? false
    : /^\d+$/.test(valorProxyConfiable)
      ? Number(valorProxyConfiable)
      : valorProxyConfiable
          .split(',')
          .map((valor) => valor.trim())
          .filter(Boolean)

if (enProduccion && !secretoSesion) {
  throw new Error('La variable SESSION_SECRET es obligatoria en producción.')
}

if (secretoSesion && secretoSesion.length < 32) {
  throw new Error('SESSION_SECRET debe tener al menos 32 caracteres.')
}

if (Boolean(administradorCorreo) !== Boolean(administradorContrasena)) {
  throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD deben configurarse juntos.')
}

if (
  enProduccion &&
  (!administradorCorreo || !administradorContrasena)
) {
  throw new Error('ADMIN_EMAIL y ADMIN_PASSWORD son obligatorias en producción.')
}

if (administradorContrasena && administradorContrasena.length < 12) {
  throw new Error('ADMIN_PASSWORD debe tener al menos 12 caracteres.')
}

if (
  administradorCorreo &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(administradorCorreo)
) {
  throw new Error('ADMIN_EMAIL debe ser un correo válido.')
}

if (enProduccion && !process.env.CORS_ORIGINS) {
  throw new Error('CORS_ORIGINS es obligatoria en producción.')
}

export const config = {
  puerto: Number(process.env.PORT) || 3001,
  archivoDatos: rutaDatos
    ? pathToFileURL(resolve(rutaDatos))
    : new URL('../data/db.json', import.meta.url),
  secretoSesion: secretoSesion || randomBytes(32).toString('hex'),
  administradorCorreo,
  administradorContrasena,
  cookieSeguro: enProduccion,
  cookieSameSite: enProduccion ? 'None' : 'Lax',
  origenesPermitidos,
  proxyConfiable,
}
