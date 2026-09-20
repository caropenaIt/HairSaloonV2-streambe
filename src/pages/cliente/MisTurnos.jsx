import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TurnoForm } from '../../components/turnos/TurnoForm'
import { TurnoList } from '../../components/turnos/TurnoList'
import { Modal } from '../../components/ui/Modal'
import { useTurnos } from '../../hooks/useTurnos'
import './MisTurnos.css'

export function MisTurnos() {
  const {
    obtenerTurnosPorCliente,
    enriquecerTurno,
    modificarTurno,
    cancelarTurnoCliente,
  } = useTurnos()

  const [nombreBusqueda, setNombreBusqueda] = useState('')
  const [nombreConsultado, setNombreConsultado] = useState('')
  const [turnoEditando, setTurnoEditando] = useState(null)
  const [turnoCancelando, setTurnoCancelando] = useState(null)
  const [mensajeFeedback, setMensajeFeedback] = useState('')
  const [feedbackEsError, setFeedbackEsError] = useState(false)
  const [filtroEstado, setFiltroEstado] = useState('todos')

  const turnosCliente = useMemo(() => {
    if (!nombreConsultado) {
      return []
    }

    return obtenerTurnosPorCliente(nombreConsultado).map(enriquecerTurno)
  }, [nombreConsultado, obtenerTurnosPorCliente, enriquecerTurno])

  const turnosFiltrados = useMemo(() => {
    if (filtroEstado === 'todos') {
      return turnosCliente
    }

    return turnosCliente.filter((turno) => turno.estado === filtroEstado)
  }, [turnosCliente, filtroEstado])

  function manejarBuscar(evento) {
    evento.preventDefault()
    setNombreConsultado(nombreBusqueda.trim())
    setMensajeFeedback('')
    setFeedbackEsError(false)
    setTurnoEditando(null)
  }

  async function manejarModificar(datos) {
    const resultado = await modificarTurno(turnoEditando.id, datos)
    setMensajeFeedback(resultado.mensaje)
    setFeedbackEsError(!resultado.exito)

    if (resultado.exito) {
      setTurnoEditando(null)
    }
  }

  async function confirmarCancelacion() {
    const resultado = await cancelarTurnoCliente(turnoCancelando.id)
    setMensajeFeedback(resultado.mensaje)
    setFeedbackEsError(!resultado.exito)
    setTurnoCancelando(null)
  }

  return (
    <section className="misTurnos">
      <header className="misTurnosHeader">
        <Link to="/cliente" className="misTurnosVolver">
          ← Volver al área cliente
        </Link>
        <h1>Mis turnos</h1>
        <p>Ingresá tu nombre para ver y gestionar tus reservas.</p>
      </header>

      <form className="misTurnosBusqueda" onSubmit={manejarBuscar}>
        <label htmlFor="nombreCliente">Tu nombre</label>
        <div className="misTurnosBusquedaInput">
          <input
            id="nombreCliente"
            type="search"
            value={nombreBusqueda}
            onChange={(evento) => setNombreBusqueda(evento.target.value)}
            placeholder="Ej: María López"
            required
          />
          <button type="submit">Buscar</button>
        </div>
      </form>

      {mensajeFeedback && (
        <p
          className={`misTurnosFeedback ${
            feedbackEsError ? 'misTurnosFeedbackError' : ''
          }`}
          role="status"
        >
          {mensajeFeedback}
        </p>
      )}

      {nombreConsultado && (
        <TurnoList
          turnos={turnosFiltrados}
          filtroEstado={filtroEstado}
          onChangeFiltroEstado={setFiltroEstado}
          onModificar={setTurnoEditando}
          onCancelar={setTurnoCancelando}
          mostrarAccionesCliente
        />
      )}

      {turnoEditando && (
        <TurnoForm
          turno={turnoEditando}
          onSubmit={manejarModificar}
          onCancelar={() => setTurnoEditando(null)}
        />
      )}

      <Modal
        abierto={Boolean(turnoCancelando)}
        titulo="Cancelar turno"
        mensaje={`¿Confirmás la cancelación del turno del ${turnoCancelando?.dia} a las ${turnoCancelando?.hora}?`}
        onConfirmar={confirmarCancelacion}
        onCancelar={() => setTurnoCancelando(null)}
        textoConfirmar="Sí, cancelar"
        varianteConfirmar="peligro"
      />
    </section>
  )
}
