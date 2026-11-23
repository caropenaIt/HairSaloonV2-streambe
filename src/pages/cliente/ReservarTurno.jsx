import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ConfirmacionTurno } from '../../components/turnos/ConfirmacionTurno'
import { SelectorFechaHora } from '../../components/turnos/SelectorFechaHora'
import { SelectorProfesional } from '../../components/turnos/SelectorProfesional'
import { Boton } from '../../components/ui/Boton'
import { useAppContext } from '../../context/AppContext'
import { useTurnos } from '../../hooks/useTurnos'
import './ReservarTurno.css'

const PASOS = ['Profesional', 'Fecha y hora', 'Confirmación']

export function ReservarTurno() {
  const { reservarTurno } = useTurnos()
  const { usuario } = useAppContext()
  const [pasoActual, setPasoActual] = useState(0)
  const [profesionalSeleccionado, setProfesionalSeleccionado] = useState(null)
  const [dia, setDia] = useState('')
  const [hora, setHora] = useState('')

  function avanzarPaso() {
    setPasoActual((previo) => Math.min(previo + 1, PASOS.length - 1))
  }

  function retrocederPaso() {
    setPasoActual((previo) => Math.max(previo - 1, 0))
  }

  function manejarSeleccionProfesional(profesional) {
    setProfesionalSeleccionado(profesional)
    setDia('')
    setHora('')
  }

  function puedeAvanzar() {
    if (pasoActual === 0) return profesionalSeleccionado !== null
    if (pasoActual === 1) return dia !== '' && hora !== ''
    return false
  }

  return (
    <section className="reservarTurno">
      <header className="reservarTurnoHeader">
        <Link to="/cliente" className="reservarTurnoVolver">
          ← Volver al área cliente
        </Link>
        <h1>Reservar turno</h1>
      </header>

      <nav className="reservarTurnoPasos" aria-label="Progreso de reserva">
        {PASOS.map((paso, indice) => (
          <div
            key={paso}
            className={`reservarTurnoPaso ${
              indice === pasoActual ? 'reservarTurnoPasoActivo' : ''
            } ${indice < pasoActual ? 'reservarTurnoPasoCompletado' : ''}`}
          >
            <span className="reservarTurnoPasoNumero">{indice + 1}</span>
            <span className="reservarTurnoPasoTexto">{paso}</span>
          </div>
        ))}
      </nav>

      <div className="reservarTurnoContenido">
        {pasoActual === 0 && (
          <SelectorProfesional
            profesionalSeleccionado={profesionalSeleccionado}
            onSeleccionar={manejarSeleccionProfesional}
          />
        )}

        {pasoActual === 1 && (
          <SelectorFechaHora
            profesional={profesionalSeleccionado}
            dia={dia}
            hora={hora}
            onChangeDia={setDia}
            onChangeHora={setHora}
          />
        )}

        {pasoActual === 2 && (
          <ConfirmacionTurno
            profesional={profesionalSeleccionado}
            dia={dia}
            hora={hora}
            clienteNombre={usuario.nombre}
            onConfirmar={reservarTurno}
          />
        )}
      </div>

      {pasoActual < 2 && (
        <div className="reservarTurnoNavegacion">
          {pasoActual > 0 && (
            <Boton variante="secundario" onClick={retrocederPaso}>
              Anterior
            </Boton>
          )}
          <Boton onClick={avanzarPaso} deshabilitado={!puedeAvanzar()}>
            Siguiente
          </Boton>
        </div>
      )}

      {pasoActual === 2 && (
        <div className="reservarTurnoNavegacion">
          <Boton variante="secundario" onClick={retrocederPaso}>
            Anterior
          </Boton>
        </div>
      )}
    </section>
  )
}
