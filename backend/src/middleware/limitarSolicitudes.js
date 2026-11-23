const MAXIMA_CLAVES = 20000

export function crearLimitadorSolicitudes({ maximo, ventanaMs }) {
  const registros = new Map()
  let ultimaLimpieza = 0

  return function limitarSolicitudes(req, res, next) {
    const ahora = Date.now()
    const clave = req.ip || 'origen-desconocido'

    if (ahora - ultimaLimpieza >= 60000) {
      for (const [ip, registro] of registros) {
        if (registro.venceEn <= ahora) {
          registros.delete(ip)
        }
      }
      ultimaLimpieza = ahora
    }

    let registro = registros.get(clave)
    if (!registro || registro.venceEn <= ahora) {
      if (registros.size >= MAXIMA_CLAVES) {
        let venceAntes = Number.POSITIVE_INFINITY
        for (const registroExistente of registros.values()) {
          venceAntes = Math.min(venceAntes, registroExistente.venceEn)
        }
        const segundosRestantes = Math.max(
          1,
          Math.ceil((venceAntes - ahora) / 1000)
        )
        res.setHeader('Retry-After', String(segundosRestantes))
        return res
          .status(429)
          .json({ mensaje: 'Demasiadas solicitudes. Intentá más tarde.' })
      }

      registro = { cantidad: 0, venceEn: ahora + ventanaMs }
      registros.set(clave, registro)
    }

    if (registro.cantidad >= maximo) {
      const segundosRestantes = Math.max(
        1,
        Math.ceil((registro.venceEn - ahora) / 1000)
      )
      res.setHeader('Retry-After', String(segundosRestantes))
      return res
        .status(429)
        .json({ mensaje: 'Demasiadas solicitudes. Intentá más tarde.' })
    }

    registro.cantidad += 1
    return next()
  }
}
