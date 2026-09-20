export const config = {
  puerto: Number(process.env.PORT) || 3001,
  archivoDatos: new URL('../data/db.json', import.meta.url),
}
