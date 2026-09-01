import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext'

export function useTurnos() {
  const {
    turnos,
    agregarTurno,
    editarTurno,
    cancelarTurno,
    existeConflictoTurno,
    obtenerProfesionalPorId,
  } = useAppContext()

  function reservarTurno(datosTurno) {
    const conflicto = existeConflictoTurno({
      profesionalId: datosTurno.profesionalId,
      dia: datosTurno.dia,
      hora: datosTurno.hora,
    })

    if (conflicto) {
      return {
        exito: false,
        mensaje: 'Ese horario ya está ocupado. Elegí otro.',
      }
    }

    agregarTurno(datosTurno)
    return { exito: true, mensaje: 'Turno reservado correctamente.' }
  }

  function modificarTurno(turnoId, datosActualizados) {
    const turnoActual = turnos.find((turno) => turno.id === turnoId)

    if (!turnoActual) {
      return { exito: false, mensaje: 'No se encontró el turno.' }
    }

    if (turnoActual.estado === 'cancelado') {
      return {
        exito: false,
        mensaje: 'No se puede modificar un turno cancelado.',
      }
    }

    const profesionalId =
      datosActualizados.profesionalId ?? turnoActual.profesionalId
    const dia = datosActualizados.dia ?? turnoActual.dia
    const hora = datosActualizados.hora ?? turnoActual.hora

    const conflicto = existeConflictoTurno({
      profesionalId,
      dia,
      hora,
      turnoIdExcluido: turnoId,
    })

    if (conflicto) {
      return {
        exito: false,
        mensaje: 'Ese horario ya está ocupado. Elegí otro.',
      }
    }

    editarTurno(turnoId, { dia, hora })
    return { exito: true, mensaje: 'Turno modificado correctamente.' }
  }

  function cancelarTurnoCliente(turnoId) {
    const turnoActual = turnos.find((turno) => turno.id === turnoId)

    if (!turnoActual) {
      return { exito: false, mensaje: 'No se encontró el turno.' }
    }

    if (turnoActual.estado === 'cancelado') {
      return { exito: false, mensaje: 'El turno ya estaba cancelado.' }
    }

    cancelarTurno(turnoId)
    return { exito: true, mensaje: 'Turno cancelado correctamente.' }
  }

  function obtenerTurnosPorCliente(nombreCliente) {
    const nombreNormalizado = nombreCliente.trim().toLowerCase()

    if (!nombreNormalizado) {
      return []
    }

    return turnos.filter((turno) =>
      turno.clienteNombre.toLowerCase().includes(nombreNormalizado)
    )
  }

  function enriquecerTurno(turno) {
    const profesional = obtenerProfesionalPorId(turno.profesionalId)
    return {
      ...turno,
      profesional,
    }
  }

  const turnosEnriquecidos = useMemo(
    () => turnos.map(enriquecerTurno),
    [turnos, obtenerProfesionalPorId]
  )

  return {
    turnos,
    turnosEnriquecidos,
    reservarTurno,
    modificarTurno,
    cancelarTurnoCliente,
    cancelarTurnoAdmin: cancelarTurnoCliente,
    obtenerTurnosPorCliente,
    enriquecerTurno,
  }
}
