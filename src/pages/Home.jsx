import { Link } from 'react-router-dom'
import { Boton } from '../components/ui/Boton'
import './Home.css'

export function Home() {
  return (
    <section className="home">
      <div className="homeHero">
        <span className="homeEtiqueta">Unisex Hair Saloon 2.0</span>
        <h1 className="homeTitulo">Tu peluquería, tus turnos, a tu manera</h1>
        <p className="homeDescripcion">
          Reservá citas con nuestros profesionales o administrá el equipo y la
          agenda del salón desde un solo lugar.
        </p>
        <div className="homeAcciones">
          <Link to="/cliente">
            <Boton tamano="grande">Soy Cliente</Boton>
          </Link>
          <Link to="/admin">
            <Boton variante="secundario" tamano="grande">
              Soy Administrador
            </Boton>
          </Link>
        </div>
      </div>

      <div className="homeTarjetas">
        <article className="homeTarjeta">
          <h2>Reservá tu turno</h2>
          <p>Elegí profesional, día y hora en pocos pasos.</p>
          <Link to="/cliente/reservar" className="homeTarjetaLink">
            Reservar ahora →
          </Link>
        </article>
        <article className="homeTarjeta">
          <h2>Gestioná profesionales</h2>
          <p>Alta, edición y baja del equipo del salón.</p>
          <Link to="/admin/profesionales" className="homeTarjetaLink">
            Ir a gestión →
          </Link>
        </article>
        <article className="homeTarjeta">
          <h2>Control de turnos</h2>
          <p>Vista global de todas las reservas del salón.</p>
          <Link to="/admin/turnos" className="homeTarjetaLink">
            Ver turnos →
          </Link>
        </article>
      </div>
    </section>
  )
}
