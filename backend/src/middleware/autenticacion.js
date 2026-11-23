import { leerSesionDeSolicitud } from '../services/authService.js'

export function permitirRegistroAdministrador(req, res, next) {
  res.setHeader('Cache-Control', 'no-store')
  const usuario = leerSesionDeSolicitud(req)

  if (usuario?.rol === 'administrador') {
    req.usuario = usuario
    return next()
  }

  if (usuario) {
    return res
      .status(403)
      .json({ mensaje: 'No tenés permiso para realizar esta acción.' })
  }

  return res.status(401).json({
    mensaje:
      'Iniciá sesión como administrador para crear otra cuenta.',
  })
}

export function requerirAutenticacion(...rolesPermitidos) {
  return (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store')
    const usuario = leerSesionDeSolicitud(req)

    if (!usuario) {
      return res.status(401).json({ mensaje: 'Iniciá sesión para continuar.' })
    }

    if (rolesPermitidos.length > 0 && !rolesPermitidos.includes(usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tenés permiso para realizar esta acción.' })
    }

    req.usuario = usuario
    return next()
  }
}
