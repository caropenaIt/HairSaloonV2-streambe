import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TurnoList } from '../../components/turnos/TurnoList'
import { Modal } from '../../components/ui/Modal'
import { useAppContext } from '../../context/AppContext'
import { useTurnos } from '../../hooks/useTurnos'
import './GestionTurnos.css'

export function GestionTurnos() {
  const { profesionales } = useAppContext()
  const { turnosEnriquecidos, cancelarTurnoAdmin } = useTurnos()

  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [filtroProfesional, setFiltroProfesional] = useState('todos')
  const [filtroDia, setFiltroDia] = useState('todos')
  const [turnoCancelando, setTurnoCancelando] = useState(null)
  const [mensajeFeedback, setMensajeFeedback] = useState('')
  const [feedbackEsError, setFeedbackEsError] = useState(false)

  const turnosFiltrados = useMemo(() => {
    return turnosEnriquecidos.filter((turno) => {
      const coincideEstado =
        filtroEstado === 'todos' || turno.estado === filtroEstado

      const coincideProfesional =
        filtroProfesional === 'todos' ||
        turno.profesionalId === Number(filtroProfesional)

      const coincideDia = filtroDia === 'todos' || turno.dia === filtroDia

      return coincideEstado && coincideProfesional && coincideDia
    })
  }, [turnosEnriquecidos, filtroEstado, filtroProfesional, filtroDia])

  async function confirmarCancelacion() {
    const resultado = await cancelarTurnoAdmin(turnoCancelando.id)
    setMensajeFeedback(resultado.mensaje)
    setFeedbackEsError(!resultado.exito)
    setTurnoCancelando(null)
  }

  return (
    <section className="gestionTurnos">
      <header className="gestionTurnosHeader">
        <Link to="/admin" className="gestionTurnosVolver">
          ← Volver al panel
        </Link>
        <h1>Gestión de turnos</h1>
        <p>Vista global de todas las reservas del salón.</p>
      </header>

      {mensajeFeedback && (
        <p
          className={`gestionTurnosFeedback ${
            feedbackEsError ? 'gestionTurnosFeedbackError' : ''
          }`}
          role="status"
        >
          {mensajeFeedback}
        </p>
      )}

      <TurnoList
        turnos={turnosFiltrados}
        filtroEstado={filtroEstado}
        onChangeFiltroEstado={setFiltroEstado}
        filtroProfesional={filtroProfesional}
        onChangeFiltroProfesional={setFiltroProfesional}
        filtroDia={filtroDia}
        onChangeFiltroDia={setFiltroDia}
        mostrarFiltroDia
        profesionales={profesionales}
        onCancelar={setTurnoCancelando}
        mostrarAccionesAdmin
      />

      <Modal
        abierto={Boolean(turnoCancelando)}
        titulo="Cancelar turno"
        mensaje={`¿Confirmás cancelar el turno de ${turnoCancelando?.clienteNombre} (${turnoCancelando?.dia} ${turnoCancelando?.hora})?`}
        onConfirmar={confirmarCancelacion}
        onCancelar={() => setTurnoCancelando(null)}
        textoConfirmar="Sí, cancelar"
        varianteConfirmar="peligro"
      />
    </section>
  )
}
