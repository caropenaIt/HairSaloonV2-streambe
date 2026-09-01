import { useState } from 'react'
import './AvatarProfesional.css'
import { obtenerNombreCompleto } from '../../utils/validaciones'

export function AvatarProfesional({ profesional, tamano = 'mediano' }) {
  const [errorImagen, setErrorImagen] = useState(false)
  const iniciales = `${profesional.nombre.charAt(0)}${profesional.apellido.charAt(0)}`.toUpperCase()
  const nombreCompleto = obtenerNombreCompleto(profesional)

  if (errorImagen || !profesional.avatarUrl) {
    return (
      <div
        className={`avatarProfesional avatarProfesional${tamano.charAt(0).toUpperCase()}${tamano.slice(1)} avatarProfesionalFallback`}
        aria-label={`Avatar de ${nombreCompleto}`}
      >
        {iniciales}
      </div>
    )
  }

  return (
    <img
      src={profesional.avatarUrl}
      alt={`Foto de ${nombreCompleto}`}
      className={`avatarProfesional avatarProfesional${tamano.charAt(0).toUpperCase()}${tamano.slice(1)}`}
      onError={() => setErrorImagen(true)}
    />
  )
}
