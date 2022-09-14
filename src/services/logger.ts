import winston from 'winston'
// https://github.com/winstonjs/winston

import { cloneObjectPropValues } from './utils'

const humanFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level.toUpperCase().padEnd(5)}] : ${message} `
  if (metadata) {
    msg += JSON.stringify(metadata, null, 2)
  }
  return msg
})

const errorFormatter = winston.format((info, opts) => {
  if (info.level === 'error') {
    for (const [key, value] of Object.entries(info)) {
      if (value instanceof Error) {
        info[key] = cloneObjectPropValues(value)
        // value.stack = value.stack
      }
    }
  }
  return info
})

const logger = winston.createLogger({
  format : winston.format.combine(
    winston.format.timestamp({
      format : 'YYYY-MM-DD HH:mm:ss.SSS',
    }),
    // winston.format.colorize(), // Makes the level in colors
    winston.format.splat(), // Enable interpolated strings in logger
    winston.format.json(),
    // errorFormatter() // Works the same with and without this formatter
    // winston.format.prettyPrint(),
    // humanFormat
  ),
  transports : [
    new winston.transports.Console({
      level : 'debug',
      handleExceptions : true,
    }),
  ],
  exitOnError : false,
})

export default logger
