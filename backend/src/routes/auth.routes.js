import { Router } from 'express'
import {
  cerrarSesionController,
  iniciarSesionAdministradorController,
  iniciarSesionClienteController,
  obtenerSesionController,
  registrarAdministradorController,
  registrarClienteController,
} from '../controllers/authController.js'
import {
  permitirRegistroAdministrador,
  requerirAutenticacion,
} from '../middleware/autenticacion.js'
import { crearLimitadorSolicitudes } from '../middleware/limitarSolicitudes.js'

const router = Router()
const limitarRegistro = crearLimitadorSolicitudes({
  maximo: 3,
  ventanaMs: 60 * 60 * 1000,
})
const limitarRegistroAdministrador = crearLimitadorSolicitudes({
  maximo: 3,
  ventanaMs: 60 * 60 * 1000,
})
const limitarInicioSesion = crearLimitadorSolicitudes({
  maximo: 10,
  ventanaMs: 15 * 60 * 1000,
})

router.post('/registro', limitarRegistro, registrarClienteController)
router.post(
  '/admin/registro',
  permitirRegistroAdministrador,
  limitarRegistroAdministrador,
  registrarAdministradorController
)
router.post('/sesion', limitarInicioSesion, iniciarSesionClienteController)
router.post(
  '/admin/sesion',
  limitarInicioSesion,
  iniciarSesionAdministradorController
)
router.get('/sesion', requerirAutenticacion(), obtenerSesionController)
router.delete('/sesion', cerrarSesionController)

export default router
