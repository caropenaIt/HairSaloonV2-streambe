export function generarIdProfesional(configuracion) {
  const nuevoId = configuracion.ultimoIdProfesional + 1
  return {
    id: nuevoId,
    configuracion: { ...configuracion, ultimoIdProfesional: nuevoId },
  }
}

export function generarIdTurno(configuracion) {
  const nuevoId = configuracion.ultimoIdTurno + 1
  return {
    id: nuevoId,
    configuracion: { ...configuracion, ultimoIdTurno: nuevoId },
  }
}
