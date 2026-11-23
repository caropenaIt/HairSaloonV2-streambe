import cors from 'cors'
import express from 'express'
import { config } from './config/index.js'
import authRoutes from './routes/auth.routes.js'
import disponibilidadRoutes from './routes/disponibilidad.routes.js'
import profesionalesRoutes from './routes/profesionales.routes.js'
import turnosRoutes from './routes/turnos.routes.js'

const app = express()
const origenesPermitidos = new Set(config.origenesPermitidos)
const metodosConEscritura = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

app.set('trust proxy', config.proxyConfiable)
app.use(cors({
  origin: [...origenesPermitidos],
  credentials: true,
}))
app.use(express.json({ limit: '16kb' }))
app.use((req, res, next) => {
  const origen = req.get('origin')

  if (
    metodosConEscritura.has(req.method) &&
    origen &&
    !origenesPermitidos.has(origen)
  ) {
    return res.status(403).json({ mensaje: 'Origen no permitido.' })
  }

  return next()
})

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, servicio: 'HairSaloon API' })
})

app.use('/api/auth', authRoutes)
app.use('/api/disponibilidad', disponibilidadRoutes)
app.use('/api/profesionales', profesionalesRoutes)
app.use('/api/turnos', turnosRoutes)

app.use((error, _req, res, _next) => {
  const estado =
    Number.isInteger(error.status) && error.status >= 400 && error.status <= 599
      ? error.status
      : 500

  if (estado >= 500) {
    console.error(error)
  }

  res.status(estado).json({
    mensaje: estado >= 500 ? 'Error interno del servidor.' : error.message,
  })
})

export default app
