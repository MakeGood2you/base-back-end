import jwt from 'jsonwebtoken'
import env from '../config'
import { IToken, IUser } from '../interfaces'

const newUserOnlyToken = (user: IUser) => {
  const token: IToken = { user : { uuid : user.uuid, roles : user.roles } }
  return createToken(token)
}

const createToken = (decryptedToken: IToken) => tokenizeObject(decryptedToken)

const tokenizeObject = <T extends object = any>(decryptedToken: T, addExpiration: boolean = true) => {
  let options = addExpiration ? { expiresIn : '9h' } : undefined
  console.log(env.JWT_SECRET)
  return jwt.sign(decryptedToken, env.JWT_SECRET, options) ///
}

const verifyToken = (encryptedToken: string): Promise<IToken> => {
  return decryptToken(encryptedToken)
}

const Token = (user) => {
  delete user.password
  return { user }
}

const decryptToken = <T extends object = any>(encryptedToken: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    jwt.verify(encryptedToken, env.JWT_SECRET, (err, decryptedToken: T) => {
      if (err) return reject(err)
      resolve(decryptedToken)
    })
  })
}

// const generateAccessToken = (payload, options = {}) => {
//   // @ts-ignore
//   const { expiresIn = '1d' } = options
//   return jwt.sign(payload, environment.jwtAccessTokenSecret, { expiresIn })
// }
//
// const generateRefreshToken = (payload) => jwt.sign(payload, environment.jwtRefreshTokenSecret)
//
// const verifyAccessToken = (accessToken) => jwt.verify(accessToken, environment.jwtAccessTokenSecret)
//
// const verifyRefreshToken = (accessToken) => jwt.verify(accessToken, environment.jwtRefreshTokenSecret)


export default {
  Token, verifyToken,
  tokenizeObject, createToken,
  newUserOnlyToken, decryptToken,
}
