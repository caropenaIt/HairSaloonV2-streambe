import app from './app.js'
import { config } from './config/index.js'

app.listen(config.puerto, () => {
  console.log(`Backend ejecutándose en http://localhost:${config.puerto}`)
})
