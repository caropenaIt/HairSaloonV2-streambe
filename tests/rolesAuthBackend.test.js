import { scryptSync } from 'node:crypto'
import { afterEach, describe, expect, it, vi } from 'vitest'

const correoAdministrador = 'admin@example.com'
const contrasenaAdministrador = 'ContrasenaAdministrativaSegura'
const correoCliente = 'cliente@example.com'
const contrasenaCliente = 'ContrasenaClienteSegura'
const salCliente = 'sal-de-prueba'
const clientePrueba = {
  id: 'cliente-prueba',
  nombre: 'Cliente de prueba',
  correo: correoCliente,
  passwordSalt: salCliente,
  passwordHash: scryptSync(contrasenaCliente, salCliente, 64).toString('hex'),
  rol: 'cliente',
}

async function cargarServicioAuth(cliente = clientePrueba, administrador = null) {
  vi.resetModules()
  vi.doMock('../backend/src/config/index.js', () => ({
    config: {
      administradorCorreo: correoAdministrador,
      administradorContrasena: contrasenaAdministrador,
      secretoSesion: 'secreto-de-prueba',
    },
  }))

  const registrarCliente = vi.fn(async (datos) => ({
    ...datos,
    id: 'cliente-nuevo',
    rol: 'cliente',
  }))
  const registrarAdministrador = vi.fn(async (datos) => ({
    ...datos,
    id: 'administrador-nuevo',
    rol: 'administrador',
  }))
  const obtenerClientePorCorreo = vi.fn(async (correo) =>
    correo === cliente?.correo ? cliente : null
  )
  const obtenerAdministradorPorCorreo = vi.fn(async (correo) =>
    correo === administrador?.correo ? administrador : null
  )

  vi.doMock('../backend/src/services/agendaService.js', () => ({
    obtenerAdministradorPorCorreo,
    registrarCliente,
    registrarAdministrador,
    obtenerClientePorCorreo,
  }))

  const servicio = await import('../backend/src/services/authService.js')
  return {
    ...servicio,
    registrarCliente,
    registrarAdministrador,
    obtenerClientePorCorreo,
    obtenerAdministradorPorCorreo,
  }
}

afterEach(() => {
  vi.doUnmock('../backend/src/config/index.js')
  vi.doUnmock('../backend/src/services/agendaService.js')
  vi.resetModules()
})

describe('separación de roles de autenticación', () => {
  it('no autentica como cliente un correo reservado a administración', async () => {
    const { iniciarSesionCliente, obtenerClientePorCorreo } =
      await cargarServicioAuth({
        ...clientePrueba,
        correo: correoAdministrador,
        passwordHash: scryptSync(
          contrasenaCliente,
          salCliente,
          64
        ).toString('hex'),
      })

    await expect(
      iniciarSesionCliente(correoAdministrador, contrasenaCliente)
    ).rejects.toMatchObject({ status: 401 })
    expect(obtenerClientePorCorreo).not.toHaveBeenCalled()
  })

  it('autentica al administrador únicamente en el flujo administrativo', async () => {
    const { iniciarSesionAdministrador, iniciarSesionCliente } =
      await cargarServicioAuth({
        ...clientePrueba,
        correo: correoAdministrador,
        passwordHash: scryptSync(
          contrasenaCliente,
          salCliente,
          64
        ).toString('hex'),
      })

    await expect(
      iniciarSesionAdministrador(correoAdministrador, contrasenaAdministrador)
    ).resolves.toMatchObject({ rol: 'administrador' })
    await expect(
      iniciarSesionCliente(correoAdministrador, contrasenaAdministrador)
    ).rejects.toMatchObject({ status: 401 })
    await expect(
      iniciarSesionAdministrador(correoCliente, contrasenaCliente)
    ).rejects.toMatchObject({ status: 401 })
  })

  it('autentica las cuentas cliente únicamente con el acceso de cliente', async () => {
    const { iniciarSesionCliente, iniciarSesionAdministrador } =
      await cargarServicioAuth()

    await expect(
      iniciarSesionCliente(correoCliente, contrasenaCliente)
    ).resolves.toMatchObject({ rol: 'cliente' })
    await expect(
      iniciarSesionAdministrador(correoCliente, contrasenaCliente)
    ).rejects.toMatchObject({ status: 401 })
  })

  it('crea una cuenta administradora con nombre, correo y contraseña', async () => {
    const { registrarCuentaAdministrador, registrarAdministrador } =
      await cargarServicioAuth()

    await expect(
      registrarCuentaAdministrador({
        nombre: 'Administradora nueva',
        correo: 'nueva-admin@example.com',
        contrasena: 'ContrasenaAdministrativaNueva',
      })
    ).resolves.toMatchObject({
      correo: 'nueva-admin@example.com',
      rol: 'administrador',
    })
    expect(registrarAdministrador).toHaveBeenCalledTimes(1)
  })

  it('registra varias cuentas administrativas con la misma operación normal', async () => {
    const { registrarCuentaAdministrador, registrarAdministrador } =
      await cargarServicioAuth()

    await registrarCuentaAdministrador({
      nombre: 'Administradora uno',
      correo: 'admin-uno@example.com',
      contrasena: 'ContrasenaAdministrativaNueva',
    })
    await registrarCuentaAdministrador({
      nombre: 'Administradora dos',
      correo: 'admin-dos@example.com',
      contrasena: 'OtraContrasenaAdministrativaNueva',
    })

    expect(registrarAdministrador).toHaveBeenCalledTimes(2)
  })

  it('permite iniciar sesión a un administrador registrado en el JSON', async () => {
    const contrasenaAdminRegistrado = 'OtraContrasenaAdministrativaSegura'
    const salAdminRegistrado = 'sal-admin-prueba'
    const administradorRegistrado = {
      id: 'administrador-registrado',
      nombre: 'Administradora registrada',
      correo: 'registrada@example.com',
      passwordSalt: salAdminRegistrado,
      passwordHash: scryptSync(
        contrasenaAdminRegistrado,
        salAdminRegistrado,
        64
      ).toString('hex'),
      rol: 'administrador',
    }
    const { iniciarSesionAdministrador, obtenerAdministradorPorCorreo } =
      await cargarServicioAuth(clientePrueba, administradorRegistrado)

    await expect(
      iniciarSesionAdministrador(
        administradorRegistrado.correo,
        contrasenaAdminRegistrado
      )
    ).resolves.toMatchObject({ rol: 'administrador' })
    expect(obtenerAdministradorPorCorreo).toHaveBeenCalledWith(
      administradorRegistrado.correo
    )
  })

  it('no eleva una cuenta cliente por el rol guardado en el JSON', async () => {
    const clienteConRolIncorrecto = {
      ...clientePrueba,
      rol: 'administrador',
    }
    const { iniciarSesionCliente } =
      await cargarServicioAuth(clienteConRolIncorrecto)

    await expect(
      iniciarSesionCliente(correoCliente, contrasenaCliente)
    ).resolves.toMatchObject({ rol: 'cliente' })
  })

  it('impide registrar clientes con el correo reservado al administrador', async () => {
    const { registrarCuentaCliente, registrarCliente } =
      await cargarServicioAuth()

    await expect(
      registrarCuentaCliente({
        nombre: 'Cuenta duplicada',
        correo: correoAdministrador.toUpperCase(),
        contrasena: 'ContrasenaNuevaSegura',
      })
    ).rejects.toMatchObject({ status: 409 })
    expect(registrarCliente).not.toHaveBeenCalled()
  })
})
