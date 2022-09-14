import { IConfig } from '../interfaces'

const config: IConfig = {
  NODE_ENV : process.env.NODE_ENV,
  PORT : Number(process.env.PORT) || 1000,
  ORIGIN : [`http://localhost:${process.env.ORIGIN}`, `http://localhost:${process.env.PORT || 1000}`],
  CREDENTIALS : process.env.CREDENTIALS === 'true',
  JWT_SECRET : 'makeGood',
  DB_DATABASE : process.env.DB_DATABASE,
  DB_HOST : process.env.DB_HOST,
  DB_USER : process.env.DB_USER,
  DB_PASSWORD : process.env.DB_PASSWORD,
  DB_PORT : Number(process.env.DB_PORT),
  DB_SSL : process.env.DB_SSL === 'true',
  DB_DIALECT : process.env.DB_DIALECT,
}

export default config