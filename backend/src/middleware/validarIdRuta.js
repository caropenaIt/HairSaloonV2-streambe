export function validarIdRuta(req, res, next) {
  const identificador = Number(req.params.id)

  if (!Number.isSafeInteger(identificador) || identificador <= 0) {
    return res.status(400).json({ mensaje: 'El identificador no es válido.' })
  }

  req.params.id = String(identificador)
  return next()
}
