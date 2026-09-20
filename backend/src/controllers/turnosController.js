import {
  cancelarTurno,
  crearTurno,
  listarTurnos,
  modificarTurno,
  obtenerTurnosPorCliente,
  obtenerTurnosPorProfesional,
} from '../services/agendaService.js'

export async function listarTurnosController(_req, res) {
  const turnos = await listarTurnos()
  res.json(turnos)
}

export async function listarTurnosPorProfesionalController(req, res) {
  const turnos = await obtenerTurnosPorProfesional(req.params.id)
  res.json(turnos)
}

export async function listarTurnosPorClienteController(req, res) {
  const turnos = await obtenerTurnosPorCliente(req.params.nombre)
  res.json(turnos)
}

export async function crearTurnoController(req, res) {
  try {
    const turno = await crearTurno(req.body)
    return res.status(201).json({ mensaje: 'Turno reservado correctamente.', turno })
  } catch (error) {
    return res.status(400).json({ mensaje: error.message })
  }
}

export async function modificarTurnoController(req, res) {
  try {
    const turno = await modificarTurno(req.params.id, req.body)

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado.' })
    }

    return res.json({ mensaje: 'Turno modificado correctamente.', turno })
  } catch (error) {
    return res.status(400).json({ mensaje: error.message })
  }
}

export async function cancelarTurnoController(req, res) {
  try {
    const turno = await cancelarTurno(req.params.id)

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado.' })
    }

    return res.json({ mensaje: 'Turno cancelado correctamente.', turno })
  } catch (error) {
    return res.status(400).json({ mensaje: error.message })
  }
}
