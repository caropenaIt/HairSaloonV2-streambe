import {
  cancelarTurno,
  cancelarTurnoDeCliente,
  crearTurno,
  listarTurnos,
  modificarTurno,
  modificarTurnoDeCliente,
  obtenerTurnosDeCliente,
  obtenerTurnosPorProfesional,
} from '../services/agendaService.js'
import { responderError } from './responderError.js'

export async function listarTurnosController(_req, res) {
  const turnos = await listarTurnos()
  res.json(turnos)
}

export async function listarTurnosPorProfesionalController(req, res) {
  const turnos = await obtenerTurnosPorProfesional(req.params.id)
  res.json(turnos)
}

export async function listarMisTurnosController(req, res) {
  const turnos = await obtenerTurnosDeCliente(req.usuario.id)
  res.json(turnos)
}

export async function crearTurnoController(req, res) {
  try {
    const turno = await crearTurno(
      { ...req.body, clienteNombre: req.usuario.nombre },
      req.usuario.id
    )
    return res.status(201).json({ mensaje: 'Turno reservado correctamente.', turno })
  } catch (error) {
    return responderError(res, error)
  }
}

export async function modificarTurnoController(req, res) {
  try {
    const turno =
      req.usuario.rol === 'administrador'
        ? await modificarTurno(req.params.id, req.body)
        : await modificarTurnoDeCliente(
            req.params.id,
            req.usuario.id,
            req.body
          )

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado.' })
    }

    return res.json({ mensaje: 'Turno modificado correctamente.', turno })
  } catch (error) {
    return responderError(res, error)
  }
}

export async function cancelarTurnoController(req, res) {
  try {
    const turno =
      req.usuario.rol === 'administrador'
        ? await cancelarTurno(req.params.id)
        : await cancelarTurnoDeCliente(req.params.id, req.usuario.id)

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado.' })
    }

    return res.json({ mensaje: 'Turno cancelado correctamente.', turno })
  } catch (error) {
    return responderError(res, error)
  }
}
