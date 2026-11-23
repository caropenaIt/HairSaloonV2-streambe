import { Router } from 'express'
import {
  cancelarTurnoController,
  crearTurnoController,
  listarTurnosController,
  listarMisTurnosController,
  listarTurnosPorProfesionalController,
  modificarTurnoController,
} from '../controllers/turnosController.js'
import { requerirAutenticacion } from '../middleware/autenticacion.js'
import { capturarErroresAsync } from '../middleware/capturarErroresAsync.js'
import { validarIdRuta } from '../middleware/validarIdRuta.js'

const router = Router()

router.get(
  '/',
  requerirAutenticacion('administrador'),
  capturarErroresAsync(listarTurnosController)
)
router.get(
  '/mis',
  requerirAutenticacion('cliente'),
  capturarErroresAsync(listarMisTurnosController)
)
router.get(
  '/profesional/:id',
  validarIdRuta,
  requerirAutenticacion('administrador'),
  capturarErroresAsync(listarTurnosPorProfesionalController)
)
router.post(
  '/',
  requerirAutenticacion('cliente'),
  capturarErroresAsync(crearTurnoController)
)
router.put(
  '/:id',
  validarIdRuta,
  requerirAutenticacion('administrador', 'cliente'),
  capturarErroresAsync(modificarTurnoController)
)
router.patch(
  '/:id/cancelar',
  validarIdRuta,
  requerirAutenticacion('administrador', 'cliente'),
  capturarErroresAsync(cancelarTurnoController)
)

export default router
