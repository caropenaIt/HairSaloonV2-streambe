import { AvatarProfesional } from '../ui/AvatarProfesional'
import { Boton } from '../ui/Boton'
import { obtenerNombreCompleto } from '../../utils/validaciones'
import './ProfesionalCard.css'

export function ProfesionalCard({
  profesional,
  modoAdmin = false,
  seleccionado = false,
  onSeleccionar,
  onEditar,
  onEliminar,
}) {
  const nombreCompleto = obtenerNombreCompleto(profesional)

  return (
    <article
      className={`profesionalCard ${seleccionado ? 'profesionalCardSeleccionado' : ''}`}
    >
      <div className="profesionalCardHeader">
        <AvatarProfesional profesional={profesional} tamano="grande" />
        <div>
          <h3 className="profesionalCardNombre">{nombreCompleto}</h3>
          <span className="profesionalCardEspecialidad">
            {profesional.especialidad}
          </span>
        </div>
      </div>

      <p className="profesionalCardDescripcion">{profesional.descripcion}</p>

      <div className="profesionalCardMeta">
        <span>
          Días: {profesional.diasDisponibles.join(', ')}
        </span>
        <span>
          Horarios: {profesional.horariosDisponibles.join(', ')}
        </span>
      </div>

      <div className="profesionalCardAcciones">
        {modoAdmin ? (
          <>
            <Boton variante="secundario" tamano="pequeno" onClick={() => onEditar(profesional)}>
              Editar
            </Boton>
            <Boton variante="peligro" tamano="pequeno" onClick={() => onEliminar(profesional)}>
              Eliminar
            </Boton>
          </>
        ) : (
          <Boton
            variante={seleccionado ? 'primario' : 'secundario'}
            tamano="pequeno"
            onClick={() => onSeleccionar(profesional)}
          >
            {seleccionado ? 'Seleccionado' : 'Elegir'}
          </Boton>
        )}
      </div>
    </article>
  )
}
