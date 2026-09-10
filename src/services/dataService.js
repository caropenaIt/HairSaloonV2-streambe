import datosIniciales from '../data/db.json'
import { generarIdProfesional, generarIdTurno } from '../utils/generarId'
import { validarTurno } from '../utils/validaciones'

export const CLAVE_PERSISTENCIA = 'unisexHairSaloonDatos'

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
