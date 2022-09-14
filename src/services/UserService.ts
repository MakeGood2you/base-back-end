import { User } from '../models'

const bcrypt = require('bcrypt')
import { Request, Response, ErrorRequestHandler } from 'express'
import { body, validationResult } from 'express-validator'
import { DataTypes, Op, Sequelize } from 'sequelize'

import IUser from '../interfaces/models/IUser'
import { JWT, errorHandler, logger } from '../services'
import { IToken } from '../interfaces'


export default class UserService {
  public sequelize: Sequelize

  constructor(sequelize: Sequelize) {
    this.sequelize = sequelize

    // User model

  }

  async changePassword (req, res) {
    try {

      const body: any = req.body
      const authorization = req.headers.authorization
      // TODO: Cleanup why those 2 lines, should be on the request from the middleware...
      const token = authorization.split('Bearer ')[1]?.trim()
      const decryptedToken = await JWT.verifyToken(token)

      const user: any = await User.findOne({ where: { uuid: decryptedToken.user.uuid } })
      if (!user) throw new Error('No user found.')

      const hashedPassword = (user as any).password
      const match = await bcrypt.compare(body.current_password, hashedPassword)
      if (!match) throw new Error('The current password is incorrect.')

      if (!body.new_password && body.new_password.length < 6) {
        throw new Error('The password must contain at least 6 characters.')
      } else if (body.new_password !== body.repeat_password) {
        throw new Error('The passwords do not match.')
      }

      const hashPassword = await bcrypt.hash(body.new_password, 8)
      await User.update({ password: hashPassword }, { where: { uuid: user.uuid } })

      return res.status(200).send({
        success: true,
        message: 'The password has been successfully changed.'
      })

    } catch (err) {
      errorHandler(err, req, res)
    }
  }

