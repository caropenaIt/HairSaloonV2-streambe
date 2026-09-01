import './MensajeVacio.css'

export function MensajeVacio({ titulo, descripcion, icono = '✂️' }) {
  return (
    <div className="mensajeVacio">
      <span className="mensajeVacioIcono" aria-hidden="true">
        {icono}
      </span>
      <h3 className="mensajeVacioTitulo">{titulo}</h3>
      {descripcion && <p className="mensajeVacioDescripcion">{descripcion}</p>}
    </div>
  )
}
