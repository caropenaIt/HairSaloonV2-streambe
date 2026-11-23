import { describe, expect, it } from 'vitest'
import {
  borrarCookieSesion,
  crearCookieSesion,
  leerSesionDeSolicitud,
  revocarSesionDeSolicitud,
} from '../backend/src/services/authService.js'
import { config } from '../backend/src/config/index.js'
import {
  permitirRegistroAdministrador,
  requerirAutenticacion,
} from '../backend/src/middleware/autenticacion.js'
import { crearLimitadorSolicitudes } from '../backend/src/middleware/limitarSolicitudes.js'
import {
  cerrarSesionController,
  iniciarSesionClienteController,
} from '../backend/src/controllers/authController.js'

function crearRespuestaPrueba() {
  return {
    codigo: 200,
    encabezados: {},
    cuerpo: null,
    setHeader(nombre, valor) {
      this.encabezados[nombre] = valor
    },
    status(codigo) {
      this.codigo = codigo
      return this
    },
    json(cuerpo) {
      this.cuerpo = cuerpo
      return this
    },
  }
}

describe('seguridad del backend', () => {
  it('limita solicitudes repetidas de una misma IP', () => {
    const limitar = crearLimitadorSolicitudes({
      maximo: 1,
      ventanaMs: 60000,
    })
    const solicitud = { ip: `prueba-${Date.now()}`, headers: {} }
    const respuesta = crearRespuestaPrueba()
    let solicitudesPermitidas = 0
    const siguiente = () => {
      solicitudesPermitidas += 1
    }

    limitar(solicitud, respuesta, siguiente)
    limitar(solicitud, respuesta, siguiente)

    expect(solicitudesPermitidas).toBe(1)
    expect(respuesta.codigo).toBe(429)
    expect(respuesta.encabezados['Retry-After']).toBeDefined()
  })

  it('mantiene contadores independientes por IP', () => {
    const limitar = crearLimitadorSolicitudes({
      maximo: 1,
      ventanaMs: 60000,
    })
    let solicitudesPermitidas = 0
    const siguiente = () => {
      solicitudesPermitidas += 1
    }

    limitar({ ip: `cliente-a-${Date.now()}` }, crearRespuestaPrueba(), siguiente)
    limitar({ ip: `cliente-b-${Date.now()}` }, crearRespuestaPrueba(), siguiente)

    expect(solicitudesPermitidas).toBe(2)
  })

  it('responde con error de validación si el login no tiene cuerpo', async () => {
    const respuesta = crearRespuestaPrueba()

    await iniciarSesionClienteController({ body: undefined }, respuesta)

    expect(respuesta.codigo).toBe(400)
    expect(respuesta.cuerpo.mensaje).toBeDefined()
  })

  it('cierra e invalida las sesiones de cliente y administrador', () => {
    const usuarios = [
      {
        id: 'cliente-cierre-prueba',
        nombre: 'Cliente de prueba',
        correo: 'cliente-cierre@example.com',
        rol: 'cliente',
      },
      {
        id: 'administrador-cierre-prueba',
        nombre: 'Administración',
        correo: 'admin-cierre@example.com',
        rol: 'administrador',
      },
    ]

    for (const usuario of usuarios) {
      const cookie = crearCookieSesion(usuario).split(';')[0]
      const solicitud = { headers: { cookie } }
      const respuesta = crearRespuestaPrueba()

      expect(leerSesionDeSolicitud(solicitud)?.rol).toBe(usuario.rol)

      cerrarSesionController(solicitud, respuesta)

      expect(respuesta.codigo).toBe(200)
      expect(respuesta.encabezados['Set-Cookie']).toContain('; Max-Age=0; Path=/')
      expect(leerSesionDeSolicitud(solicitud)).toBeNull()
    }
  })

  it('emite y borra cookies compatibles con el frontend separado en producción', () => {
    const cookieSeguroAnterior = config.cookieSeguro
    const cookieSameSiteAnterior = config.cookieSameSite

    try {
      config.cookieSeguro = true
      config.cookieSameSite = 'None'
      const administrador = {
        id: 'administrador-cookie',
        nombre: 'Administración',
        correo: 'admin@example.com',
        rol: 'administrador',
      }

      expect(crearCookieSesion(administrador)).toContain(
        '; HttpOnly; SameSite=None; Secure'
      )
      expect(borrarCookieSesion()).toContain(
        '; HttpOnly; SameSite=None; Secure'
      )
    } finally {
      config.cookieSeguro = cookieSeguroAnterior
      config.cookieSameSite = cookieSameSiteAnterior
    }
  })

  it('solo permite que una sesión administradora continúe por rutas admin', () => {
    const respuestaSinSesion = crearRespuestaPrueba()
    let solicitudSinSesionAutorizada = false

    requerirAutenticacion('administrador')(
      { headers: {} },
      respuestaSinSesion,
      () => {
        solicitudSinSesionAutorizada = true
      }
    )

    expect(solicitudSinSesionAutorizada).toBe(false)
    expect(respuestaSinSesion.codigo).toBe(401)

    const cliente = crearCookieSesion({
      id: 'cliente-prueba',
      nombre: 'Cliente de prueba',
      correo: 'cliente@example.com',
      rol: 'cliente',
    }).split(';')[0]
    const solicitudCliente = { headers: { cookie: cliente } }
    const respuestaCliente = crearRespuestaPrueba()
    let clienteAutorizado = false

    requerirAutenticacion('administrador')(
      solicitudCliente,
      respuestaCliente,
      () => {
        clienteAutorizado = true
      }
    )

    expect(clienteAutorizado).toBe(false)
    expect(respuestaCliente.codigo).toBe(403)

    const administrador = crearCookieSesion({
      id: 'administrador-prueba',
      nombre: 'Administración',
      correo: 'administrador@example.com',
      rol: 'administrador',
    }).split(';')[0]
    const solicitudAdministrador = { headers: { cookie: administrador } }
    const respuestaAdministrador = crearRespuestaPrueba()
    let administradorAutorizado = false

    requerirAutenticacion('administrador')(
      solicitudAdministrador,
      respuestaAdministrador,
      () => {
        administradorAutorizado = true
      }
    )

    expect(administradorAutorizado).toBe(true)
    expect(solicitudAdministrador.usuario.rol).toBe('administrador')
  })

  it('solo permite registrar otra cuenta desde una sesión administradora', () => {
    const respuestaSinSesion = crearRespuestaPrueba()
    let permitidaSinSesion = false

    permitirRegistroAdministrador(
      { headers: {} },
      respuestaSinSesion,
      () => {
        permitidaSinSesion = true
      }
    )

    expect(permitidaSinSesion).toBe(false)
    expect(respuestaSinSesion.codigo).toBe(401)

    const cookieCliente = crearCookieSesion({
      id: 'cliente-registro-admin',
      nombre: 'Cliente',
      correo: 'cliente-registro-admin@example.com',
      rol: 'cliente',
    }).split(';')[0]
    const respuestaCliente = crearRespuestaPrueba()
    let permitidoCliente = false

    permitirRegistroAdministrador(
      { headers: { cookie: cookieCliente } },
      respuestaCliente,
      () => {
        permitidoCliente = true
      }
    )

    expect(permitidoCliente).toBe(false)
    expect(respuestaCliente.codigo).toBe(403)

    const cookieAdministrador = crearCookieSesion({
      id: 'administrador-registro-admin',
      nombre: 'Administración',
      correo: 'admin-registro-admin@example.com',
      rol: 'administrador',
    }).split(';')[0]
    const solicitudAdministrador = { headers: { cookie: cookieAdministrador } }
    let permitidoAdministrador = false

    permitirRegistroAdministrador(
      solicitudAdministrador,
      crearRespuestaPrueba(),
      () => {
        permitidoAdministrador = true
      }
    )

    expect(permitidoAdministrador).toBe(true)
    expect(solicitudAdministrador.usuario.rol).toBe('administrador')
  })
})
