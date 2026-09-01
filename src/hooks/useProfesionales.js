import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { FILTRO_TODAS } from '../utils/constantes'
import { obtenerNombreCompleto } from '../utils/validaciones'

export function useProfesionales() {
  const {
    profesionales,
    turnos,
    agregarProfesional,
    editarProfesional,
    borrarProfesional,
    obtenerProfesionalPorId,
  } = useAppContext()

  const [filtroEspecialidad, setFiltroEspecialidad] = useState(FILTRO_TODAS)
  const [busquedaNombre, setBusquedaNombre] = useState('')

  const profesionalesFiltrados = useMemo(() => {
    return profesionales.filter((profesional) => {
      const coincideEspecialidad =
        filtroEspecialidad === FILTRO_TODAS ||
        profesional.especialidad === filtroEspecialidad

      const nombreCompleto = obtenerNombreCompleto(profesional).toLowerCase()
      const coincideNombre = nombreCompleto.includes(
        busquedaNombre.trim().toLowerCase()
      )

      return coincideEspecialidad && coincideNombre
    })
  }, [profesionales, filtroEspecialidad, busquedaNombre])

  function tieneTurnosActivos(profesionalId) {
    return turnos.some(
      (turno) =>
        turno.profesionalId === profesionalId && turno.estado === 'confirmado'
    )
  }

  function eliminarProfesional(profesionalId) {
    if (tieneTurnosActivos(profesionalId)) {
      return {
        exito: false,
        mensaje:
          'No se puede eliminar: el profesional tiene turnos confirmados activos.',
      }
    }

    borrarProfesional(profesionalId)
    return { exito: true, mensaje: 'Profesional eliminado correctamente.' }
  }

  return {
    profesionales,
    profesionalesFiltrados,
    filtroEspecialidad,
    setFiltroEspecialidad,
    busquedaNombre,
    setBusquedaNombre,
    agregarProfesional,
    editarProfesional,
    eliminarProfesional,
    obtenerProfesionalPorId,
    tieneTurnosActivos,
  }
}
