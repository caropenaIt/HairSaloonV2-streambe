import datosIniciales from '../data/db.json'
import { generarIdProfesional, generarIdTurno } from '../utils/generarId'
import { validarTurno } from '../utils/validaciones'

export const CLAVE_PERSISTENCIA = 'unisexHairSaloonDatos'
const API_BASE_URL = 'http://localhost:3001/api'

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
  const respuesta = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(opciones.headers || {}),
    },
    ...opciones,
  })

  const contenido = await respuesta.json().catch(() => ({}))

  if (!respuesta.ok) {
    throw new Error(contenido.mensaje || 'Error en la solicitud')
  }

  return contenido
}

export async function cargarDatosDesdeApi() {
  try {
    const [profesionales, turnos] = await Promise.all([
      requestJson('/profesionales'),
      requestJson('/turnos'),
    ])

    return {
      profesionales,
      turnos,
      configuracion: {
        ultimoIdProfesional: profesionales.reduce(
          (maximo, profesional) => Math.max(maximo, profesional.id || 0),
          0
        ),
        ultimoIdTurno: turnos.reduce(
          (maximo, turno) => Math.max(maximo, turno.id || 0),
          0
        ),
      },
    }
  } catch {
    const estadoLocal = crearEstadoInicial()
    return estadoLocal
  }
}

export async function obtenerProfesionalesApi() {
  return requestJson('/profesionales')
}

export async function obtenerTurnosApi() {
  return requestJson('/turnos')
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
