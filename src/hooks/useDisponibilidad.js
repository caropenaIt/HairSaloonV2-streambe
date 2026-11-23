import { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { obtenerDisponibilidadApi } from '../services/dataService'

export function useDisponibilidad(
  profesionalId,
  diaSeleccionado,
  turnoIdExcluido = null
) {
  const { obtenerProfesionalPorId } = useAppContext()
  const [horariosDisponibles, setHorariosDisponibles] = useState([])
  const [cargando, setCargando] = useState(false)
  const [errorDisponibilidad, setErrorDisponibilidad] = useState('')

  const profesional = profesionalId
    ? obtenerProfesionalPorId(profesionalId)
    : null
  const diasDisponibles = profesional?.diasDisponibles ?? []

  useEffect(() => {
    let cancelado = false

    if (!profesional || !diaSeleccionado) {
      setHorariosDisponibles([])
      setErrorDisponibilidad('')
      setCargando(false)
      return () => {
        cancelado = true
      }
    }

    setCargando(true)
    setErrorDisponibilidad('')
    obtenerDisponibilidadApi(
      profesionalId,
      diaSeleccionado,
      turnoIdExcluido
    )
      .then((respuesta) => {
        if (!cancelado) {
          setHorariosDisponibles(respuesta.horariosDisponibles)
        }
      })
      .catch((error) => {
        console.error('No se pudo consultar la disponibilidad.', error)
        if (!cancelado) {
          setHorariosDisponibles([])
          setErrorDisponibilidad('No se pudo consultar la disponibilidad. Volvé a intentarlo.')
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargando(false)
        }
      })

    return () => {
      cancelado = true
    }
  }, [profesional, profesionalId, diaSeleccionado, turnoIdExcluido])

  return {
    profesional,
    diasDisponibles,
    horariosDisponibles,
    cargando,
    errorDisponibilidad,
  }
}
