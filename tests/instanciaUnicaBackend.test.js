import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { adquirirBloqueoInstancia } from '../backend/src/services/instanciaUnicaService.js'

describe('bloqueo de instancia del backend', () => {
  it('impide una segunda instancia y permite adquirir el bloqueo al liberarlo', async () => {
    const carpetaTemporal = await mkdtemp(
      path.join(os.tmpdir(), 'hairsaloon-lock-')
    )
    const rutaBloqueo = path.join(carpetaTemporal, 'backend.lock')
    let liberarBloqueo

    try {
      liberarBloqueo = await adquirirBloqueoInstancia(rutaBloqueo)
      await expect(adquirirBloqueoInstancia(rutaBloqueo)).rejects.toThrow(
        'Ya hay una instancia'
      )

      await liberarBloqueo()
      liberarBloqueo = null

      const liberarSegundoBloqueo = await adquirirBloqueoInstancia(rutaBloqueo)
      await liberarSegundoBloqueo()
    } finally {
      if (liberarBloqueo) {
        await liberarBloqueo()
      }
      await rm(carpetaTemporal, { recursive: true, force: true })
    }
  })
})
