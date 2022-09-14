import { NextFunction, Request, Response } from 'express'
import { JWT, HttpException } from '../services'
import jwt from 'jsonwebtoken'
import Token from '../interfaces/IToken'

async function authenticatedMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response|void> {
  let bearer = req.headers.authorization

  console.log(bearer)
  if (!bearer || !bearer.startsWith('Bearer ')) {
    return next(new HttpException(401, 'Unauthorised'))
  }
  const accessToken = bearer.split('Bearer ')[1].trim()
  console.log(accessToken)
  try {
    const payload: Token|jwt.JsonWebTokenError = await JWT.verifyToken(
      accessToken,
    )

    if (payload instanceof jwt.JsonWebTokenError) {
      return next(new HttpException(401, 'Unauthorised'))
    }
    //
    // const user = await UserModel.findById(payload.id)
    //   .select('-password')
    //   .exec();
    //
    // if (!user) {
    //     return next(new HttpException(401, 'Unauthorised'));
    // }
    //
    // req.user = user;
    return next()
  } catch (error) {
    return next(new HttpException(401, 'Unauthorised'))
  }
}

export default authenticatedMiddleware