import { Request, Response } from 'express'
import { cloneObjectPropValues } from './utils'

export default (err: any, req: Request, res: Response) => {

  const status = err.status || 400
  let response = {
    success : false,
    message : (err.message || err),
    error : undefined,
  }

  if (process.env.NODE_ENV === 'production') {
    // Obscure errors in production
    switch (status) {
      case 401:
        response.message = 'Unauthorized request.'
        break
      case 404:
        response.message = 'Requested object not found.'
        break
      default:
        response.message = 'Request failed.'
    }
  } else {
    response.error = cloneObjectPropValues(err)
  }

  return res.status(status).json(response)

}

export class HttpException extends Error {
  public status: number
  public message: string

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.message = message
  }
}