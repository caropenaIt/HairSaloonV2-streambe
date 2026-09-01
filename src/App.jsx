import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { AdminHome } from './pages/admin/AdminHome'
import { GestionProfesionales } from './pages/admin/GestionProfesionales'
import { GestionTurnos } from './pages/admin/GestionTurnos'
import { ClienteHome } from './pages/cliente/ClienteHome'
import { MisTurnos } from './pages/cliente/MisTurnos'
import { ReservarTurno } from './pages/cliente/ReservarTurno'
import { Home } from './pages/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="cliente" element={<ClienteHome />} />
        <Route path="cliente/reservar" element={<ReservarTurno />} />
        <Route path="cliente/mis-turnos" element={<MisTurnos />} />
        <Route path="admin" element={<AdminHome />} />
        <Route path="admin/profesionales" element={<GestionProfesionales />} />
        <Route path="admin/profesionales/nuevo" element={<GestionProfesionales />} />
        <Route
          path="admin/profesionales/:id/editar"
          element={<GestionProfesionales />}
        />
        <Route path="admin/turnos" element={<GestionTurnos />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
