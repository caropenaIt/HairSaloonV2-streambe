import { useProfesionales } from '../../hooks/useProfesionales'
import { ProfesionalList } from '../profesionales/ProfesionalList'
import './SelectorProfesional.css'

export function SelectorProfesional({ profesionalSeleccionado, onSeleccionar }) {
  const {
    profesionalesFiltrados,
    filtroEspecialidad,
    setFiltroEspecialidad,
    busquedaNombre,
    setBusquedaNombre,
  } = useProfesionales()

  return (
    <section className="selectorProfesional">
      <h2 className="selectorProfesionalTitulo">Elegí tu profesional</h2>
      <p className="selectorProfesionalDescripcion">
        Seleccioná al estilista que mejor se adapte a lo que necesitás.
      </p>

      <ProfesionalList
        profesionales={profesionalesFiltrados}
        filtroEspecialidad={filtroEspecialidad}
        onChangeFiltro={setFiltroEspecialidad}
        busquedaNombre={busquedaNombre}
        onChangeBusqueda={setBusquedaNombre}
        mostrarBusqueda
        profesionalSeleccionadoId={profesionalSeleccionado?.id ?? null}
        onSeleccionar={onSeleccionar}
      />
    </section>
  )
}
