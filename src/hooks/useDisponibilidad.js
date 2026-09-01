import { useMemo } from 'react'
import { useAppContext } from '../context/AppContext'

export function useDisponibilidad(
  profesionalId,
  diaSeleccionado,
  turnoIdExcluido = null
) {
  const { obtenerProfesionalPorId, turnos } = useAppContext()

  const profesional = profesionalId
    ? obtenerProfesionalPorId(profesionalId)
    : null

  const horariosOcupados = useMemo(() => {
    if (!profesionalId || !diaSeleccionado) {
      return []
    }

    return turnos
      .filter(
        (turno) =>
          turno.profesionalId === profesionalId &&
          turno.dia === diaSeleccionado &&
          turno.estado === 'confirmado' &&
          turno.id !== turnoIdExcluido
      )
      .map((turno) => turno.hora)
  }, [turnos, profesionalId, diaSeleccionado, turnoIdExcluido])

  const horariosDisponibles = useMemo(() => {
    if (!profesional || !diaSeleccionado) {
      return []
    }

    if (!profesional.diasDisponibles.includes(diaSeleccionado)) {
      return []
    }

    return profesional.horariosDisponibles.filter(
      (horario) => !horariosOcupados.includes(horario)
    )
  }, [profesional, diaSeleccionado, horariosOcupados])

  const diasDisponibles = profesional?.diasDisponibles ?? []

  return {
    profesional,
    diasDisponibles,
    horariosDisponibles,
    horariosOcupados,
  }
}
