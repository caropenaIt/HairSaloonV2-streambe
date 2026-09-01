import { useEffect, useState } from 'react'
import { useDisponibilidad } from '../../hooks/useDisponibilidad'
import './SelectorFechaHora.css'

export function SelectorFechaHora({ profesional, dia, hora, onChangeDia, onChangeHora }) {
  const { diasDisponibles, horariosDisponibles } = useDisponibilidad(
    profesional?.id,
    dia
  )

  const [diaInterno, setDiaInterno] = useState(dia || '')

  useEffect(() => {
    if (!diaInterno && diasDisponibles.length > 0) {
      const primerDia = diasDisponibles[0]
      setDiaInterno(primerDia)
      onChangeDia(primerDia)
    }
  }, [diasDisponibles, diaInterno, onChangeDia])

  function manejarCambioDia(nuevoDia) {
    setDiaInterno(nuevoDia)
    onChangeDia(nuevoDia)
    onChangeHora('')
  }

  if (!profesional) {
    return null
  }

  return (
    <section className="selectorFechaHora">
      <h2 className="selectorFechaHoraTitulo">Elegí día y hora</h2>
      <p className="selectorFechaHoraDescripcion">
        Horarios disponibles para {profesional.nombre} {profesional.apellido}
      </p>

      <div className="selectorFechaHoraCampo">
        <label htmlFor="selectorDia">Día</label>
        <select
          id="selectorDia"
          value={diaInterno}
          onChange={(evento) => manejarCambioDia(evento.target.value)}
        >
          {diasDisponibles.map((diaOpcion) => (
            <option key={diaOpcion} value={diaOpcion}>
              {diaOpcion}
            </option>
          ))}
        </select>
      </div>

      <div className="selectorFechaHoraCampo">
        <span className="selectorFechaHoraEtiqueta">Hora</span>
        {horariosDisponibles.length === 0 ? (
          <p className="selectorFechaHoraAviso">
            No hay horarios libres para este día. Elegí otro día.
          </p>
        ) : (
          <div className="selectorFechaHoraHorarios">
            {horariosDisponibles.map((horarioOpcion) => (
              <button
                key={horarioOpcion}
                type="button"
                className={
                  hora === horarioOpcion
                    ? 'selectorFechaHoraBoton selectorFechaHoraBotonActivo'
                    : 'selectorFechaHoraBoton'
                }
                onClick={() => onChangeHora(horarioOpcion)}
              >
                {horarioOpcion}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
