import { DIAS_SEMANA, ESTADOS_TURNO } from '../../utils/constantes'
import { MensajeVacio } from '../ui/MensajeVacio'
import { TurnoCard } from './TurnoCard'
import './TurnoList.css'

export function TurnoList({
  turnos,
  filtroEstado,
  onChangeFiltroEstado,
  filtroProfesional,
  onChangeFiltroProfesional,
  filtroDia,
  onChangeFiltroDia,
  mostrarFiltroDia = false,
  profesionales = [],
  onModificar,
  onCancelar,
  mostrarAccionesCliente = false,
  mostrarAccionesAdmin = false,
}) {
  return (
    <section className="turnoList">
      <div className="turnoListFiltros">
        <div className="turnoListCampo">
          <label htmlFor="filtroEstado">Estado</label>
          <select
            id="filtroEstado"
            value={filtroEstado}
            onChange={(evento) => onChangeFiltroEstado(evento.target.value)}
          >
            <option value="todos">Todos</option>
            {ESTADOS_TURNO.map((estado) => (
              <option key={estado} value={estado}>
                {estado.charAt(0).toUpperCase() + estado.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {mostrarFiltroDia && onChangeFiltroDia && (
          <div className="turnoListCampo">
            <label htmlFor="filtroDia">Día</label>
            <select
              id="filtroDia"
              value={filtroDia}
              onChange={(evento) => onChangeFiltroDia(evento.target.value)}
            >
              <option value="todos">Todos</option>
              {DIAS_SEMANA.map((dia) => (
                <option key={dia} value={dia}>
                  {dia}
                </option>
              ))}
            </select>
          </div>
        )}

        {profesionales.length > 0 && onChangeFiltroProfesional && (
          <div className="turnoListCampo">
            <label htmlFor="filtroProfesional">Profesional</label>
            <select
              id="filtroProfesional"
              value={filtroProfesional}
              onChange={(evento) => onChangeFiltroProfesional(evento.target.value)}
            >
              <option value="todos">Todos</option>
              {profesionales.map((profesional) => (
                <option key={profesional.id} value={profesional.id}>
                  {profesional.nombre} {profesional.apellido}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {turnos.length === 0 ? (
        <MensajeVacio
          titulo="No hay turnos"
          descripcion="No se encontraron turnos con los filtros seleccionados."
          icono="📅"
        />
      ) : (
        <div className="turnoListGrid">
          {turnos.map((turno) => (
            <TurnoCard
              key={turno.id}
              turno={turno}
              onModificar={onModificar}
              onCancelar={onCancelar}
              mostrarAccionesCliente={mostrarAccionesCliente}
              mostrarAccionesAdmin={mostrarAccionesAdmin}
            />
          ))}
        </div>
      )}
    </section>
  )
}
