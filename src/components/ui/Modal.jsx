import { useEffect } from 'react'
import { Boton } from './Boton'
import './Modal.css'

export function Modal({
  titulo,
  mensaje,
  abierto,
  onConfirmar,
  onCancelar,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  varianteConfirmar = 'primario',
}) {
  useEffect(() => {
    if (!abierto) {
      return undefined
    }

    function manejarTecla(evento) {
      if (evento.key === 'Escape') {
        onCancelar()
      }
    }

    document.addEventListener('keydown', manejarTecla)
    return () => document.removeEventListener('keydown', manejarTecla)
  }, [abierto, onCancelar])

  if (!abierto) {
    return null
  }

  return (
    <div className="modalOverlay" onClick={onCancelar} role="presentation">
      <div
        className="modalContenido"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitulo"
        onClick={(evento) => evento.stopPropagation()}
      >
        <h2 id="modalTitulo" className="modalTitulo">
          {titulo}
        </h2>
        <p className="modalMensaje">{mensaje}</p>
        <div className="modalAcciones">
          <Boton variante="secundario" onClick={onCancelar}>
            {textoCancelar}
          </Boton>
          <Boton variante={varianteConfirmar} onClick={onConfirmar}>
            {textoConfirmar}
          </Boton>
        </div>
      </div>
    </div>
  )
}
