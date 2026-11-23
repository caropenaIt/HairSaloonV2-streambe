import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'
import { config } from '../config/index.js'
import {
  obtenerAdministradorPorCorreo,
  obtenerClientePorCorreo,
  registrarAdministrador,
  registrarCliente,
} from './agendaService.js'
import {
  crearErrorValidacion,
  validarCamposPermitidos,
  validarTexto,
} from './validaciones.js'

const DURACION_SESION_SEGUNDOS = 60 * 60 * 8
const NOMBRE_COOKIE_SESION = 'hairSaloonSesion'
const MAXIMA_SESIONES_REVOCADAS = 20000
let secretoSesionActual = `${config.secretoSesion}:${randomBytes(32).toString('hex')}`
const sesionesRevocadas = new Map()

function crearUsuarioSeguro(usuario) {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
  }
}

function compararSecreto(ingresado, esperado) {
  const hashIngresado = createHash('sha256').update(ingresado).digest()
  const hashEsperado = createHash('sha256').update(esperado).digest()
  return timingSafeEqual(hashIngresado, hashEsperado)
}

function crearHashContrasena(contrasena, salt = randomBytes(16).toString('hex')) {
  return {
    salt,
    hash: scryptSync(contrasena, salt, 64).toString('hex'),
  }
}

function validarCorreo(correo) {
  const valor = validarTexto(correo, 'correo', 254).toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    throw crearErrorValidacion('Ingresá un correo válido.')
  }
  return valor
}

function validarContrasena(contrasena, minimo = 1) {
  if (
    typeof contrasena !== 'string' ||
    contrasena.trim().length < minimo ||
    contrasena.length > 128
  ) {
    throw crearErrorValidacion(
      minimo > 1
        ? `La contraseña debe tener entre ${minimo} y 128 caracteres.`
        : 'La contraseña no es válida.'
    )
  }
  return contrasena
}

function crearErrorCredencialesInvalidas() {
  const error = new Error('Correo o contraseña incorrectos.')
  error.status = 401
  return error
}

function crearTokenSesion(usuario) {
  const contenido = Buffer.from(
    JSON.stringify({
      sub: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      exp: Math.floor(Date.now() / 1000) + DURACION_SESION_SEGUNDOS,
    })
  ).toString('base64url')
  const firma = createHmac('sha256', secretoSesionActual)
    .update(contenido)
    .digest('base64url')
  return `${contenido}.${firma}`
}

function obtenerSesion(token) {
  if (typeof token !== 'string') {
    return null
  }

  const [contenido, firma, extra] = token.split('.')
  if (!contenido || !firma || extra) {
    return null
  }

  const firmaEsperada = createHmac('sha256', secretoSesionActual)
    .update(contenido)
    .digest('base64url')
  if (!compararSecreto(firma, firmaEsperada)) {
    return null
  }

  try {
    const sesion = JSON.parse(Buffer.from(contenido, 'base64url').toString('utf8'))
    if (
      typeof sesion.sub !== 'string' ||
      !['administrador', 'cliente'].includes(sesion.rol) ||
      !Number.isInteger(sesion.exp) ||
      sesion.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null
    }

    limpiarSesionesRevocadas()
    const huella = createHash('sha256').update(token).digest('hex')
    if (sesionesRevocadas.has(huella)) {
      return null
    }

    return {
      id: sesion.sub,
      nombre: sesion.nombre,
      correo: sesion.correo,
      rol: sesion.rol,
      venceEn: sesion.exp,
    }
  } catch {
    return null
  }
}

export async function registrarCuentaCliente(datos) {
  validarCamposPermitidos(datos, ['nombre', 'correo', 'contrasena'], 'cuenta')
  const nombre = validarTexto(datos.nombre, 'nombre', 100)
  const correo = validarCorreo(datos.correo)
  const contrasena = validarContrasena(datos.contrasena, 12)

  if (
    config.administradorCorreo &&
    correo === config.administradorCorreo.trim().toLowerCase()
  ) {
    const error = new Error('Ese correo no está disponible para el registro.')
    error.status = 409
    throw error
  }

  const hash = crearHashContrasena(contrasena)
  const usuario = await registrarCliente({
    nombre,
    correo,
    passwordSalt: hash.salt,
    passwordHash: hash.hash,
  })

  return crearUsuarioSeguro({ ...usuario, rol: 'cliente' })
}

