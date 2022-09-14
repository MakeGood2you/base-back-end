import { Application, Router } from 'express'
import { asyncWrap } from '../middlewares'
import { Users } from '../controllers'
import { authenticatedMiddleware } from '../middlewares'
const router = Router({mergeParams: true})

module.exports = (app: Application) => {
  app.post('/', asyncWrap(Users.createUser))
  app.post('/login', asyncWrap(Users.login))
  // Authenticated Middleware
  app.use(`/`, asyncWrap(authenticatedMiddleware), router)
  app.get('/', asyncWrap(Users.getUsers))
  app.put('/:id', asyncWrap(Users.updateUser))
  app.delete('/:id', asyncWrap(Users.deleteUser))
  app.post('/change-password', asyncWrap(Users.changePassword))
}