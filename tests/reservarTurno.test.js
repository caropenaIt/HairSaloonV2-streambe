import { describe, expect, it } from 'vitest'
import { reservarTurno } from '../src/services/dataService'

// Test unitarios de la regla de negocio "reservar turno" (rol cliente).
// reservarTurno es una función pura: recibe el estado de la app y los datos
// del turno, aplica todas las validaciones y devuelve un resultado sin mutar el estado.

// Crea un profesional de prueba con días y horarios disponibles configurables.
function crearProfesional(id, diasDisponibles, horariosDisponibles) {
  return {
    id,
    nombre: 'Pro',
    apellido: `Fesional ${id}`,
    especialidad: 'Peluquería',
    diasDisponibles,
    horariosDisponibles,
    descripcion: 'Descripción de prueba',
  }
}

// Crea un estado de la aplicación mínimo pero con la estructura real.
// Configuración de ids para que no dependa del seed de db.json.
function crearEstado({ profesionales = [], turnos = [] } = {}) {
  return {
    profesionales,
    turnos,
    configuracion: { ultimoIdProfesional: 2, ultimoIdTurno: 10 },
  }
}

// Crea un turno ya existente en el estado (para simular ocupación/conflictos).
function crearTurno(id, profesionalId, dia, hora, estado) {
  return {
    id,
    profesionalId,
    dia,
    hora,
    clienteNombre: 'Cliente existente',
    estado,
  }
}

// Datos base de un turno correctamente completado: el profesional 1 atiende
// los Lunes entre 10:00 y 11:00, por lo que Lunes 11:00 es un horario válido.
const datosValidos = {
  clienteNombre: 'Ana Gómez',
  dia: 'Lunes',
  hora: '11:00',
  profesionalId: 1,
  especialidad: 'Peluquería',
}

describe('reservarTurno - casos correctos', () => {
  // Prueba que una reserva con todos los datos válidos, profesional existente
  // y horario libre termina en éxito, con el mensaje esperado y los mismos datos.
  it('reserva un turno cuando el horario está libre', () => {
    const estado = crearEstado({
      profesionales: [
        crearProfesional(1, ['Lunes'], ['10:00', '11:00']),
        crearProfesional(2, ['Lunes', 'Martes'], ['10:00', '11:00', '12:00']),
      ],
      turnos: [],
    })

    const resultado = reservarTurno(estado, datosValidos)

    expect(resultado.exito).toBe(true)
    expect(resultado.mensaje).toBe('Turno reservado correctamente.')
    expect(resultado.errores).toEqual({})
    expect(resultado.datosTurno).toEqual(datosValidos)
  })

  // Prueba que un turno previamente cancelado NO ocupa el horario:
  // solo bloquean los confirmados, por lo que se puede volver a reservar.
  it('permite reservar sobre un turno cancelado del mismo profesional y horario', () => {
    const estado = crearEstado({
      profesionales: [crearProfesional(1, ['Lunes'], ['10:00', '11:00'])],
      turnos: [crearTurno(1, 1, 'Lunes', '11:00', 'cancelado')],
    })

    const resultado = reservarTurno(estado, datosValidos)

    expect(resultado.exito).toBe(true)
  })

  // Prueba que el conflicto depende solo del profesional elegido: un turno
  // confirmado de OTRO profesional en el mismo día y hora no bloquea la reserva.
  it('un turno de otro profesional en el mismo día y hora no bloquea la reserva', () => {
    const estado = crearEstado({
      profesionales: [
        crearProfesional(1, ['Lunes'], ['10:00', '11:00']),
        crearProfesional(2, ['Lunes'], ['10:00', '11:00']),
      ],
      turnos: [crearTurno(1, 2, 'Lunes', '11:00', 'confirmado')],
    })

    const resultado = reservarTurno(estado, datosValidos)

    expect(resultado.exito).toBe(true)
  })
})

