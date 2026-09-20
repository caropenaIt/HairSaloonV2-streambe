import { Router } from 'express'
import {
  crearProfesionalController,
  eliminarProfesionalController,
  listarProfesionalesController,
  obtenerProfesionalController,
  actualizarProfesionalController,
} from '../controllers/profesionalesController.js'

const router = Router()

router.get('/', listarProfesionalesController)
router.get('/:id', obtenerProfesionalController)
router.post('/', crearProfesionalController)
router.put('/:id', actualizarProfesionalController)
router.delete('/:id', eliminarProfesionalController)

export default router
