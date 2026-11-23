export function capturarErroresAsync(controlador) {
  return (req, res, next) => {
    Promise.resolve(controlador(req, res, next)).catch(next)
  }
}
