import { NavLink } from 'react-router-dom'
import './Navbar.css'

export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbarContenedor">
        <NavLink to="/" className="navbarMarca">
          <span className="navbarMarcaIcono" aria-hidden="true">
            ✂️
          </span>
          Unisex Hair Saloon
        </NavLink>

        <nav className="navbarEnlaces" aria-label="Navegación principal">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? 'navbarEnlace navbarEnlaceActivo' : 'navbarEnlace'
            }
            end
          >
            Inicio
          </NavLink>
          <NavLink
            to="/cliente"
            className={({ isActive }) =>
              isActive ? 'navbarEnlace navbarEnlaceActivo' : 'navbarEnlace'
            }
          >
            Cliente
          </NavLink>
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive ? 'navbarEnlace navbarEnlaceActivo' : 'navbarEnlace'
            }
          >
            Admin
          </NavLink>
        </nav>
      </div>
    </header>
  )
}
