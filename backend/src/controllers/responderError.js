export function responderError(res, error, estadoAlternativo = 400) {
  const estado =
    Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
      ? error.status
      : error.code
        ? 500
        : estadoAlternativo

  if (estado >= 500) {
    console.error(error)
    return res.status(estado).json({ mensaje: 'Error interno del servidor.' })
  }

  return res.status(estado).json({ mensaje: error.message })
}
