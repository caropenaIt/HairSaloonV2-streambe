import { describe, expect, it } from 'vitest'
import {
  normalizarProfesional,
  validarTurno,
} from '../backend/src/services/validaciones.js'

const profesionalValido = {
  nombre: 'Lucía',
  apellido: 'Pérez',
  especialidad: 'Peluquería',
  diasDisponibles: ['Lunes'],
  horariosDisponibles: ['10:30'],
  descripcion: 'Estilista',
  avatarUrl: '',
}

describe('validación del backend', () => {
  it('rechaza campos no permitidos que podrían sobrescribir el identificador', () => {
    expect(() =>
      normalizarProfesional({ ...profesionalValido, id: 700 })
    ).toThrow('El campo "id" no está permitido.')
  })

  it('rechaza horarios fuera del formato admitido al actualizar profesionales', () => {
    expect(() =>
      normalizarProfesional({
        ...profesionalValido,
        horariosDisponibles: ['25:90'],
      })
    ).toThrow('Los horarios disponibles no son válidos.')
  })

  it('rechaza identificadores de cliente enviados en el cuerpo de una reserva', () => {
    expect(() =>
      validarTurno({
        clienteNombre: 'Ana Gómez',
        profesionalId: 1,
        dia: 'Lunes',
        hora: '10:30',
        clienteId: 'otro-cliente',
      })
    ).toThrow('El campo "clienteId" no está permitido.')
  })
})
