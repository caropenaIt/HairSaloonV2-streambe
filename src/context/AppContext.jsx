import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react'
import {
  actualizarProfesional,
  actualizarProfesionalApi,
  actualizarTurno,
  actualizarTurnoApi,
  cancelarTurno,
  cancelarTurnoApi,
  cargarDatosDesdeApi,
  crearEstadoInicial,
  crearProfesional,
  crearProfesionalApi,
  crearTurno,
  crearTurnoApi,
  eliminarProfesional,
  eliminarProfesionalApi,
  existeConflictoTurno,
  obtenerProfesionalPorId,
  obtenerProfesionales,
  obtenerTurnos,
  obtenerTurnosActivosPorProfesional,
  persistirDatos,
} from '../services/dataService'

const AppContext = createContext(null)

const ACCIONES = {
  CARGAR_DATOS: 'CARGAR_DATOS',
  AGREGAR_PROFESIONAL: 'AGREGAR_PROFESIONAL',
  EDITAR_PROFESIONAL: 'EDITAR_PROFESIONAL',
  BORRAR_PROFESIONAL: 'BORRAR_PROFESIONAL',
  AGREGAR_TURNO: 'AGREGAR_TURNO',
  EDITAR_TURNO: 'EDITAR_TURNO',
  CANCELAR_TURNO: 'CANCELAR_TURNO',
}

function reducer(estado, accion) {
  switch (accion.type) {
    case ACCIONES.CARGAR_DATOS:
      return accion.payload
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
  const esPrimerRender = useRef(true)

  useEffect(() => {
    let cancelado = false

    async function cargarInicial() {
      const datos = await cargarDatosDesdeApi()
      if (!cancelado) {
        dispatch({ type: ACCIONES.CARGAR_DATOS, payload: datos })
      }
    }

    cargarInicial()
    return () => {
      cancelado = true
    }
  }, [])

  useEffect(() => {
    if (esPrimerRender.current) {
      esPrimerRender.current = false
      return
    }

    persistirDatos(estado)
  }, [estado])

  const acciones = useMemo(
    () => ({
      agregarProfesional: async (datos) => {
        try {
          const respuesta = await crearProfesionalApi(datos)
          dispatch({
            type: ACCIONES.AGREGAR_PROFESIONAL,
            payload: respuesta.profesional ?? datos,
          })
          return { exito: true, mensaje: respuesta.mensaje || 'Profesional creado correctamente.' }
        } catch (error) {
          dispatch({ type: ACCIONES.AGREGAR_PROFESIONAL, payload: datos })
          return { exito: false, mensaje: error.message }
        }
      },
      editarProfesional: async (id, datos) => {
        try {
          const respuesta = await actualizarProfesionalApi(id, datos)
          dispatch({
            type: ACCIONES.EDITAR_PROFESIONAL,
            payload: { id, datos: respuesta.profesional ?? datos },
          })
          return { exito: true, mensaje: respuesta.mensaje || 'Profesional actualizado correctamente.' }
        } catch (error) {
          dispatch({
            type: ACCIONES.EDITAR_PROFESIONAL,
            payload: { id, datos },
          })
          return { exito: false, mensaje: error.message }
        }
      },
      borrarProfesional: async (id) => {
        try {
          const respuesta = await eliminarProfesionalApi(id)
          dispatch({ type: ACCIONES.BORRAR_PROFESIONAL, payload: id })
          return { exito: true, mensaje: respuesta.mensaje || 'Profesional eliminado correctamente.' }
        } catch (error) {
          return { exito: false, mensaje: error.message }
        }
      },
      agregarTurno: async (datos) => {
        try {
          const respuesta = await crearTurnoApi(datos)
          dispatch({
            type: ACCIONES.AGREGAR_TURNO,
            payload: respuesta.turno ?? { ...datos, estado: 'confirmado' },
          })
          return { exito: true, mensaje: respuesta.mensaje || 'Turno reservado correctamente.' }
        } catch (error) {
          return { exito: false, mensaje: error.message }
        }
      },
      editarTurno: async (id, datos) => {
        try {
          const respuesta = await actualizarTurnoApi(id, datos)
          dispatch({
            type: ACCIONES.EDITAR_TURNO,
            payload: { id, datos: respuesta.turno ?? datos },
          })
          return { exito: true, mensaje: respuesta.mensaje || 'Turno modificado correctamente.' }
        } catch (error) {
          return { exito: false, mensaje: error.message }
        }
      },
      cancelarTurno: async (id) => {
        try {
          const respuesta = await cancelarTurnoApi(id)
          dispatch({ type: ACCIONES.CANCELAR_TURNO, payload: id })
          return { exito: true, mensaje: respuesta.mensaje || 'Turno cancelado correctamente.' }
        } catch (error) {
          return { exito: false, mensaje: error.message }
        }
      },
    }),
    [estado]
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
