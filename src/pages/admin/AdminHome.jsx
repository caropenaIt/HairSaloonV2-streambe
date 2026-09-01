import { Link } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import './AdminHome.css'

export function AdminHome() {
  const { profesionales, turnos } = useAppContext()

  const turnosConfirmados = turnos.filter((turno) => turno.estado === 'confirmado')
  const turnosCancelados = turnos.filter((turno) => turno.estado === 'cancelado')

  return (
    <section className="adminHome">
      <header className="adminHomeHeader">
        <h1>Panel de Administración</h1>
        <p>Gestioná profesionales y turnos del salón.</p>
      </header>

      <div className="adminHomeEstadisticas">
        <article className="adminHomeStat">
          <span className="adminHomeStatNumero">{profesionales.length}</span>
          <span className="adminHomeStatEtiqueta">Profesionales</span>
        </article>
        <article className="adminHomeStat">
          <span className="adminHomeStatNumero">{turnosConfirmados.length}</span>
          <span className="adminHomeStatEtiqueta">Turnos confirmados</span>
        </article>
        <article className="adminHomeStat">
          <span className="adminHomeStatNumero">{turnosCancelados.length}</span>
          <span className="adminHomeStatEtiqueta">Turnos cancelados</span>
        </article>
      </div>

      <div className="adminHomeAcciones">
        <Link to="/admin/profesionales" className="adminHomeTarjeta">
          <h2>Gestión de profesionales</h2>
          <p>Crear, editar, eliminar y filtrar el equipo.</p>
        </Link>
        <Link to="/admin/turnos" className="adminHomeTarjeta">
          <h2>Gestión de turnos</h2>
          <p>Vista global de todas las reservas.</p>
        </Link>
      </div>
    </section>
  )
}
