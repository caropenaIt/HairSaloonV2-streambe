import { constants } from 'node:fs'
import { copyFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import app from './app.js'
import { config } from './config/index.js'
import { adquirirBloqueoInstancia } from './services/instanciaUnicaService.js'

async function asegurarArchivoDatos(rutaDatos) {
  const rutaDatosIniciales = fileURLToPath(new URL('./data/db.json', import.meta.url))

  try {
    await copyFile(rutaDatosIniciales, rutaDatos, constants.COPYFILE_EXCL)
  } catch (error) {
    if (error.code !== 'EEXIST') {
      throw error
    }
  }
}

async function iniciarServidor() {
  const rutaDatos = fileURLToPath(config.archivoDatos)
  await mkdir(path.dirname(rutaDatos), { recursive: true })
  const liberarBloqueo = await adquirirBloqueoInstancia(`${rutaDatos}.lock`)
  let servidor
  try {
    await asegurarArchivoDatos(rutaDatos)
    servidor = app.listen(config.puerto)
  } catch (error) {
    await liberarBloqueo()
    throw error
  }

  let cerrando = false

  async function liberarInstancia(error) {
    if (error) {
      console.error(error)
      process.exitCode = 1
    }

    try {
      await liberarBloqueo()
    } catch (errorAlLiberar) {
      console.error(errorAlLiberar)
      process.exitCode = 1
    }
  }

  function cerrarServidor() {
    if (cerrando) {
      return
    }
    cerrando = true
    servidor.close((error) => {
      void liberarInstancia(error)
    })
  }

  function manejarErrorDeInicio(error) {
    void liberarInstancia(error)
  }

  servidor.once('error', manejarErrorDeInicio)
  servidor.once('listening', () => {
    servidor.removeListener('error', manejarErrorDeInicio)
    console.log(`Backend ejecutándose en http://localhost:${config.puerto}`)
  })
  process.once('SIGINT', cerrarServidor)
  process.once('SIGTERM', cerrarServidor)
}

iniciarServidor().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
