import { Router } from 'express'
import {
  cancelarTurnoController,
  crearTurnoController,
  listarTurnosController,
  listarTurnosPorClienteController,
  listarTurnosPorProfesionalController,
  modificarTurnoController,
} from '../controllers/turnosController.js'

const router = Router()

router.get('/', listarTurnosController)
router.get('/profesional/:id', listarTurnosPorProfesionalController)
router.get('/cliente/:nombre', listarTurnosPorClienteController)
router.post('/', crearTurnoController)
router.put('/:id', modificarTurnoController)
router.patch('/:id/cancelar', cancelarTurnoController)

export default router
