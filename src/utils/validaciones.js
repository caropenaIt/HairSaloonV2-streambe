import { DIAS_SEMANA, ESPECIALIDADES } from './constantes'

export function validarProfesional(datos) {
  const errores = {}

  if (!datos.nombre?.trim()) {
    errores.nombre = 'El nombre es obligatorio'
  }

  if (!datos.apellido?.trim()) {
    errores.apellido = 'El apellido es obligatorio'
  }

  if (!ESPECIALIDADES.includes(datos.especialidad)) {
    errores.especialidad = 'Seleccioná una especialidad válida'
  }

  if (!datos.diasDisponibles?.length) {
    errores.diasDisponibles = 'Seleccioná al menos un día disponible'
  } else {
    const diasInvalidos = datos.diasDisponibles.filter(
      (dia) => !DIAS_SEMANA.includes(dia)
    )
    if (diasInvalidos.length > 0) {
      errores.diasDisponibles = 'Hay días no válidos seleccionados'
    }
  }

  if (!datos.horariosDisponibles?.length) {
    errores.horariosDisponibles = 'Agregá al menos un horario disponible'
  }

  if (!datos.descripcion?.trim()) {
    errores.descripcion = 'La descripción es obligatoria'
  }

  return errores
}

export function validarTurno(datos) {
  const errores = {}

  if (!datos.clienteNombre?.trim()) {
    errores.clienteNombre = 'El nombre del cliente es obligatorio'
  }

  if (!datos.dia) {
    errores.dia = 'Seleccioná un día'
  }

  if (!datos.hora) {
    errores.hora = 'Seleccioná un horario'
  }

  if (!datos.profesionalId) {
    errores.profesionalId = 'Seleccioná un profesional'
  }

  return errores
}

export function normalizarHorario(horario) {
  return horario.replace(/\s*hs$/i, '').trim()
}

export function obtenerNombreCompleto(profesional) {
  return `${profesional.nombre} ${profesional.apellido}`.trim()
}
