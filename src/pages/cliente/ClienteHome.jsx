import { Link } from 'react-router-dom'
import './ClienteHome.css'

export function ClienteHome() {
  return (
    <section className="clienteHome">
      <header className="clienteHomeHeader">
        <h1>Área de Cliente</h1>
        <p>Reservá un turno nuevo o gestioná tus citas existentes.</p>
      </header>

      <div className="clienteHomeAcciones">
        <Link to="/cliente/reservar" className="clienteHomeTarjeta">
          <span className="clienteHomeIcono" aria-hidden="true">
            📅
          </span>
          <h2>Reservar turno</h2>
          <p>Elegí profesional, día y hora para tu próxima visita.</p>
        </Link>

        <Link to="/cliente/mis-turnos" className="clienteHomeTarjeta">
          <span className="clienteHomeIcono" aria-hidden="true">
            📋
          </span>
          <h2>Mis turnos</h2>
          <p>Consultá, modificá o cancelá tus turnos por nombre.</p>
        </Link>
      </div>
    </section>
  )
}
