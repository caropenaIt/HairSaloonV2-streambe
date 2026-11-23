import datosIniciales from '../data/db.json'
import { generarIdProfesional, generarIdTurno } from '../utils/generarId'
import { validarTurno } from '../utils/validaciones'

export const CLAVE_PERSISTENCIA = 'unisexHairSaloonDatos'
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

function clonarDatosIniciales() {
  return JSON.parse(JSON.stringify(datosIniciales))
}

function leerDatosPersistidos() {
  try {
    const datosGuardados = localStorage.getItem(CLAVE_PERSISTENCIA)
    return datosGuardados ? JSON.parse(datosGuardados) : null
  } catch {
    return null
  }
}

export function persistirDatos(estado) {
  try {
    localStorage.setItem(CLAVE_PERSISTENCIA, JSON.stringify(estado))
  } catch {
    // Si localStorage no está disponible, la app sigue funcionando en memoria.
  }
}

export function crearEstadoInicial() {
  return leerDatosPersistidos() ?? clonarDatosIniciales()
}

async function requestJson(path, opciones = {}) {
  const { headers, ...otrasOpciones } = opciones
  const respuesta = await fetch(`${API_BASE_URL}${path}`, {
    ...otrasOpciones,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
  })

  const contenido = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    const error = new Error(contenido.mensaje || 'Error en la solicitud')
    error.status = respuesta.status
    throw error
  }

  return contenido
}

export async function obtenerProfesionalesApi() {
  return requestJson('/profesionales')
}

export async function obtenerTurnosApi() {
  return requestJson('/turnos')
}

export async function obtenerMisTurnosApi() {
  return requestJson('/turnos/mis')
}

export async function obtenerDisponibilidadApi(
  profesionalId,
  dia,
  turnoIdExcluido = null
) {
  const parametros = new URLSearchParams({ dia })
  if (turnoIdExcluido !== null) {
    parametros.set('turnoId', String(turnoIdExcluido))
  }
  return requestJson(
    `/disponibilidad/profesional/${profesionalId}?${parametros.toString()}`
  )
}

export async function obtenerSesionApi() {
  const respuesta = await requestJson('/auth/sesion')
  return respuesta.usuario
}

export async function registrarClienteApi(datosCliente) {
  return requestJson('/auth/registro', {
    method: 'POST',
    body: JSON.stringify(datosCliente),
  })
}

export async function registrarAdministradorApi(datosAdministrador) {
  return requestJson('/auth/admin/registro', {
    method: 'POST',
    body: JSON.stringify(datosAdministrador),
  })
}

export async function iniciarSesionClienteApi(datosAcceso) {
  return requestJson('/auth/sesion', {
    method: 'POST',
    body: JSON.stringify(datosAcceso),
  })
}

export async function iniciarSesionAdministradorApi(datosAcceso) {
  return requestJson('/auth/admin/sesion', {
    method: 'POST',
    body: JSON.stringify(datosAcceso),
  })
}

export async function cerrarSesionApi() {
  return requestJson('/auth/sesion', { method: 'DELETE' })
}

export async function crearProfesionalApi(datosProfesional) {
  return requestJson('/profesionales', {
    method: 'POST',
    body: JSON.stringify(datosProfesional),
  })
}

export async function actualizarProfesionalApi(id, datosProfesional) {
  return requestJson(`/profesionales/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datosProfesional),
  })
}

export async function eliminarProfesionalApi(id) {
  return requestJson(`/profesionales/${id}`, { method: 'DELETE' })
}

export async function crearTurnoApi(datosTurno) {
  return requestJson('/turnos', {
    method: 'POST',
    body: JSON.stringify(datosTurno),
  })
}

export async function actualizarTurnoApi(id, datosTurno) {
  return requestJson(`/turnos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(datosTurno),
  })
}

export async function cancelarTurnoApi(id) {
  return requestJson(`/turnos/${id}/cancelar`, { method: 'PATCH' })
}

