import { ESPECIALIDADES, FILTRO_TODAS } from '../../utils/constantes'
import './FiltroEspecialidad.css'

export function FiltroEspecialidad({
  valor,
  onChange,
  mostrarBusqueda = false,
  busquedaNombre = '',
  onChangeBusqueda,
}) {
  const opciones = [FILTRO_TODAS, ...ESPECIALIDADES]

  return (
    <div className="filtroEspecialidad">
      {mostrarBusqueda && (
        <div className="filtroCampo">
          <label htmlFor="busquedaNombre" className="filtroEtiqueta">
            Buscar por nombre
          </label>
          <input
            id="busquedaNombre"
            type="search"
            className="filtroInput"
            placeholder="Ej: Marta, Juan..."
            value={busquedaNombre}
            onChange={(evento) => onChangeBusqueda(evento.target.value)}
          />
        </div>
      )}

      <div className="filtroCampo">
        <label htmlFor="filtroEspecialidad" className="filtroEtiqueta">
          Especialidad
        </label>
        <select
          id="filtroEspecialidad"
          className="filtroSelect"
          value={valor}
          onChange={(evento) => onChange(evento.target.value)}
        >
          {opciones.map((opcion) => (
            <option key={opcion} value={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
