import { MensajeVacio } from '../ui/MensajeVacio'
import { FiltroEspecialidad } from './FiltroEspecialidad'
import { ProfesionalCard } from './ProfesionalCard'
import './ProfesionalList.css'

export function ProfesionalList({
  profesionales,
  modoAdmin = false,
  filtroEspecialidad,
  onChangeFiltro,
  busquedaNombre = '',
  onChangeBusqueda,
  mostrarBusqueda = false,
  profesionalSeleccionadoId = null,
  onSeleccionar,
  onEditar,
  onEliminar,
}) {
  return (
    <section className="profesionalList">
      <FiltroEspecialidad
        valor={filtroEspecialidad}
        onChange={onChangeFiltro}
        mostrarBusqueda={mostrarBusqueda}
        busquedaNombre={busquedaNombre}
        onChangeBusqueda={onChangeBusqueda}
      />

      {profesionales.length === 0 ? (
        <MensajeVacio
          titulo="No hay profesionales"
          descripcion="Probá cambiar el filtro o agregá un nuevo profesional."
        />
      ) : (
        <div className="profesionalListGrid">
          {profesionales.map((profesional) => (
            <ProfesionalCard
              key={profesional.id}
              profesional={profesional}
              modoAdmin={modoAdmin}
              seleccionado={profesional.id === profesionalSeleccionadoId}
              onSeleccionar={onSeleccionar}
              onEditar={onEditar}
              onEliminar={onEliminar}
            />
          ))}
        </div>
      )}
    </section>
  )
}
