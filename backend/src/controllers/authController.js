import {
  borrarCookieSesion,
  crearCookieSesion,
  iniciarSesionAdministrador,
  iniciarSesionCliente,
  obtenerUsuarioSeguro,
  registrarCuentaAdministrador,
  registrarCuentaCliente,
  revocarSesionDeSolicitud,
} from '../services/authService.js'
import { responderError } from './responderError.js'

export async function registrarClienteController(req, res) {
  try {
    const usuario = await registrarCuentaCliente(req.body)
    res.setHeader('Set-Cookie', crearCookieSesion(usuario))
    return res.status(201).json({ usuario })
  } catch (error) {
    return responderError(res, error)
  }
}

export async function registrarAdministradorController(req, res) {
  try {
    const usuario = await registrarCuentaAdministrador(req.body)
    res.setHeader('Set-Cookie', crearCookieSesion(usuario))
    return res.status(201).json({ usuario })
  } catch (error) {
    return responderError(res, error)
  }
}

async function responderInicioSesion(req, res, autenticar) {
  try {
    const { correo, contrasena } = req.body || {}
    const usuario = await autenticar(correo, contrasena)
    res.setHeader('Set-Cookie', crearCookieSesion(usuario))
    return res.json({ usuario })
  } catch (error) {
    return responderError(res, error, 500)
  }
}

export function iniciarSesionClienteController(req, res) {
  return responderInicioSesion(req, res, iniciarSesionCliente)
}

export function iniciarSesionAdministradorController(req, res) {
  return responderInicioSesion(req, res, iniciarSesionAdministrador)
}

export function obtenerSesionController(req, res) {
  return res.json({ usuario: obtenerUsuarioSeguro(req.usuario) })
}

export function cerrarSesionController(req, res) {
  const revocada = revocarSesionDeSolicitud(req)
  if (revocada === false) {
    return res.status(503).json({
      mensaje: 'No se pudo revocar la sesión. Intentá nuevamente más tarde.',
    })
  }

  res.setHeader('Set-Cookie', borrarCookieSesion())
  return res.json({ mensaje: 'Sesión cerrada correctamente.' })
}