export async function registrarCuentaAdministrador(datos) {
  validarCamposPermitidos(datos, ['nombre', 'correo', 'contrasena'], 'cuenta')
  const nombre = validarTexto(datos.nombre, 'nombre', 100)
  const correo = validarCorreo(datos.correo)
  const contrasena = validarContrasena(datos.contrasena, 12)

  if (
    config.administradorCorreo &&
    correo === config.administradorCorreo.trim().toLowerCase()
  ) {
    const error = new Error('Ese correo está reservado para otra cuenta.')
    error.status = 409
    throw error
  }

  const hash = crearHashContrasena(contrasena)
  const administrador = await registrarAdministrador({
    nombre,
    correo,
    passwordSalt: hash.salt,
    passwordHash: hash.hash,
  })

  return crearUsuarioSeguro({ ...administrador, rol: 'administrador' })
}

export async function iniciarSesionCliente(correoIngresado, contrasenaIngresada) {
  const correo = validarCorreo(correoIngresado)
  const contrasena = validarContrasena(contrasenaIngresada)
  const correoAdministrador = config.administradorCorreo?.trim().toLowerCase()

  if (correoAdministrador && correo === correoAdministrador) {
    throw crearErrorCredencialesInvalidas()
  }

  const usuario = await obtenerClientePorCorreo(correo)
  if (!usuario) {
    throw crearErrorCredencialesInvalidas()
  }

  const hash = scryptSync(contrasena, usuario.passwordSalt, 64).toString('hex')
  if (!compararSecreto(hash, usuario.passwordHash)) {
    throw crearErrorCredencialesInvalidas()
  }

  return crearUsuarioSeguro({ ...usuario, rol: 'cliente' })
}

export async function iniciarSesionAdministrador(
  correoIngresado,
  contrasenaIngresada
) {
  const correo = validarCorreo(correoIngresado)
  const contrasena = validarContrasena(contrasenaIngresada)
  const correoAdministrador = config.administradorCorreo?.trim().toLowerCase()

  if (
    correoAdministrador &&
    correo === correoAdministrador
  ) {
    if (
      !config.administradorContrasena ||
      !compararSecreto(contrasena, config.administradorContrasena)
    ) {
      throw crearErrorCredencialesInvalidas()
    }

    return {
      id: 'administrador',
      nombre: 'Administración',
      correo: correoAdministrador,
      rol: 'administrador',
    }
  }

  const administrador = await obtenerAdministradorPorCorreo(correo)
  if (!administrador) {
    throw crearErrorCredencialesInvalidas()
  }

  const hash = scryptSync(
    contrasena,
    administrador.passwordSalt,
    64
  ).toString('hex')
  if (!compararSecreto(hash, administrador.passwordHash)) {
    throw crearErrorCredencialesInvalidas()
  }

  return crearUsuarioSeguro({ ...administrador, rol: 'administrador' })
}

export function crearCookieSesion(usuario) {
  const atributosSeguros = config.cookieSeguro ? '; Secure' : ''
  return `${NOMBRE_COOKIE_SESION}=${crearTokenSesion(usuario)}; Max-Age=${DURACION_SESION_SEGUNDOS}; Path=/; HttpOnly; SameSite=${config.cookieSameSite}${atributosSeguros}`
}

export function borrarCookieSesion() {
  const atributosSeguros = config.cookieSeguro ? '; Secure' : ''
  return `${NOMBRE_COOKIE_SESION}=; Max-Age=0; Path=/; HttpOnly; SameSite=${config.cookieSameSite}${atributosSeguros}`
}

export function leerSesionDeSolicitud(solicitud) {
  const token = leerTokenDeSolicitud(solicitud)

  return token ? obtenerSesion(token) : null
}

export function revocarSesionDeSolicitud(solicitud) {
  const token = leerTokenDeSolicitud(solicitud)
  const sesion = token ? obtenerSesion(token) : null

  if (!token || !sesion) {
    return
  }

  if (sesionesRevocadas.size >= MAXIMA_SESIONES_REVOCADAS) {
    return false
  }

  sesionesRevocadas.set(
    createHash('sha256').update(token).digest('hex'),
    sesion.venceEn
  )
  return true
}

function leerTokenDeSolicitud(solicitud) {
  const cookie = solicitud.headers.cookie
    ?.split(';')
    .map((parte) => parte.trim())
    .find((parte) => parte.startsWith(`${NOMBRE_COOKIE_SESION}=`))

  return cookie ? cookie.slice(NOMBRE_COOKIE_SESION.length + 1) : null
}

function limpiarSesionesRevocadas() {
  const ahora = Math.floor(Date.now() / 1000)
  for (const [huella, venceEn] of sesionesRevocadas) {
    if (venceEn <= ahora) {
      sesionesRevocadas.delete(huella)
    }
  }
}

export function obtenerUsuarioSeguro(usuario) {
  return crearUsuarioSeguro(usuario)
}
