import { Request, Response, NextFunction } from 'express'
import config from '../config'

export default (err: any, req?: Request, res?: Response, next?: NextFunction) => {
  try {

    if (res) {
      return res.status(400).json({
        success: false,
        ...(config.NODE_ENV === 'development' ? {
          message: err.message || err
        } : {
          message: 'An error occurred, please try again.'
        })
      })
    }

    console.log(err)

  } catch (err) {
    console.log(err)
  }
}