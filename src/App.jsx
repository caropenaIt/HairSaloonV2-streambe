import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Acceso } from './pages/Acceso'
import { useAppContext } from './context/AppContext'
import { Layout } from './components/layout/Layout'
import { AdminHome } from './pages/admin/AdminHome'
import { GestionProfesionales } from './pages/admin/GestionProfesionales'
import { GestionTurnos } from './pages/admin/GestionTurnos'
import { ClienteHome } from './pages/cliente/ClienteHome'
import { MisTurnos } from './pages/cliente/MisTurnos'
import { ReservarTurno } from './pages/cliente/ReservarTurno'
import { Home } from './pages/Home'

function RutaProtegida({ rol }) {
  const { usuario, sesionCargada } = useAppContext()

  if (!sesionCargada) {
    return <p role="status">Cargando sesión...</p>
  }

  if (!usuario) {
    return (
      <Navigate
        to={rol === 'administrador' ? '/admin/acceso' : '/acceso'}
        replace
      />
    )
  }

  if (usuario.rol !== rol) {
    return (
      <Navigate
        to={usuario.rol === 'administrador' ? '/admin' : '/cliente'}
        replace
      />
    )
  }

  return <Outlet />
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="acceso" element={<Acceso />} />
        <Route path="admin/acceso" element={<Acceso esAdministrador />} />
        <Route element={<RutaProtegida rol="cliente" />}>
          <Route path="cliente" element={<ClienteHome />} />
          <Route path="cliente/reservar" element={<ReservarTurno />} />
          <Route path="cliente/mis-turnos" element={<MisTurnos />} />
        </Route>
        <Route element={<RutaProtegida rol="administrador" />}>
          <Route
            path="admin/acceso/registro"
            element={<Acceso esAdministrador esRegistroAdministrador />}
          />
          <Route path="admin" element={<AdminHome />} />
          <Route path="admin/profesionales" element={<GestionProfesionales />} />
          <Route
            path="admin/profesionales/nuevo"
            element={<GestionProfesionales esAltaNueva />}
          />
          <Route
            path="admin/profesionales/:id/editar"
            element={<GestionProfesionales />}
          />
          <Route path="admin/turnos" element={<GestionTurnos />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
