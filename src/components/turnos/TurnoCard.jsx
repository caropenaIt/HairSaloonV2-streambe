import { Boton } from '../ui/Boton'
import { obtenerNombreCompleto } from '../../utils/validaciones'
import './TurnoCard.css'

const etiquetasEstado = {
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  completado: 'Completado',
}

export function TurnoCard({
  turno,
  onModificar,
  onCancelar,
  mostrarAccionesCliente = false,
  mostrarAccionesAdmin = false,
}) {
  const profesional = turno.profesional
  const nombreProfesional = profesional
    ? obtenerNombreCompleto(profesional)
    : 'Profesional no disponible'

  return (
    <article className={`turnoCard turnoCard${turno.estado.charAt(0).toUpperCase()}${turno.estado.slice(1)}`}>
      <div className="turnoCardHeader">
        <h3 className="turnoCardCliente">{turno.clienteNombre}</h3>
        <span className={`turnoCardEstado turnoCardEstado${turno.estado.charAt(0).toUpperCase()}${turno.estado.slice(1)}`}>
          {etiquetasEstado[turno.estado]}
        </span>
      </div>

      <dl className="turnoCardDetalle">
        <div>
          <dt>Profesional</dt>
          <dd>{nombreProfesional}</dd>
        </div>
        <div>
          <dt>Especialidad</dt>
          <dd>{turno.especialidad}</dd>
        </div>
        <div>
          <dt>Día</dt>
          <dd>{turno.dia}</dd>
        </div>
        <div>
          <dt>Hora</dt>
          <dd>{turno.hora}</dd>
        </div>
      </dl>

      {(mostrarAccionesCliente || mostrarAccionesAdmin) && turno.estado === 'confirmado' && (
        <div className="turnoCardAcciones">
          {mostrarAccionesCliente && onModificar && (
            <Boton variante="secundario" tamano="pequeno" onClick={() => onModificar(turno)}>
              Modificar
            </Boton>
          )}
          {(mostrarAccionesCliente || mostrarAccionesAdmin) && onCancelar && (
            <Boton variante="peligro" tamano="pequeno" onClick={() => onCancelar(turno)}>
              Cancelar
            </Boton>
          )}
        </div>
      )}
    </article>
  )
}
