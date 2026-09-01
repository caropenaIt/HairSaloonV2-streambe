import './Boton.css'

export function Boton({
  children,
  tipo = 'button',
  variante = 'primario',
  tamano = 'mediano',
  deshabilitado = false,
  onClick,
  className = '',
}) {
  const clases = ['boton', `boton${variante.charAt(0).toUpperCase()}${variante.slice(1)}`, `boton${tamano.charAt(0).toUpperCase()}${tamano.slice(1)}`, className]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={tipo}
      className={clases}
      disabled={deshabilitado}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