describe('reservarTurno - validación de campos obligatorios', () => {
  // Prueba que el nombre del cliente es obligatorio: con valor vacío la
  // reserva se rechaza y se devuelve el error correspondiente a ese campo.
  it('rechaza un turno sin nombre de cliente', () => {
    const estado = crearEstado({
      profesionales: [crearProfesional(1, ['Lunes'], ['10:00', '11:00'])],
    })

    const resultado = reservarTurno(estado, {
      ...datosValidos,
      clienteNombre: '',
    })

    expect(resultado.exito).toBe(false)
    expect(resultado.errores.clienteNombre).toBe(
      'El nombre del cliente es obligatorio'
    )
  })

  // Prueba que un nombre solo con espacios se trata como vacío (se recorta
  // con trim), es decir, no basta con escribir espacios en blanco.
  it('rechaza un turno con nombre de cliente de solo espacios', () => {
    const estado = crearEstado({
      profesionales: [crearProfesional(1, ['Lunes'], ['10:00', '11:00'])],
    })

    const resultado = reservarTurno(estado, {
      ...datosValidos,
      clienteNombre: '   ',
    })

    expect(resultado.exito).toBe(false)
    expect(resultado.errores.clienteNombre).toBe(
      'El nombre del cliente es obligatorio'
    )
  })

  // Prueba que el día es obligatorio: sin día no se avanza a la creación.
  it('rechaza un turno sin día', () => {
    const estado = crearEstado({
      profesionales: [crearProfesional(1, ['Lunes'], ['10:00', '11:00'])],
    })

    const resultado = reservarTurno(estado, {
      ...datosValidos,
      dia: '',
    })

    expect(resultado.exito).toBe(false)
    expect(resultado.errores.dia).toBe('Seleccioná un día')
  })

  // Prueba que la hora es obligatoria: sin hora no se avanza a la creación.
  it('rechaza un turno sin hora', () => {
    const estado = crearEstado({
      profesionales: [crearProfesional(1, ['Lunes'], ['10:00', '11:00'])],
    })

    const resultado = reservarTurno(estado, {
      ...datosValidos,
      hora: '',
    })

    expect(resultado.exito).toBe(false)
    expect(resultado.errores.hora).toBe('Seleccioná un horario')
  })

  // Prueba que es obligatorio elegir un profesional: sin profesionalId la
  // reserva se rechaza antes de verificar disponibilidad o conflictos.
  it('rechaza un turno sin profesional seleccionado', () => {
    const estado = crearEstado({
      profesionales: [crearProfesional(1, ['Lunes'], ['10:00', '11:00'])],
    })

    const resultado = reservarTurno(estado, {
      ...datosValidos,
      profesionalId: undefined,
    })

    expect(resultado.exito).toBe(false)
    expect(resultado.errores.profesionalId).toBe('Seleccioná un profesional')
  })
})

describe('reservarTurno - disponibilidad y conflictos', () => {
  // Prueba que un profesional que no existe en la base no puede recibir turnos:
  // protege contra id inválidos aunque el resto de los campos sea correcto.
  it('rechaza una reserva para un profesional inexistente', () => {
    const estado = crearEstado({
      profesionales: [crearProfesional(1, ['Lunes'], ['10:00', '11:00'])],
    })

    const resultado = reservarTurno(estado, {
      ...datosValidos,
      profesionalId: 999,
    })

    expect(resultado.exito).toBe(false)
    expect(resultado.errores.general).toBe(
      'El profesional seleccionado no existe.'
    )
  })

  // Prueba que solo se reservan días dentro de diasDisponibles del profesional:
  // si el profesional no atiende ese día, la reserva se rechaza.
  it('rechaza un día en el que el profesional no atiende', () => {
    const estado = crearEstado({
      profesionales: [crearProfesional(1, ['Lunes'], ['10:00', '11:00'])],
    })

    const resultado = reservarTurno(estado, {
      ...datosValidos,
      dia: 'Martes',
    })

    expect(resultado.exito).toBe(false)
    expect(resultado.errores.general).toBe(
      'El profesional no atiende ese día.'
    )
  })

  // Prueba que solo se reservan horas dentro de horariosDisponibles: si la
  // hora no la ofrece el profesional, la reserva se rechaza.
  it('rechaza una hora que el profesional no ofrece', () => {
    const estado = crearEstado({
      profesionales: [crearProfesional(1, ['Lunes'], ['10:00', '11:00'])],
    })

    const resultado = reservarTurno(estado, {
      ...datosValidos,
      hora: '12:00',
    })

    expect(resultado.exito).toBe(false)
    expect(resultado.errores.general).toBe(
      'Ese horario no está disponible para el profesional.'
    )
  })

  // Prueba el caso límite principal: cuando el mismo profesional ya tiene un
  // turno CONFIRMADO en ese día y hora, la reserva se rechaza con el mensaje
  // de conflicto, evitando el doble turno.
  it('rechaza una reserva cuando el horario ya está ocupado por un turno confirmado', () => {
    const estado = crearEstado({
      profesionales: [crearProfesional(1, ['Lunes'], ['10:00', '11:00'])],
      turnos: [crearTurno(1, 1, 'Lunes', '11:00', 'confirmado')],
    })

    const resultado = reservarTurno(estado, datosValidos)

    expect(resultado.exito).toBe(false)
    expect(resultado.errores.general).toBe(
      'Ese horario ya está ocupado. Elegí otro.'
    )
  })
})