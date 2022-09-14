import { Sequelize, Options } from 'sequelize'
import index from '../config'

const SequelizeOptions: Options = {
  database: index.DB_DATABASE,
  host: index.DB_HOST,
  username: index.DB_USER,
  password: index.DB_PASSWORD,
  port: index.DB_PORT,
  ssl: index.DB_SSL,
  dialect: index.DB_DIALECT
}

const sequelize = new Sequelize( SequelizeOptions )

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err.message)
  })

export default sequelize