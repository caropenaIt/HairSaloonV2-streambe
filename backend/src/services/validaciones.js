const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

const ESPECIALIDADES = [
  'Peluquería',
  'Barbería',
  'Colorista',
  'Peinados para eventos',
]

const CAMPOS_PROFESIONAL = [
  'nombre',
  'apellido',
  'especialidad',
  'diasDisponibles',
  'horariosDisponibles',
  'descripcion',
  'avatarUrl',
]

function esObjeto(datos) {
  return datos !== null && typeof datos === 'object' && !Array.isArray(datos)
}

function crearErrorValidacion(mensaje) {
  const error = new Error(mensaje)
  error.status = 400
  return error
}

function validarCamposPermitidos(datos, campos, entidad) {
  if (!esObjeto(datos)) {
    throw crearErrorValidacion(`Los datos de ${entidad} deben ser un objeto.`)
  }

  const campoDesconocido = Object.keys(datos).find(
    (campo) => !campos.includes(campo)
  )

  if (campoDesconocido) {
    throw crearErrorValidacion(
      `El campo "${campoDesconocido}" no está permitido.`
    )
  }
}

function validarTexto(valor, campo, maximo, obligatorio = true) {
  if (typeof valor !== 'string') {
    throw crearErrorValidacion(`El campo "${campo}" debe ser texto.`)
  }

  const texto = valor.trim()
  if ((obligatorio && !texto) || texto.length > maximo) {
    throw crearErrorValidacion(`El campo "${campo}" no es válido.`)
  }

  return texto
}

function normalizarProfesional(datos, profesionalExistente = null) {
  validarCamposPermitidos(datos, CAMPOS_PROFESIONAL, 'profesional')

  const profesional = { ...(profesionalExistente || {}), ...datos }
  const nombre = validarTexto(profesional.nombre, 'nombre', 100)
  const apellido = validarTexto(profesional.apellido, 'apellido', 100)
  const especialidad = validarTexto(profesional.especialidad, 'especialidad', 60)
  const descripcion = validarTexto(profesional.descripcion, 'descripcion', 500)
  const avatarUrl =
    profesional.avatarUrl === undefined || profesional.avatarUrl === ''
      ? ''
      : validarTexto(profesional.avatarUrl, 'avatarUrl', 2048, false)

  if (!ESPECIALIDADES.includes(especialidad)) {
    throw crearErrorValidacion('La especialidad no es válida.')
  }

  const diasDisponibles = profesional.diasDisponibles
  if (
    !Array.isArray(diasDisponibles) ||
    diasDisponibles.length === 0 ||
    diasDisponibles.length > DIAS_SEMANA.length ||
    diasDisponibles.some((dia) => !DIAS_SEMANA.includes(dia)) ||
    new Set(diasDisponibles).size !== diasDisponibles.length
  ) {
    throw crearErrorValidacion('Los días disponibles no son válidos.')
  }

  const horariosDisponibles = profesional.horariosDisponibles
  if (
    !Array.isArray(horariosDisponibles) ||
    horariosDisponibles.length === 0 ||
    horariosDisponibles.length > 30 ||
    horariosDisponibles.some((hora) => !esHoraValida(hora)) ||
    new Set(horariosDisponibles).size !== horariosDisponibles.length
  ) {
    throw crearErrorValidacion('Los horarios disponibles no son válidos.')
  }

  return {
    nombre,
    apellido,
    especialidad,
    diasDisponibles,
    horariosDisponibles,
    descripcion,
    avatarUrl,
  }
}

function esHoraValida(hora) {
  return typeof hora === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(hora)
}

function validarTurno(datos, campos = ['clienteNombre', 'profesionalId', 'dia', 'hora']) {
  validarCamposPermitidos(datos, campos, 'turno')

  if (
    !Number.isInteger(Number(datos.profesionalId)) ||
    Number(datos.profesionalId) <= 0
  ) {
    throw crearErrorValidacion('El profesional seleccionado no es válido.')
  }

  if (!DIAS_SEMANA.includes(datos.dia)) {
    throw crearErrorValidacion('El día seleccionado no es válido.')
  }

  if (!esHoraValida(datos.hora)) {
    throw crearErrorValidacion('El horario seleccionado no es válido.')
  }

  const clienteNombre = validarTexto(datos.clienteNombre, 'clienteNombre', 120)

  return {
    clienteNombre,
    profesionalId: Number(datos.profesionalId),
    dia: datos.dia,
    hora: datos.hora,
  }
}

export {
  CAMPOS_PROFESIONAL,
  DIAS_SEMANA,
  ESPECIALIDADES,
  crearErrorValidacion,
  esObjeto,
  esHoraValida,
  normalizarProfesional,
  validarCamposPermitidos,
  validarTexto,
  validarTurno,
}
