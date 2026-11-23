import { open, unlink } from 'node:fs/promises'

export async function adquirirBloqueoInstancia(rutaBloqueo) {
  let archivo
  try {
    archivo = await open(rutaBloqueo, 'wx')
  } catch (error) {
    if (error.code === 'EEXIST') {
      throw new Error(
        `Ya hay una instancia del backend activa o quedó un bloqueo anterior en ${rutaBloqueo}. Verificá que no haya otro proceso activo antes de eliminar el archivo.`
      )
    }

    throw error
  }

  try {
    await archivo.writeFile(`${process.pid}\n`, 'utf8')
    await archivo.sync()
  } catch (error) {
    await archivo.close()
    await unlink(rutaBloqueo)
    throw error
  }

  let liberado = false
  return async function liberarBloqueoInstancia() {
    if (liberado) {
      return
    }

    liberado = true
    await archivo.close()
    await unlink(rutaBloqueo)
  }
}
