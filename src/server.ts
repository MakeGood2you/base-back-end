import express, { Application, Request, Response, Router } from 'express'
const router: Router = Router()

import path from 'path'
import cors from 'cors'
import http from 'http'
import helmet from 'helmet'
import compression from 'compression'
import errorHandler from './common/errorHandler'
import config from './config'
import './common/helper'

import  Migrator from './services/Migrator'
import { Sequelize } from 'sequelize'
import sequelize from './common/sequelize'


export default class Server {
  private app: Application = express()
  private readonly api: any
  private server: any

  constructor(api: any) {
    this.api = api

    this.app.use(helmet())
    this.app.use(compression())
    this.app.use(express.json({ limit: '10mb' }))
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cors({ origin: config.ORIGIN, credentials: config.CREDENTIALS }));
  }

  init(): void {
    this.createServer()
    this.createRouter()
  }

  private createServer(): void {
    try {
      this.server = http.createServer(this.app)
      this.checkMigrations()
      this.listenServer()
    } catch (err) {
      console.log(err)
    }
  }

  private createRouter(): void {
    try {
      this.api(router)
      this.app.use(errorHandler)
      this.app.get('/', (request, response) => {
        response.json({ info: 'Node.js, Express, and Postgres API' })
      })
      this.app.use('/', router)
      this.app.use('*', (req: Request, res: Response) => res.status(500).end())
    } catch (err) {
      console.log(err)
    }
  }

  private checkMigrations(): void {
    (async () => {
      try {

        const migrationsPath: string = path.join(__dirname, '../sequelize/migrations')
        const migrator = new Migrator(Sequelize, sequelize, migrationsPath)

        const lastMigration = await migrator.getLastMigration()
        if (Array.isArray(lastMigration)) {
          console.log('Last migration: ', lastMigration)
        }

        let migrations = await migrator.getPendingMigrations()
        if (migrations.length > 0) {
          console.log(`${migrations.length} to go`, migrations)
          migrations = await migrator.migrateUpToDate()
          console.log(`... Done ${migrations.length}`)
        } else {
          console.log('Database is up to date. Migration is not required.')
        }
      } catch (err) {
        console.log(err)
      } finally {
        // Allow server to run, so we can debug it...
      }
    })()
  }

  private closeServer(): void {
    try {
      console.log('Server closed')
      this.server.close()
    } catch {
      process.exit()
    }
  }

  private listenServer(): void {
    this.server.listen(config.PORT, () => {
      console.log('Server running at port ' + config.PORT)
      process.once('SIGINT', this.closeServer).once('SIGTERM', this.closeServer)
    })
  }
}