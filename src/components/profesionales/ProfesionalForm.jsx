import { useState } from 'react'
import { DIAS_SEMANA, ESPECIALIDADES } from '../../utils/constantes'
import { validarProfesional } from '../../utils/validaciones'
import { Boton } from '../ui/Boton'
import './ProfesionalForm.css'

const datosVacios = {
  nombre: '',
  apellido: '',
  especialidad: ESPECIALIDADES[0],
  diasDisponibles: [],
  horariosDisponibles: [],
  descripcion: '',
  avatarUrl: '',
}

export function ProfesionalForm({ profesionalInicial = null, onSubmit, onCancelar }) {
  const [datos, setDatos] = useState(profesionalInicial ?? datosVacios)
  const [horarioTemporal, setHorarioTemporal] = useState('')
  const [errores, setErrores] = useState({})

  function actualizarCampo(campo, valor) {
    setDatos((previo) => ({ ...previo, [campo]: valor }))
  }

  function alternarDia(dia) {
    setDatos((previo) => {
      const yaSeleccionado = previo.diasDisponibles.includes(dia)
      return {
        ...previo,
        diasDisponibles: yaSeleccionado
          ? previo.diasDisponibles.filter((d) => d !== dia)
          : [...previo.diasDisponibles, dia],
      }
    })
  }

  function agregarHorario() {
    const horarioNormalizado = horarioTemporal.trim()

    if (!horarioNormalizado) {
      return
    }

    if (datos.horariosDisponibles.includes(horarioNormalizado)) {
      setErrores((previo) => ({
        ...previo,
        horariosDisponibles: 'Ese horario ya fue agregado',
      }))
      return
    }

    setDatos((previo) => ({
      ...previo,
      horariosDisponibles: [...previo.horariosDisponibles, horarioNormalizado],
    }))
    setHorarioTemporal('')
    setErrores((previo) => ({ ...previo, horariosDisponibles: undefined }))
  }

  function quitarHorario(horario) {
    setDatos((previo) => ({
      ...previo,
      horariosDisponibles: previo.horariosDisponibles.filter((h) => h !== horario),
    }))
  }

  function manejarSubmit(evento) {
    evento.preventDefault()
    const erroresValidacion = validarProfesional(datos)
    setErrores(erroresValidacion)

    if (Object.keys(erroresValidacion).length > 0) {
      return
    }

    onSubmit(datos)
  }

  return (
    <form className="profesionalForm" onSubmit={manejarSubmit} noValidate>
      <div className="profesionalFormGrid">
        <div className="profesionalFormCampo">
          <label htmlFor="nombre">Nombre *</label>
          <input
            id="nombre"
            value={datos.nombre}
            onChange={(e) => actualizarCampo('nombre', e.target.value)}
          />
          {errores.nombre && <span className="profesionalFormError">{errores.nombre}</span>}
        </div>

        <div className="profesionalFormCampo">
          <label htmlFor="apellido">Apellido *</label>
          <input
            id="apellido"
            value={datos.apellido}
            onChange={(e) => actualizarCampo('apellido', e.target.value)}
          />
          {errores.apellido && <span className="profesionalFormError">{errores.apellido}</span>}
        </div>
      </div>

      <div className="profesionalFormCampo">
        <label htmlFor="especialidad">Especialidad *</label>
        <select
          id="especialidad"
          value={datos.especialidad}
          onChange={(e) => actualizarCampo('especialidad', e.target.value)}
        >
          {ESPECIALIDADES.map((esp) => (
            <option key={esp} value={esp}>
              {esp}
            </option>
          ))}
        </select>
        {errores.especialidad && (
          <span className="profesionalFormError">{errores.especialidad}</span>
        )}
      </div>

      <div className="profesionalFormCampo">
        <span className="profesionalFormEtiqueta">Días disponibles *</span>
        <div className="profesionalFormDias">
          {DIAS_SEMANA.map((dia) => (
            <label key={dia} className="profesionalFormDia">
              <input
                type="checkbox"
                checked={datos.diasDisponibles.includes(dia)}
                onChange={() => alternarDia(dia)}
              />
              {dia}
            </label>
          ))}
        </div>
        {errores.diasDisponibles && (
          <span className="profesionalFormError">{errores.diasDisponibles}</span>
        )}
      </div>

      <div className="profesionalFormCampo">
        <label htmlFor="horarioTemporal">Horarios disponibles *</label>
        <div className="profesionalFormHorariosInput">
          <input
            id="horarioTemporal"
            placeholder="Ej: 14:30"
            value={horarioTemporal}
            onChange={(e) => setHorarioTemporal(e.target.value)}
          />
          <Boton tipo="button" variante="secundario" tamano="pequeno" onClick={agregarHorario}>
            Agregar
          </Boton>
        </div>
        <ul className="profesionalFormListaHorarios">
          {datos.horariosDisponibles.map((horario) => (
            <li key={horario}>
              <span>{horario}</span>
              <button type="button" onClick={() => quitarHorario(horario)}>
                Quitar
              </button>
            </li>
          ))}
        </ul>
        {errores.horariosDisponibles && (
          <span className="profesionalFormError">{errores.horariosDisponibles}</span>
        )}
      </div>

      <div className="profesionalFormCampo">
        <label htmlFor="descripcion">Descripción *</label>
        <textarea
          id="descripcion"
          rows={3}
          value={datos.descripcion}
          onChange={(e) => actualizarCampo('descripcion', e.target.value)}
        />
        {errores.descripcion && (
          <span className="profesionalFormError">{errores.descripcion}</span>
        )}
      </div>

      <div className="profesionalFormCampo">
        <label htmlFor="avatarUrl">URL del avatar (opcional)</label>
        <input
          id="avatarUrl"
          value={datos.avatarUrl}
          onChange={(e) => actualizarCampo('avatarUrl', e.target.value)}
          placeholder="/avatares/nombre.png"
        />
      </div>

      <div className="profesionalFormAcciones">
        {onCancelar && (
          <Boton tipo="button" variante="secundario" onClick={onCancelar}>
            Cancelar
          </Boton>
        )}
        <Boton tipo="submit">
          {profesionalInicial ? 'Guardar cambios' : 'Crear profesional'}
        </Boton>
      </div>
    </form>
  )
}
