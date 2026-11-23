import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Boton } from '../components/ui/Boton'
import { useAppContext } from '../context/AppContext'
import './Acceso.css'

export function Acceso({
  esAdministrador = false,
  esRegistroAdministrador = false,
}) {
  const navigate = useNavigate()
  const {
    iniciarSesion,
    iniciarSesionAdministrador,
    registrarAdministrador,
    registrarCliente,
    sesionCargada,
    usuario,
  } = useAppContext()
  const [modoRegistro, setModoRegistro] = useState(false)
  const [nombre, setNombre] = useState('')
  const [correo, setCorreo] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mensajeError, setMensajeError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (sesionCargada && usuario && !esRegistroAdministrador) {
    return (
      <Navigate
        to={usuario.rol === 'administrador' ? '/admin' : '/cliente'}
        replace
      />
    )
  }

  async function manejarEnvio(evento) {
    evento.preventDefault()
    setMensajeError('')
    setEnviando(true)

    const resultado = esRegistroAdministrador
      ? await registrarAdministrador({
          nombre,
          correo,
          contrasena,
        })
      : esAdministrador
        ? await iniciarSesionAdministrador({ correo, contrasena })
        : modoRegistro
          ? await registrarCliente({ nombre, correo, contrasena })
          : await iniciarSesion({ correo, contrasena })

    setEnviando(false)
    if (!resultado.exito) {
      setMensajeError(resultado.mensaje)
      return
    }

    navigate(esAdministrador ? '/admin' : '/cliente', { replace: true })
  }

  function alternarModo() {
    setMensajeError('')
    setModoRegistro((modoActual) => !modoActual)
  }

  return (
    <section className="acceso">
      <header className="accesoHeader">
        <h1>
          {esRegistroAdministrador
            ? 'Crear cuenta de administrador'
            : esAdministrador
              ? 'Acceso de administración'
            : modoRegistro
              ? 'Crear cuenta de cliente'
              : 'Acceso de clientes'}
        </h1>
        <p>
          {esRegistroAdministrador
            ? 'Completá los datos para crear una cuenta administradora.'
            : esAdministrador
              ? 'Ingresá con las credenciales de tu cuenta de administración.'
            : modoRegistro
              ? 'Registrate como cliente para reservar y gestionar tus turnos.'
              : 'Ingresá con las credenciales de tu cuenta de cliente.'}
        </p>
      </header>

      <form className="accesoFormulario" onSubmit={manejarEnvio}>
        {(modoRegistro && !esAdministrador || esRegistroAdministrador) && (
          <div className="accesoCampo">
            <label htmlFor="accesoNombre">Nombre completo</label>
            <input
              id="accesoNombre"
              type="text"
              value={nombre}
              onChange={(evento) => setNombre(evento.target.value)}
              autoComplete="name"
              maxLength={100}
              required
            />
          </div>
        )}

        <div className="accesoCampo">
          <label htmlFor="accesoCorreo">Correo electrónico</label>
          <input
            id="accesoCorreo"
            type="email"
            value={correo}
            onChange={(evento) => setCorreo(evento.target.value)}
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>

        <div className="accesoCampo">
          <label htmlFor="accesoContrasena">Contraseña</label>
          <input
            id="accesoContrasena"
            type="password"
            value={contrasena}
            onChange={(evento) => setContrasena(evento.target.value)}
            autoComplete={
              (modoRegistro && !esAdministrador) || esRegistroAdministrador
                ? 'new-password'
                : 'current-password'
            }
            minLength={
              (modoRegistro && !esAdministrador) || esRegistroAdministrador
                ? 12
                : undefined
            }
            maxLength={128}
            required
          />
          {(modoRegistro && !esAdministrador || esRegistroAdministrador) && (
            <span className="accesoAyuda">Usá al menos 12 caracteres.</span>
          )}
        </div>

        {mensajeError && (
          <p className="accesoError" role="alert">
            {mensajeError}
          </p>
        )}

        <Boton tipo="submit" deshabilitado={enviando || !sesionCargada}>
          {enviando
            ? 'Procesando...'
            : !sesionCargada
              ? 'Cargando sesión...'
              : esRegistroAdministrador
                ? 'Crear cuenta de administrador'
                : esAdministrador
                  ? 'Ingresar como administrador'
                  : modoRegistro
                    ? 'Crear cuenta de cliente'
                    : 'Ingresar como cliente'}
        </Boton>
      </form>

      {esRegistroAdministrador ? (
        <Link className="accesoAlternar" to="/admin/acceso">
          Volver al acceso de administración
        </Link>
      ) : esAdministrador ? (
        <Link className="accesoAlternar" to="/admin/acceso/registro">
          Crear cuenta de administrador
        </Link>
      ) : (
        <>
          <button
            className="accesoAlternar"
            type="button"
            onClick={alternarModo}
          >
            {modoRegistro
              ? 'Ya tengo una cuenta'
              : 'Crear una cuenta de cliente'}
          </button>
          {!modoRegistro && (
            <Link className="accesoAlternar" to="/admin/acceso">
              Acceso independiente para administración
            </Link>
          )}
        </>
      )}
    </section>
  )
}
