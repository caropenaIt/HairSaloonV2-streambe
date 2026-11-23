import {
  crearProfesional,
  actualizarProfesional,
  eliminarProfesional,
  listarProfesionales,
  obtenerProfesionalPorId,
} from '../services/agendaService.js'
import { responderError } from './responderError.js'

export async function listarProfesionalesController(_req, res) {
  const profesionales = await listarProfesionales()
  res.json(profesionales)
}

export async function obtenerProfesionalController(req, res) {
  const profesional = await obtenerProfesionalPorId(req.params.id)

  if (!profesional) {
    return res.status(404).json({ mensaje: 'Profesional no encontrado.' })
  }

  return res.json(profesional)
}

export async function crearProfesionalController(req, res) {
  try {
    const profesional = await crearProfesional(req.body)
    return res.status(201).json({ mensaje: 'Profesional creado correctamente.', profesional })
  } catch (error) {
    return responderError(res, error)
  }
}

export async function actualizarProfesionalController(req, res) {
  try {
    const profesional = await actualizarProfesional(req.params.id, req.body)

    if (!profesional) {
      return res.status(404).json({ mensaje: 'Profesional no encontrado.' })
    }

    return res.json({ mensaje: 'Profesional actualizado correctamente.', profesional })
  } catch (error) {
    return responderError(res, error)
  }
}

export async function eliminarProfesionalController(req, res) {
  try {
    await eliminarProfesional(req.params.id)
    return res.json({ mensaje: 'Profesional eliminado correctamente.' })
  } catch (error) {
    return responderError(res, error)
  }
}
