import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import {
  actualizarProfesionalApi,
  actualizarTurnoApi,
  cancelarTurnoApi,
  cerrarSesionApi,
  crearEstadoInicial,
  crearProfesionalApi,
  crearTurnoApi,
  eliminarProfesionalApi,
  iniciarSesionAdministradorApi,
  iniciarSesionClienteApi,
  obtenerMisTurnosApi,
  obtenerProfesionales,
  obtenerProfesionalesApi,
  obtenerSesionApi,
  obtenerTurnos,
  obtenerTurnosApi,
  registrarAdministradorApi,
  registrarClienteApi,
} from '../services/dataService'

const AppContext = createContext(null)

const ACCIONES = {
  CARGAR_DATOS: 'CARGAR_DATOS',
  CARGAR_TURNOS: 'CARGAR_TURNOS',
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
    case ACCIONES.CARGAR_TURNOS:
      return { ...estado, turnos: accion.payload }
    case ACCIONES.AGREGAR_PROFESIONAL:
      return {
        ...estado,
        profesionales: [...estado.profesionales, accion.payload],
      }
    case ACCIONES.EDITAR_PROFESIONAL:
      return {
        ...estado,
        profesionales: estado.profesionales.map((profesional) =>
          profesional.id === accion.payload.id
            ? { ...profesional, ...accion.payload.datos }
            : profesional
        ),
      }
    case ACCIONES.BORRAR_PROFESIONAL:
      return {
        ...estado,
        profesionales: estado.profesionales.filter(
          (profesional) => profesional.id !== accion.payload
        ),
      }
    case ACCIONES.AGREGAR_TURNO:
      return { ...estado, turnos: [...estado.turnos, accion.payload] }
    case ACCIONES.EDITAR_TURNO:
      return {
        ...estado,
        turnos: estado.turnos.map((turno) =>
          turno.id === accion.payload.id
            ? { ...turno, ...accion.payload.datos }
            : turno
        ),
      }
    case ACCIONES.CANCELAR_TURNO:
      return {
        ...estado,
        turnos: estado.turnos.map((turno) =>
          turno.id === accion.payload
            ? { ...turno, estado: 'cancelado' }
            : turno
        ),
      }
    default:
      return estado
  }
}

function crearEstadoSinTurnosLocales() {
  return { ...crearEstadoInicial(), turnos: [] }
}

function obtenerMensajeError(error, mensajeAlternativo) {
  return error instanceof Error ? error.message : mensajeAlternativo
}

async function obtenerTurnosDeUsuario(usuario) {
  return usuario.rol === 'administrador'
    ? obtenerTurnosApi()
    : obtenerMisTurnosApi()
}

async function iniciarSesionConRol(
  iniciarSesionApi,
  datosAcceso,
  rolEsperado,
  setUsuario,
  dispatch
) {
  let respuesta
  try {
    respuesta = await iniciarSesionApi(datosAcceso)
  } catch (error) {
    return {
      exito: false,
      mensaje: obtenerMensajeError(error, 'No se pudo iniciar sesión.'),
    }
  }

  if (respuesta?.usuario?.rol !== rolEsperado) {
    try {
      await cerrarSesionApi()
    } catch (errorCierre) {
      console.error(
        'No se pudo cerrar la sesión con un rol inesperado.',
        errorCierre
      )
    }
    return {
      exito: false,
      mensaje: 'El tipo de cuenta no coincide con este acceso.',
    }
  }

  try {
    const turnos = await obtenerTurnosDeUsuario(respuesta.usuario)
    setUsuario(respuesta.usuario)
    dispatch({ type: ACCIONES.CARGAR_TURNOS, payload: turnos })
    return { exito: true, usuario: respuesta.usuario }
  } catch (error) {
    try {
      await cerrarSesionApi()
    } catch (errorCierre) {
      console.error('No se pudo cerrar la sesión incompleta.', errorCierre)
    }
    return {
      exito: false,
      mensaje: obtenerMensajeError(error, 'No se pudo iniciar sesión.'),
    }
  }
}

