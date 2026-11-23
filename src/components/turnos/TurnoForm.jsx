import { useState } from 'react'
import { useDisponibilidad } from '../../hooks/useDisponibilidad'
import { Boton } from '../ui/Boton'
import './TurnoForm.css'

export function TurnoForm({ turno, onSubmit, onCancelar }) {
  const [dia, setDia] = useState(turno.dia)
  const [hora, setHora] = useState(turno.hora)
  const {
    diasDisponibles,
    horariosDisponibles,
    cargando,
    errorDisponibilidad,
  } = useDisponibilidad(turno.profesionalId, dia, turno.id)

  function manejarSubmit(evento) {
    evento.preventDefault()

    if (!dia || !hora) {
      return
    }

    onSubmit({ dia, hora })
  }

  return (
    <form className="turnoForm" onSubmit={manejarSubmit}>
      <h3 className="turnoFormTitulo">Modificar turno</h3>
      <p className="turnoFormSubtitulo">
        Solo podés cambiar el día y la hora del turno.
      </p>

      <div className="turnoFormCampo">
        <label htmlFor="diaTurno">Día</label>
        <select
          id="diaTurno"
          value={dia}
          onChange={(evento) => {
            setDia(evento.target.value)
            setHora('')
          }}
        >
          {diasDisponibles.map((diaOpcion) => (
            <option key={diaOpcion} value={diaOpcion}>
              {diaOpcion}
            </option>
          ))}
        </select>
      </div>

      <div className="turnoFormCampo">
        <span className="turnoFormEtiqueta">Hora</span>
        {errorDisponibilidad ? (
          <p className="turnoFormAviso" role="alert">
            {errorDisponibilidad}
          </p>
        ) : cargando ? (
          <p className="turnoFormAviso">Consultando horarios...</p>
        ) : horariosDisponibles.length === 0 ? (
          <p className="turnoFormAviso">No hay horarios disponibles para este día.</p>
        ) : (
          <div className="turnoFormHorarios">
            {horariosDisponibles.map((horarioOpcion) => (
              <button
                key={horarioOpcion}
                type="button"
                className={
                  hora === horarioOpcion
                    ? 'turnoFormHorario turnoFormHorarioActivo'
                    : 'turnoFormHorario'
                }
                onClick={() => setHora(horarioOpcion)}
              >
                {horarioOpcion}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="turnoFormAcciones">
        <Boton tipo="button" variante="secundario" onClick={onCancelar}>
          Cancelar
        </Boton>
        <Boton tipo="submit" deshabilitado={!hora}>
          Guardar cambios
        </Boton>
      </div>
    </form>
  )
}
