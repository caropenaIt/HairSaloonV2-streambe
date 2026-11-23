import { consultarDisponibilidad } from '../services/agendaService.js'
import { responderError } from './responderError.js'

export async function consultarDisponibilidadController(req, res) {
  const { dia, turnoId } = req.query

  if (typeof dia !== 'string') {
    return res.status(400).json({ mensaje: 'El día debe ser un texto válido.' })
  }

  if (
    turnoId !== undefined &&
    (typeof turnoId !== 'string' ||
      !Number.isSafeInteger(Number(turnoId)) ||
      Number(turnoId) <= 0)
  ) {
    return res.status(400).json({ mensaje: 'El identificador del turno no es válido.' })
  }

  try {
    const disponibilidad = await consultarDisponibilidad(
      req.params.id,
      dia,
      turnoId,
      req.usuario
    )

    if (!disponibilidad) {
      return res.status(404).json({ mensaje: 'Profesional no encontrado.' })
    }

    return res.json(disponibilidad)
  } catch (error) {
    return responderError(res, error, 500)
  }
}
