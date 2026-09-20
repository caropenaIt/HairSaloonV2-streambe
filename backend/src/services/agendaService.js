import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const datosPath = path.join(__dirname, '..', 'data', 'db.json')

async function leerBase() {
  const contenido = await readFile(datosPath, 'utf8')
  return JSON.parse(contenido)
}

async function guardarBase(datos) {
  await writeFile(datosPath, JSON.stringify(datos, null, 2), 'utf8')
}

export async function listarProfesionales() {
  const base = await leerBase()
  return base.profesionales
}

export async function obtenerProfesionalPorId(id) {
  const base = await leerBase()
  return base.profesionales.find((profesional) => profesional.id === Number(id)) || null
}

export async function crearProfesional(datos) {
  const base = await leerBase()
  const nuevoId = (base.configuracion?.ultimoIdProfesional ?? 0) + 1

  const profesional = {
    id: nuevoId,
    ...datos,
  }

  base.profesionales.push(profesional)
  base.configuracion = {
    ...base.configuracion,
    ultimoIdProfesional: nuevoId,
  }

  await guardarBase(base)
  return profesional
}

export async function actualizarProfesional(id, datos) {
  const base = await leerBase()
  const indice = base.profesionales.findIndex((profesional) => profesional.id === Number(id))

  if (indice === -1) {
    return null
  }

  base.profesionales[indice] = {
    ...base.profesionales[indice],
    ...datos,
    id: Number(id),
  }

  await guardarBase(base)
  return base.profesionales[indice]
}

export async function eliminarProfesional(id) {
  const base = await leerBase()

  const tieneTurnosActivos = base.turnos.some(
    (turno) => Number(turno.profesionalId) === Number(id) && turno.estado === 'confirmado'
  )

  if (tieneTurnosActivos) {
    throw new Error('No se puede eliminar un profesional con turnos confirmados activos.')
  }

  base.profesionales = base.profesionales.filter(
    (profesional) => profesional.id !== Number(id)
  )

  await guardarBase(base)
  return true
}

export async function listarTurnos() {
  const base = await leerBase()
  return base.turnos
}

export async function obtenerTurnosPorProfesional(profesionalId) {
  const base = await leerBase()
  return base.turnos.filter(
    (turno) => Number(turno.profesionalId) === Number(profesionalId)
  )
}

export async function obtenerTurnosPorCliente(nombreCliente) {
  const base = await leerBase()
  const nombreNormalizado = nombreCliente.trim().toLowerCase()

  return base.turnos.filter((turno) =>
    turno.clienteNombre.toLowerCase().includes(nombreNormalizado)
  )
}

export async function crearTurno(datos) {
  const base = await leerBase()
  const profesional = base.profesionales.find(
    (item) => Number(item.id) === Number(datos.profesionalId)
  )

  if (!profesional) {
    throw new Error('El profesional seleccionado no existe.')
  }

  if (!profesional.diasDisponibles.includes(datos.dia)) {
    throw new Error('El profesional no atiende ese día.')
  }

  if (!profesional.horariosDisponibles.includes(datos.hora)) {
    throw new Error('Ese horario no está disponible para el profesional.')
  }

  const conflicto = base.turnos.some(
    (turno) =>
      Number(turno.profesionalId) === Number(datos.profesionalId) &&
      turno.dia === datos.dia &&
      turno.hora === datos.hora &&
      turno.estado === 'confirmado'
  )

  if (conflicto) {
    throw new Error('Ese horario ya está ocupado. Elegí otro.')
  }

  const nuevoId = (base.configuracion?.ultimoIdTurno ?? 0) + 1
  const turno = {
    id: nuevoId,
    ...datos,
    especialidad: profesional.especialidad,
    estado: 'confirmado',
  }

  base.turnos.push(turno)
  base.configuracion = {
    ...base.configuracion,
    ultimoIdTurno: nuevoId,
  }

  await guardarBase(base)
  return turno
}

export async function modificarTurno(id, datosActualizados) {
  const base = await leerBase()
  const indice = base.turnos.findIndex((turno) => turno.id === Number(id))

  if (indice === -1) {
    return null
  }

  const turnoActual = base.turnos[indice]

  if (turnoActual.estado === 'cancelado') {
    throw new Error('No se puede modificar un turno cancelado.')
  }

  const profesionalId = Number(datosActualizados.profesionalId ?? turnoActual.profesionalId)
  const dia = datosActualizados.dia ?? turnoActual.dia
  const hora = datosActualizados.hora ?? turnoActual.hora

  const profesional = base.profesionales.find((item) => Number(item.id) === profesionalId)
  if (!profesional) {
    throw new Error('El profesional seleccionado no existe.')
  }

  const conflicto = base.turnos.some(
    (turno) =>
      Number(turno.profesionalId) === profesionalId &&
      turno.dia === dia &&
      turno.hora === hora &&
      turno.estado === 'confirmado' &&
      turno.id !== Number(id)
  )

  if (conflicto) {
    throw new Error('Ese horario ya está ocupado. Elegí otro.')
  }

  base.turnos[indice] = {
    ...turnoActual,
    ...datosActualizados,
    profesionalId,
    dia,
    hora,
    especialidad: profesional.especialidad,
  }

  await guardarBase(base)
  return base.turnos[indice]
}

export async function cancelarTurno(id) {
  const base = await leerBase()
  const indice = base.turnos.findIndex((turno) => turno.id === Number(id))

  if (indice === -1) {
    return null
  }

  if (base.turnos[indice].estado === 'cancelado') {
    throw new Error('El turno ya estaba cancelado.')
  }

  base.turnos[indice] = {
    ...base.turnos[indice],
    estado: 'cancelado',
  }

  await guardarBase(base)
  return base.turnos[indice]
}