  async login(req: Request, res: Response) {
    try {
      let validations = [
        body('email', 'email is mandatory').exists(),
        body('password', 'password is mandatory').exists(),
      ]
      await Promise.all(validations.map(x => x.run(req)))

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors : errors.array() })
      }

      const { email, password } = req.body
      const errResponse = {
        success : false,
        message : 'Invalid email address and password combination',
      }
      const user = await User.findOne({ where : { email : email } })
      if (!user) { // User may have no specific role... } || (user && user.getDataValue('roles').length === 0)) {
        return res.status(400).json(errResponse)
      }

      const hashedPassword = (user as any).password
      const match = await bcrypt.compare(password, hashedPassword)
      if (!match) {
        return res.status(400).json(errResponse)
      }
      const token = JWT.Token(user)
      let accessToken = JWT.createToken(token)
      let refreshToken = JWT.tokenizeObject(token, false)

      return res.status(200).json({
        success : true,
        accessToken,
        refreshToken
      })

    } catch (error) {
      logger.error('Failed to signin: ', error, req)
      errorHandler(error, req, res)
    }
  }

  async createUser(req: Request, res: Response) {
    try {
      let validations = [
        body('first_name', 'First name is mandatory').exists(),
        body('last_name', 'Last name is mandatory').exists(),
        body('email', 'email is mandatory').exists(),
        body('password', 'password is mandatory').exists(),
      ]
      await Promise.all(validations.map(x => x.run(req)))

      const errors: any = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors : errors.array() })
      }

      const userFromRequestBody: IUser = req.body
      const user = await User.findOne({ where : { email : userFromRequestBody.email } })
      if (user) throw new Error('The email address already exists.')

      const hashPassword = await bcrypt.hash(userFromRequestBody.password, 8)

      const newUser: IUser = {
        ...userFromRequestBody,
        password : hashPassword,
      }

      // @ts-ignore
      const userData: any = await User.create(newUser)
      newUser.uuid = userData.getDataValue('uuid')
      newUser.password = ''

      return res.status(201).json({
        success : true,
        message : 'The user has been successfully created.',
        user : newUser,
      })

    } catch (error) {
      logger.error('Failed to create user: : ', error, req)
      errorHandler(error, req, res)
    }
  }

  async getUsers(req: Request, res: Response) {
    try {

      const query: any = req.query

      query.limit = query.limit ? Number(query.limit) : 10
      query.offset = query.offset ? Number(query.offset) : 0

      if (query.page) {
        query.page = query.page > 0 ? Number(query.page) : 1
        query.offset = query.page > 0 ? ((query.page - 1) * query.limit) : 0
      } else {
        query.page = 1
      }

      const { search, offset, limit, sort_by, descending } = query

      ///////////////////////////////////////////////////////////////////////////////

      const options: any = {
        where : {
          ...(search ? {
            [Op.or] : [
              { first_name : { [Op.iLike] : `${search}%` } },
              { last_name : { [Op.iLike] : `${search}%` } },
              { email : { [Op.iLike] : `${search}%` } },
            ],
          } : null),
        },
        ...(sort_by && descending ? {
          order : [[sort_by, descending]],
        } : null),
        offset,
        limit,
      }

      const { rows : users, count } = await User.findAndCountAll(options)

      return res.status(200).json({
        success : true,
        count,
        users,
      })

    } catch (error) {
      logger.error('Failed to get users: : ', error, req)
      errorHandler(error, req, res)
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      let validations = [
        body('uuid', 'uuid is mandatory').exists(),
        body('first_name', 'First name is mandatory').exists(),
        body('last_name', 'Last name is mandatory').exists(),
        body('email', 'email is mandatory').exists(),
        // body('password', 'password is mandatory').exists(), // Optional
        // body('roles', 'Some role is mandatory').exists(),
      ]
      await Promise.all(validations.map(x => x.run(req)))

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors : errors.array() })
      }

      const { id } = req.params
      const userFromRequestBody: IUser = req.body

      let hashPassword: string = ''
      if (userFromRequestBody.password) {
        hashPassword = await bcrypt.hash(userFromRequestBody.password, 8)
      }

      const updatedUser: IUser = {
        // @ts-ignore
        uuid : id,
        ...userFromRequestBody,
        ...(hashPassword ? { password : hashPassword } : null),
      }

      // Check if there is at least one admin user left after the update
      if (!(await this.anyOtherAdmin(id)) && !updatedUser.roles.includes('admin')) {
        return res.status(409).json({
          success : false,
          message : 'You are the last admin in town. Do not lock yourself out.',
        })
      }

      const { uuid, ...updatedUserWithoutUuid } = updatedUser

      let updateResult = await User.update(updatedUserWithoutUuid, { where : { uuid : id } })

      // updateResult is expected to be an array with length 1,
      // where 0 in this cell indicates failure (invalid uuid)
      if (updateResult[0] === 0) throw new Error('User could not be found.')

      updatedUser.password = ''

      return res.status(200).json({
        success : true,
        message : 'The user has been successfully updated.',
        user : updatedUser,
      })

    } catch (error) {
      logger.error('Failed to update user: : ', error, req)
      errorHandler(error, req, res)
    }
  }

  async deleteUser(req: Request, res: Response) {
    try {
      let validations = [
        body('id', 'id is mandatory').exists(),
      ]
      await Promise.all(validations.map(x => x.run(req)))

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors : errors.array() })
      }

      const { id } = req.params
      // Check if there is at least one admin user left after the deletion
      if (!await this.anyOtherAdmin(id)) {
        return res.status(409).json({
          success : false,
          message : 'Can not delete the last admin in town.',
        })
      }

      await User.destroy({ where : { uuid : id } })

      return res.status(200).json({
        success : true,
        message : 'The user has been successfully deleted.',
      })
    } catch (error) {
      logger.error('Failed to delete user: : ', error, req)
      errorHandler(error, req, res)
    }
  }

  private async anyOtherAdmin(id: any) {
    const { count } = await User.findAndCountAll(
      {
        where : {
          [Op.and] : [
            { uuid : { [Op.not] : id } },
            { roles : { [Op.contains] : ['admin'] } },
          ],
        },
      },
    )
    return count > 0
  }
}
