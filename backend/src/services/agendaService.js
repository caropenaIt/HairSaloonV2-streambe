import { randomUUID } from 'node:crypto'
import { readFile, rename, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { config } from '../config/index.js'
import {
  normalizarProfesional,
  validarCamposPermitidos,
  validarTurno,
} from './validaciones.js'

const datosPath = fileURLToPath(config.archivoDatos)
let colaOperaciones = Promise.resolve()

async function leerBase() {
  const contenido = await readFile(datosPath, 'utf8')
  return JSON.parse(contenido)
}

async function guardarBase(datos) {
  const rutaTemporal = `${datosPath}.${process.pid}.tmp`
  await writeFile(rutaTemporal, JSON.stringify(datos, null, 2), 'utf8')
  await rename(rutaTemporal, datosPath)
}

function ejecutarOperacion(operacion) {
  const resultado = colaOperaciones.then(operacion)
  colaOperaciones = resultado.then(
    () => undefined,
    () => undefined
  )
  return resultado
}

function actualizarBase(operacion) {
  return ejecutarOperacion(async () => {
    const base = await leerBase()
    const resultado = await operacion(base)
    await guardarBase(base)
    return resultado
  })
}

function existeCorreoRegistrado(base, correo) {
  const correoNormalizado = correo.trim().toLowerCase()
  const cuentas = [
    ...(base.usuarios || []),
    ...(base.administradores || []),
  ]

  return cuentas.some(
    (cuenta) =>
      typeof cuenta.correo === 'string' &&
      cuenta.correo.trim().toLowerCase() === correoNormalizado
  )
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
  const datosValidados = normalizarProfesional(datos)

  return actualizarBase((base) => {
    const nuevoId = (base.configuracion?.ultimoIdProfesional ?? 0) + 1
    const profesional = { ...datosValidados, id: nuevoId }

    base.profesionales.push(profesional)
    base.configuracion = {
      ...base.configuracion,
      ultimoIdProfesional: nuevoId,
    }

    return profesional
  })
}

export async function actualizarProfesional(id, datos) {
  return actualizarBase((base) => {
    const indice = base.profesionales.findIndex(
      (profesional) => profesional.id === Number(id)
    )

    if (indice === -1) {
      return null
    }

    const profesionalValidado = normalizarProfesional(
      datos,
      base.profesionales[indice]
    )
    base.profesionales[indice] = {
      ...profesionalValidado,
      id: Number(id),
    }

    return base.profesionales[indice]
  })
}

export async function eliminarProfesional(id) {
  return actualizarBase((base) => {
    const tieneTurnosActivos = base.turnos.some(
      (turno) =>
        Number(turno.profesionalId) === Number(id) &&
        turno.estado === 'confirmado'
    )

    if (tieneTurnosActivos) {
      throw new Error(
        'No se puede eliminar un profesional con turnos confirmados activos.'
      )
    }

    base.profesionales = base.profesionales.filter(
      (profesional) => profesional.id !== Number(id)
    )

    return true
  })
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

export async function obtenerTurnosDeCliente(clienteId) {
  const base = await leerBase()
  return base.turnos.filter((turno) => turno.clienteId === clienteId)
}

export async function consultarDisponibilidad(
  profesionalId,
  dia,
  turnoIdExcluido,
  usuario
) {
  const base = await leerBase()
  const profesional = base.profesionales.find(
    (item) => item.id === Number(profesionalId)
  )

  if (!profesional) {
    return null
  }

  const turnoExcluido = base.turnos.find(
    (turno) => turno.id === Number(turnoIdExcluido)
  )
  const puedeExcluirTurno =
    turnoExcluido &&
    (usuario.rol === 'administrador' || turnoExcluido.clienteId === usuario.id)
  const horariosOcupados = base.turnos
    .filter(
      (turno) =>
        turno.profesionalId === profesional.id &&
        turno.dia === dia &&
        turno.estado === 'confirmado' &&
        !(puedeExcluirTurno && turno.id === turnoExcluido.id)
    )
    .map((turno) => turno.hora)

  return {
    diasDisponibles: profesional.diasDisponibles,
    horariosDisponibles: profesional.diasDisponibles.includes(dia)
      ? profesional.horariosDisponibles.filter(
          (hora) => !horariosOcupados.includes(hora)
        )
      : [],
  }
}

export async function obtenerTurnoPorId(id) {
  const base = await leerBase()
  return base.turnos.find((turno) => turno.id === Number(id)) || null
}

export async function crearTurno(datos, clienteId) {
  const datosValidados = validarTurno(datos)

  return actualizarBase((base) => {
    const profesional = base.profesionales.find(
      (item) => item.id === datosValidados.profesionalId
    )

    if (!profesional) {
      throw new Error('El profesional seleccionado no existe.')
    }

    validarDisponibilidad(profesional, datosValidados.dia, datosValidados.hora)
    validarConflicto(
      base.turnos,
      datosValidados.profesionalId,
      datosValidados.dia,
      datosValidados.hora
    )

    const nuevoId = (base.configuracion?.ultimoIdTurno ?? 0) + 1
    const turno = {
      ...datosValidados,
      id: nuevoId,
      clienteId,
      especialidad: profesional.especialidad,
      estado: 'confirmado',
    }

    base.turnos.push(turno)
    base.configuracion = {
      ...base.configuracion,
      ultimoIdTurno: nuevoId,
    }

    return turno
  })
}

export async function modificarTurno(id, datosActualizados) {
  return actualizarBase((base) =>
    modificarTurnoEnBase(base, id, datosActualizados)
  )
}

export async function modificarTurnoDeCliente(id, clienteId, datosActualizados) {
  return actualizarBase((base) => {
    const turno = base.turnos.find((item) => item.id === Number(id))
    if (!turno || turno.clienteId !== clienteId) {
      return null
    }

    return modificarTurnoEnBase(base, id, datosActualizados)
  })
}

function modificarTurnoEnBase(base, id, datosActualizados) {
  validarCamposPermitidos(
    datosActualizados,
    ['profesionalId', 'dia', 'hora'],
    'turno'
  )

  const indice = base.turnos.findIndex((turno) => turno.id === Number(id))
  if (indice === -1) {
    return null
  }

  const turnoActual = base.turnos[indice]
  if (turnoActual.estado === 'cancelado') {
    throw new Error('No se puede modificar un turno cancelado.')
  }

  const profesionalId = Number(
    datosActualizados.profesionalId ?? turnoActual.profesionalId
  )
  const profesional = base.profesionales.find((item) => item.id === profesionalId)
  if (!profesional) {
    throw new Error('El profesional seleccionado no existe.')
  }

  const turnoValidado = validarTurno({
    clienteNombre: turnoActual.clienteNombre,
    profesionalId,
    dia: datosActualizados.dia ?? turnoActual.dia,
    hora: datosActualizados.hora ?? turnoActual.hora,
  })

  validarDisponibilidad(profesional, turnoValidado.dia, turnoValidado.hora)
  validarConflicto(
    base.turnos,
    profesionalId,
    turnoValidado.dia,
    turnoValidado.hora,
    Number(id)
  )

  base.turnos[indice] = {
    ...turnoActual,
    profesionalId,
    dia: turnoValidado.dia,
    hora: turnoValidado.hora,
    especialidad: profesional.especialidad,
  }

  return base.turnos[indice]
}

export async function cancelarTurno(id) {
  return actualizarBase((base) => cancelarTurnoEnBase(base, id))
}

export async function cancelarTurnoDeCliente(id, clienteId) {
  return actualizarBase((base) => {
    const turno = base.turnos.find((item) => item.id === Number(id))
    if (!turno || turno.clienteId !== clienteId) {
      return null
    }

    return cancelarTurnoEnBase(base, id)
  })
}

function cancelarTurnoEnBase(base, id) {
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

  return base.turnos[indice]
}

export async function registrarCliente(datosCliente) {
  return actualizarBase((base) => {
    const correo = datosCliente.correo.toLowerCase()
    if (existeCorreoRegistrado(base, correo)) {
      const error = new Error('Ya existe una cuenta con ese correo.')
      error.status = 409
      throw error
    }

    const usuario = {
      id: randomUUID(),
      nombre: datosCliente.nombre,
      correo,
      passwordSalt: datosCliente.passwordSalt,
      passwordHash: datosCliente.passwordHash,
      rol: 'cliente',
    }

    base.usuarios = [...(base.usuarios || []), usuario]
    return usuario
  })
}

export async function obtenerClientePorCorreo(correo) {
  const base = await leerBase()
  return (
    (base.usuarios || []).find(
      (usuario) =>
        usuario.rol === 'cliente' &&
        typeof usuario.correo === 'string' &&
        usuario.correo.trim().toLowerCase() === correo.toLowerCase()
    ) || null
  )
}

function agregarAdministrador(base, datosAdministrador) {
  const correo = datosAdministrador.correo.toLowerCase()
  if (existeCorreoRegistrado(base, correo)) {
    const error = new Error('Ya existe una cuenta con ese correo.')
    error.status = 409
    throw error
  }

  const administrador = {
    id: randomUUID(),
    nombre: datosAdministrador.nombre,
    correo,
    passwordSalt: datosAdministrador.passwordSalt,
    passwordHash: datosAdministrador.passwordHash,
    rol: 'administrador',
  }

  base.administradores = [...(base.administradores || []), administrador]
  return administrador
}

export async function registrarAdministrador(datosAdministrador) {
  return actualizarBase((base) => agregarAdministrador(base, datosAdministrador))
}

export async function obtenerAdministradorPorCorreo(correo) {
  const base = await leerBase()
  return (
    (base.administradores || []).find(
      (administrador) =>
        administrador.rol === 'administrador' &&
        typeof administrador.correo === 'string' &&
        administrador.correo.trim().toLowerCase() === correo.toLowerCase()
    ) || null
  )
}

function validarDisponibilidad(profesional, dia, hora) {
  if (!profesional.diasDisponibles.includes(dia)) {
    throw new Error('El profesional no atiende ese día.')
  }

  if (!profesional.horariosDisponibles.includes(hora)) {
    throw new Error('Ese horario no está disponible para el profesional.')
  }
}

function validarConflicto(
  turnos,
  profesionalId,
  dia,
  hora,
  turnoIdExcluido = null
) {
  const conflicto = turnos.some(
    (turno) =>
      Number(turno.profesionalId) === Number(profesionalId) &&
      turno.dia === dia &&
      turno.hora === hora &&
      turno.estado === 'confirmado' &&
      turno.id !== turnoIdExcluido
  )

  if (conflicto) {
    throw new Error('Ese horario ya está ocupado. Elegí otro.')
  }
}
