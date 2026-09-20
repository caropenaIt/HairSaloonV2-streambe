import cors from 'cors'
import express from 'express'
import profesionalesRoutes from './routes/profesionales.routes.js'
import turnosRoutes from './routes/turnos.routes.js'

const app = express()

app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}))
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, servicio: 'HairSaloon API' })
})

app.use('/api/profesionales', profesionalesRoutes)
app.use('/api/turnos', turnosRoutes)

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({
    mensaje: 'Error interno del servidor',
  })
})

export default app
