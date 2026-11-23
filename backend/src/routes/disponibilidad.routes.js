import { Router } from 'express'
import { consultarDisponibilidadController } from '../controllers/disponibilidadController.js'
import { requerirAutenticacion } from '../middleware/autenticacion.js'
import { capturarErroresAsync } from '../middleware/capturarErroresAsync.js'
import { validarIdRuta } from '../middleware/validarIdRuta.js'

const router = Router()

router.get(
  '/profesional/:id',
  validarIdRuta,
  requerirAutenticacion('administrador', 'cliente'),
  capturarErroresAsync(consultarDisponibilidadController)
)

export default router
