import datosIniciales from '../data/db.json'
import { generarIdProfesional, generarIdTurno } from '../utils/generarId'

function clonarDatosIniciales() {
  return JSON.parse(JSON.stringify(datosIniciales))
}

export function crearEstadoInicial() {
  return clonarDatosIniciales()
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
