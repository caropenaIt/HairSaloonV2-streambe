import { useState } from 'react'
import { obtenerNombreCompleto } from '../../utils/validaciones'
import { Boton } from '../ui/Boton'
import './ConfirmacionTurno.css'

export function ConfirmacionTurno({ profesional, dia, hora, onConfirmar }) {
  const [clienteNombre, setClienteNombre] = useState('')
  const [errores, setErrores] = useState({})
  const [mensajeExito, setMensajeExito] = useState('')

  function manejarConfirmar() {
    const datosTurno = {
      clienteNombre,
      dia,
      hora,
      profesionalId: profesional.id,
      especialidad: profesional.especialidad,
    }

    const resultado = onConfirmar(datosTurno)

    if (resultado.exito) {
      setMensajeExito(resultado.mensaje)
      setClienteNombre('')
      setErrores({})
    } else {
      setErrores(resultado.errores)
    }
  }

  return (
    <section className="confirmacionTurno">
      <h2 className="confirmacionTurnoTitulo">Confirmá tu turno</h2>

      <div className="confirmacionTurnoResumen">
        <p>
          <strong>Profesional:</strong> {obtenerNombreCompleto(profesional)}
        </p>
        <p>
          <strong>Especialidad:</strong> {profesional.especialidad}
        </p>
        <p>
          <strong>Día:</strong> {dia}
        </p>
        <p>
          <strong>Hora:</strong> {hora}
        </p>
      </div>

      <div className="confirmacionTurnoCampo">
        <label htmlFor="clienteNombre">Tu nombre *</label>
        <input
          id="clienteNombre"
          type="text"
          value={clienteNombre}
          onChange={(evento) => setClienteNombre(evento.target.value)}
          placeholder="Ej: Ana Gómez"
        />
        {errores.clienteNombre && (
          <span className="confirmacionTurnoError">{errores.clienteNombre}</span>
        )}
      </div>

      {errores.general && (
        <p className="confirmacionTurnoErrorGeneral">{errores.general}</p>
      )}

      {mensajeExito && (
        <p className="confirmacionTurnoExito" role="status">
          {mensajeExito}
        </p>
      )}

      <Boton onClick={manejarConfirmar}>Confirmar reserva</Boton>
    </section>
  )
}
