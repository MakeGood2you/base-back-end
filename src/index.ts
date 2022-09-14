import path from 'path'
import * as dotenv from 'dotenv'
const env: string = path.join(__dirname, '../.env')
dotenv.config({ path: env })

import api from './routes'
import Server from './server'

const server = new Server(api)
server.init()

process
  .on('unhandledRejection', async (reason: any, promise: any) => {
    console.log('Unhandled Rejection at Promise:', reason, promise)
  })
  .on('uncaughtException', async (err: any) => {
    console.log('Uncaught Exception thrown:')
    console.log(err)
  })