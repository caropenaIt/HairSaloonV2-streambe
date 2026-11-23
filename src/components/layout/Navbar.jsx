import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAppContext } from '../../context/AppContext'
import './Navbar.css'

export function Navbar() {
  const navigate = useNavigate()
  const { usuario, sesionCargada, cerrarSesion } = useAppContext()
  const [mensajeError, setMensajeError] = useState('')

  async function manejarCierreSesion() {
    const resultado = await cerrarSesion()
    if (!resultado.exito) {
      setMensajeError(resultado.mensaje)
      return
    }

    setMensajeError('')
    navigate('/acceso')
  }

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
          {sesionCargada && usuario?.rol === 'cliente' && (
            <NavLink
              to="/cliente"
              className={({ isActive }) =>
                isActive ? 'navbarEnlace navbarEnlaceActivo' : 'navbarEnlace'
              }
            >
              Cliente
            </NavLink>
          )}
          {sesionCargada && usuario?.rol === 'administrador' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? 'navbarEnlace navbarEnlaceActivo' : 'navbarEnlace'
              }
            >
              Admin
            </NavLink>
          )}
          {sesionCargada && !usuario && (
            <NavLink
              to="/acceso"
              className={({ isActive }) =>
                isActive ? 'navbarEnlace navbarEnlaceActivo' : 'navbarEnlace'
              }
            >
              Acceso
            </NavLink>
          )}
          {sesionCargada && usuario && (
            <button
              type="button"
              className="navbarEnlace"
              onClick={manejarCierreSesion}
            >
              Cerrar sesión
            </button>
          )}
        </nav>
        {mensajeError && (
          <p className="navbarError" role="alert">
            {mensajeError}
          </p>
        )}
      </div>
    </header>
  )
}
