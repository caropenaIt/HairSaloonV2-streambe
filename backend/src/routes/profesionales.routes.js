import { Router } from 'express'
import {
  crearProfesionalController,
  eliminarProfesionalController,
  listarProfesionalesController,
  obtenerProfesionalController,
  actualizarProfesionalController,
} from '../controllers/profesionalesController.js'
import { requerirAutenticacion } from '../middleware/autenticacion.js'
import { capturarErroresAsync } from '../middleware/capturarErroresAsync.js'
import { validarIdRuta } from '../middleware/validarIdRuta.js'

const router = Router()

router.get('/', capturarErroresAsync(listarProfesionalesController))
router.get(
  '/:id',
  validarIdRuta,
  capturarErroresAsync(obtenerProfesionalController)
)
router.post(
  '/',
  requerirAutenticacion('administrador'),
  capturarErroresAsync(crearProfesionalController)
)
router.put(
  '/:id',
  validarIdRuta,
  requerirAutenticacion('administrador'),
  capturarErroresAsync(actualizarProfesionalController)
)
router.delete(
  '/:id',
  validarIdRuta,
  requerirAutenticacion('administrador'),
  capturarErroresAsync(eliminarProfesionalController)
)

export default router
