import { createContext, useContext, useMemo, useReducer } from 'react'
import {
  actualizarProfesional,
  actualizarTurno,
  cancelarTurno,
  crearEstadoInicial,
  crearProfesional,
  crearTurno,
  eliminarProfesional,
  existeConflictoTurno,
  obtenerProfesionalPorId,
  obtenerProfesionales,
  obtenerTurnos,
  obtenerTurnosActivosPorProfesional,
} from '../services/dataService'

const AppContext = createContext(null)

const ACCIONES = {
  AGREGAR_PROFESIONAL: 'AGREGAR_PROFESIONAL',
  EDITAR_PROFESIONAL: 'EDITAR_PROFESIONAL',
  BORRAR_PROFESIONAL: 'BORRAR_PROFESIONAL',
  AGREGAR_TURNO: 'AGREGAR_TURNO',
  EDITAR_TURNO: 'EDITAR_TURNO',
  CANCELAR_TURNO: 'CANCELAR_TURNO',
}

function reducer(estado, accion) {
  switch (accion.type) {
    case ACCIONES.AGREGAR_PROFESIONAL:
      return crearProfesional(estado, accion.payload)
    case ACCIONES.EDITAR_PROFESIONAL:
      return actualizarProfesional(
        estado,
        accion.payload.id,
        accion.payload.datos
      )
    case ACCIONES.BORRAR_PROFESIONAL:
      return eliminarProfesional(estado, accion.payload)
    case ACCIONES.AGREGAR_TURNO:
      return crearTurno(estado, accion.payload)
    case ACCIONES.EDITAR_TURNO:
      return actualizarTurno(estado, accion.payload.id, accion.payload.datos)
    case ACCIONES.CANCELAR_TURNO:
      return cancelarTurno(estado, accion.payload)
    default:
      return estado
  }
}

export function AppProvider({ children }) {
  const [estado, dispatch] = useReducer(reducer, null, crearEstadoInicial)

  const acciones = useMemo(
    () => ({
      agregarProfesional: (datos) =>
        dispatch({ type: ACCIONES.AGREGAR_PROFESIONAL, payload: datos }),
      editarProfesional: (id, datos) =>
        dispatch({
          type: ACCIONES.EDITAR_PROFESIONAL,
          payload: { id, datos },
        }),
      borrarProfesional: (id) =>
        dispatch({ type: ACCIONES.BORRAR_PROFESIONAL, payload: id }),
      agregarTurno: (datos) =>
        dispatch({ type: ACCIONES.AGREGAR_TURNO, payload: datos }),
      editarTurno: (id, datos) =>
        dispatch({ type: ACCIONES.EDITAR_TURNO, payload: { id, datos } }),
      cancelarTurno: (id) =>
        dispatch({ type: ACCIONES.CANCELAR_TURNO, payload: id }),
    }),
    []
  )

  const valor = useMemo(
    () => ({
      estado,
      profesionales: obtenerProfesionales(estado),
      turnos: obtenerTurnos(estado),
      obtenerProfesionalPorId: (id) => obtenerProfesionalPorId(estado, id),
      obtenerTurnosActivosPorProfesional: (profesionalId) =>
        obtenerTurnosActivosPorProfesional(estado, profesionalId),
      existeConflictoTurno: (datos) => existeConflictoTurno(estado, datos),
      ...acciones,
    }),
    [estado, acciones]
  )

  return <AppContext.Provider value={valor}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const contexto = useContext(AppContext)

  if (!contexto) {
    throw new Error('useAppContext debe usarse dentro de AppProvider')
  }

  return contexto
}
