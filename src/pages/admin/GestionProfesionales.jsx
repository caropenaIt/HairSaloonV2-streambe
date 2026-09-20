import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProfesionalForm } from '../../components/profesionales/ProfesionalForm'
import { ProfesionalList } from '../../components/profesionales/ProfesionalList'
import { Boton } from '../../components/ui/Boton'
import { Modal } from '../../components/ui/Modal'
import { useProfesionales } from '../../hooks/useProfesionales'
import { obtenerNombreCompleto } from '../../utils/validaciones'
import './GestionProfesionales.css'

export function GestionProfesionales({ esAltaNueva = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    profesionalesFiltrados,
    filtroEspecialidad,
    setFiltroEspecialidad,
    busquedaNombre,
    setBusquedaNombre,
    agregarProfesional,
    editarProfesional,
    eliminarProfesional,
    obtenerProfesionalPorId,
  } = useProfesionales()

  const [profesionalEliminando, setProfesionalEliminando] = useState(null)
  const [mensajeFeedback, setMensajeFeedback] = useState('')

  const esModoNuevo = esAltaNueva
  const esModoEditar = !esAltaNueva && Boolean(id)
  const profesionalEditando = esModoEditar
    ? obtenerProfesionalPorId(Number(id))
    : null

  async function manejarCrear(datos) {
    const resultado = await agregarProfesional(datos)
    setMensajeFeedback(resultado.exito ? resultado.mensaje : `Error: ${resultado.mensaje}`)

    if (resultado.exito) {
      navigate('/admin/profesionales')
    }
  }

  async function manejarEditar(datos) {
    const resultado = await editarProfesional(Number(id), datos)
    setMensajeFeedback(resultado.exito ? resultado.mensaje : `Error: ${resultado.mensaje}`)

    if (resultado.exito) {
      navigate('/admin/profesionales')
    }
  }

  async function manejarEliminar() {
    const resultado = await eliminarProfesional(profesionalEliminando.id)
    setMensajeFeedback(resultado.exito ? resultado.mensaje : `Error: ${resultado.mensaje}`)
    if (resultado.exito) {
      setProfesionalEliminando(null)
    }
  }

  function abrirEdicion(profesional) {
    navigate(`/admin/profesionales/${profesional.id}/editar`)
  }

  if (esModoNuevo || esModoEditar) {
    return (
      <section className="gestionProfesionales">
        <header className="gestionProfesionalesHeader">
          <Link to="/admin/profesionales" className="gestionProfesionalesVolver">
            ← Volver al listado
          </Link>
          <h1>{esModoNuevo ? 'Nuevo profesional' : 'Editar profesional'}</h1>
        </header>

        {esModoEditar && !profesionalEditando ? (
          <p className="gestionProfesionalesError">
            No se encontró el profesional solicitado.
          </p>
        ) : (
          <ProfesionalForm
            profesionalInicial={profesionalEditando}
            onSubmit={esModoNuevo ? manejarCrear : manejarEditar}
            onCancelar={() => navigate('/admin/profesionales')}
          />
        )}
      </section>
    )
  }

  return (
    <section className="gestionProfesionales">
      <header className="gestionProfesionalesHeader">
        <Link to="/admin" className="gestionProfesionalesVolver">
          ← Volver al panel
        </Link>
        <div className="gestionProfesionalesTituloFila">
          <h1>Gestión de profesionales</h1>
          <Boton onClick={() => navigate('/admin/profesionales/nuevo')}>
            + Nuevo profesional
          </Boton>
        </div>
      </header>

      {mensajeFeedback && (
        <p
          className={`gestionProfesionalesFeedback ${
            mensajeFeedback.startsWith('Error:')
              ? 'gestionProfesionalesFeedbackError'
              : ''
          }`}
          role="status"
        >
          {mensajeFeedback}
        </p>
      )}

      <ProfesionalList
        profesionales={profesionalesFiltrados}
        modoAdmin
        filtroEspecialidad={filtroEspecialidad}
        onChangeFiltro={setFiltroEspecialidad}
        busquedaNombre={busquedaNombre}
        onChangeBusqueda={setBusquedaNombre}
        mostrarBusqueda
        onEditar={abrirEdicion}
        onEliminar={setProfesionalEliminando}
      />

      <Modal
        abierto={Boolean(profesionalEliminando)}
        titulo="Eliminar profesional"
        mensaje={`¿Confirmás eliminar a ${profesionalEliminando ? obtenerNombreCompleto(profesionalEliminando) : ''}? Esta acción no se puede deshacer.`}
        onConfirmar={manejarEliminar}
        onCancelar={() => setProfesionalEliminando(null)}
        textoConfirmar="Eliminar"
        varianteConfirmar="peligro"
      />
    </section>
  )
}