export function AppProvider({ children }) {
  const [estado, dispatch] = useReducer(
    reducer,
    null,
    crearEstadoSinTurnosLocales
  )
  const [usuario, setUsuario] = useState(null)
  const [sesionCargada, setSesionCargada] = useState(false)

  useEffect(() => {
    let cancelado = false

    async function cargarDatosIniciales() {
      let usuarioActual = null
      let profesionales = estado.profesionales
      let turnos = []

      try {
        usuarioActual = await obtenerSesionApi()
      } catch (error) {
        if (error.status !== 401) {
          console.error('No se pudo consultar la sesión.', error)
        }
      }

      try {
        profesionales = await obtenerProfesionalesApi()
      } catch (error) {
        console.error('No se pudieron cargar los profesionales.', error)
      }

      if (usuarioActual) {
        try {
          turnos = await obtenerTurnosDeUsuario(usuarioActual)
        } catch (error) {
          console.error('No se pudieron cargar los turnos de la sesión.', error)
          if (error.status === 401) {
            usuarioActual = null
          }
        }
      }

      if (!cancelado) {
        setUsuario(usuarioActual)
        dispatch({
          type: ACCIONES.CARGAR_DATOS,
          payload: { ...estado, profesionales, turnos },
        })
        setSesionCargada(true)
      }
    }

    cargarDatosIniciales()
    return () => {
      cancelado = true
    }
  }, [])

  const acciones = useMemo(
    () => ({
      iniciarSesion: (datosAcceso) =>
        iniciarSesionConRol(
          iniciarSesionClienteApi,
          datosAcceso,
          'cliente',
          setUsuario,
          dispatch
        ),
      iniciarSesionAdministrador: (datosAcceso) =>
        iniciarSesionConRol(
          iniciarSesionAdministradorApi,
          datosAcceso,
          'administrador',
          setUsuario,
          dispatch
        ),
      registrarCliente: async (datosCliente) => {
        try {
          const respuesta = await registrarClienteApi(datosCliente)
          setUsuario(respuesta.usuario)
          dispatch({ type: ACCIONES.CARGAR_TURNOS, payload: [] })
          return { exito: true, usuario: respuesta.usuario }
        } catch (error) {
          return {
            exito: false,
            mensaje: obtenerMensajeError(error, 'No se pudo crear la cuenta.'),
          }
        }
      },
      registrarAdministrador: async (datosAdministrador) => {
        try {
          const respuesta = await registrarAdministradorApi(datosAdministrador)
          return await iniciarSesionConRol(
            async () => respuesta,
            null,
            'administrador',
            setUsuario,
            dispatch
          )
        } catch (error) {
          return {
            exito: false,
            mensaje: obtenerMensajeError(
              error,
              'No se pudo crear la cuenta de administrador.'
            ),
          }
        }
      },
      cerrarSesion: async () => {
        try {
          await cerrarSesionApi()
          setUsuario(null)
          dispatch({ type: ACCIONES.CARGAR_TURNOS, payload: [] })
          return { exito: true }
        } catch (error) {
          return {
            exito: false,
            mensaje: obtenerMensajeError(error, 'No se pudo cerrar la sesión.'),
          }
        }
      },
      agregarProfesional: async (datos) => {
        try {
          const respuesta = await crearProfesionalApi(datos)
          dispatch({
            type: ACCIONES.AGREGAR_PROFESIONAL,
            payload: respuesta.profesional,
          })
          return {
            exito: true,
            mensaje: respuesta.mensaje || 'Profesional creado correctamente.',
          }
        } catch (error) {
          return {
            exito: false,
            mensaje: obtenerMensajeError(error, 'No se pudo crear el profesional.'),
          }
        }
      },
      editarProfesional: async (id, datos) => {
        try {
          const respuesta = await actualizarProfesionalApi(id, datos)
          dispatch({
            type: ACCIONES.EDITAR_PROFESIONAL,
            payload: { id, datos: respuesta.profesional || datos },
          })
          return {
            exito: true,
            mensaje: respuesta.mensaje || 'Profesional actualizado correctamente.',
          }
        } catch (error) {
          return {
            exito: false,
            mensaje: obtenerMensajeError(error, 'No se pudo actualizar el profesional.'),
          }
        }
      },
      borrarProfesional: async (id) => {
        try {
          const respuesta = await eliminarProfesionalApi(id)
          dispatch({ type: ACCIONES.BORRAR_PROFESIONAL, payload: id })
          return {
            exito: true,
            mensaje: respuesta.mensaje || 'Profesional eliminado correctamente.',
          }
        } catch (error) {
          return {
            exito: false,
            mensaje: obtenerMensajeError(error, 'No se pudo eliminar el profesional.'),
          }
        }
      },
      agregarTurno: async (datos) => {
        try {
          const respuesta = await crearTurnoApi(datos)
          dispatch({
            type: ACCIONES.AGREGAR_TURNO,
            payload: respuesta.turno,
          })
          return {
            exito: true,
            mensaje: respuesta.mensaje || 'Turno reservado correctamente.',
          }
        } catch (error) {
          return {
            exito: false,
            mensaje: obtenerMensajeError(error, 'No se pudo reservar el turno.'),
          }
        }
      },
      editarTurno: async (id, datos) => {
        try {
          const respuesta = await actualizarTurnoApi(id, datos)
          dispatch({
            type: ACCIONES.EDITAR_TURNO,
            payload: { id, datos: respuesta.turno || datos },
          })
          return {
            exito: true,
            mensaje: respuesta.mensaje || 'Turno modificado correctamente.',
          }
        } catch (error) {
          return {
            exito: false,
            mensaje: obtenerMensajeError(error, 'No se pudo modificar el turno.'),
          }
        }
      },
      cancelarTurno: async (id) => {
        try {
          const respuesta = await cancelarTurnoApi(id)
          dispatch({ type: ACCIONES.CANCELAR_TURNO, payload: id })
          return {
            exito: true,
            mensaje: respuesta.mensaje || 'Turno cancelado correctamente.',
          }
        } catch (error) {
          return {
            exito: false,
            mensaje: obtenerMensajeError(error, 'No se pudo cancelar el turno.'),
          }
        }
      },
    }),
    []
  )

  const valor = useMemo(
    () => ({
      estado,
      usuario,
      sesionCargada,
      profesionales: obtenerProfesionales(estado),
      turnos: obtenerTurnos(estado),
      obtenerProfesionalPorId: (id) =>
        estado.profesionales.find((profesional) => profesional.id === id),
      existeConflictoTurno: ({
        profesionalId,
        dia,
        hora,
        turnoIdExcluido = null,
      }) =>
        estado.turnos.some(
          (turno) =>
            turno.profesionalId === profesionalId &&
            turno.dia === dia &&
            turno.hora === hora &&
            turno.estado === 'confirmado' &&
            turno.id !== turnoIdExcluido
        ),
      ...acciones,
    }),
    [estado, usuario, sesionCargada, acciones]
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