export function obtenerProfesionales(estado) {
  return estado.profesionales
}

export function obtenerTurnos(estado) {
  return estado.turnos
}

export function obtenerProfesionalPorId(estado, id) {
  return estado.profesionales.find((profesional) => profesional.id === id)
}

export function crearProfesional(estado, datosProfesional) {
  const { id, configuracion } = generarIdProfesional(estado.configuracion)

  return {
    ...estado,
    configuracion,
    profesionales: [
      ...estado.profesionales,
      {
        ...datosProfesional,
        id,
      },
    ],
  }
}

export function actualizarProfesional(estado, id, datosProfesional) {
  return {
    ...estado,
    profesionales: estado.profesionales.map((profesional) =>
      profesional.id === id ? { ...profesional, ...datosProfesional, id } : profesional
    ),
  }
}

export function eliminarProfesional(estado, id) {
  return {
    ...estado,
    profesionales: estado.profesionales.filter(
      (profesional) => profesional.id !== id
    ),
  }
}

export function crearTurno(estado, datosTurno) {
  const { id, configuracion } = generarIdTurno(estado.configuracion)

  return {
    ...estado,
    configuracion,
    turnos: [
      ...estado.turnos,
      {
        ...datosTurno,
        id,
        estado: datosTurno.estado || 'confirmado',
      },
    ],
  }
}

export function actualizarTurno(estado, id, datosTurno) {
  return {
    ...estado,
    turnos: estado.turnos.map((turno) =>
      turno.id === id ? { ...turno, ...datosTurno, id } : turno
    ),
  }
}

export function cancelarTurno(estado, id) {
  return actualizarTurno(estado, id, { estado: 'cancelado' })
}

export function obtenerTurnosActivosPorProfesional(estado, profesionalId) {
  return estado.turnos.filter(
    (turno) =>
      turno.profesionalId === profesionalId && turno.estado === 'confirmado'
  )
}

export function existeConflictoTurno(
  estado,
  { profesionalId, dia, hora, turnoIdExcluido = null }
) {
  return estado.turnos.some(
    (turno) =>
      turno.profesionalId === profesionalId &&
      turno.dia === dia &&
      turno.hora === hora &&
      turno.estado === 'confirmado' &&
      turno.id !== turnoIdExcluido
  )
}

export function reservarTurno(estado, datosTurno) {
  const erroresCampos = validarTurno(datosTurno)

  if (Object.keys(erroresCampos).length > 0) {
    return {
      exito: false,
      mensaje: Object.values(erroresCampos)[0],
      errores: erroresCampos,
    }
  }

  const profesional = obtenerProfesionalPorId(estado, datosTurno.profesionalId)

  if (!profesional) {
    return {
      exito: false,
      mensaje: 'El profesional seleccionado no existe.',
      errores: { general: 'El profesional seleccionado no existe.' },
    }
  }

  if (!profesional.diasDisponibles.includes(datosTurno.dia)) {
    return {
      exito: false,
      mensaje: 'El profesional no atiende ese día.',
      errores: { general: 'El profesional no atiende ese día.' },
    }
  }

  if (!profesional.horariosDisponibles.includes(datosTurno.hora)) {
    return {
      exito: false,
      mensaje: 'Ese horario no está disponible para el profesional.',
      errores: { general: 'Ese horario no está disponible para el profesional.' },
    }
  }

  const hayConflicto = existeConflictoTurno(estado, {
    profesionalId: datosTurno.profesionalId,
    dia: datosTurno.dia,
    hora: datosTurno.hora,
  })

  if (hayConflicto) {
    return {
      exito: false,
      mensaje: 'Ese horario ya está ocupado. Elegí otro.',
      errores: { general: 'Ese horario ya está ocupado. Elegí otro.' },
    }
  }

  return {
    exito: true,
    mensaje: 'Turno reservado correctamente.',
    errores: {},
    datosTurno,
  }
}
