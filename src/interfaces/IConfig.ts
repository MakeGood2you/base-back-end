export default interface IConfig {
  NODE_ENV?: string,
  PORT: number,
  ORIGIN: any,
  CREDENTIALS: boolean,
  JWT_SECRET?:string,
  DB_DATABASE?: string,
  DB_HOST?: string,
  DB_USER?: string,
  DB_PASSWORD?: string,
  DB_PORT: number,
  DB_SSL: boolean,
  DB_DIALECT: any
}
