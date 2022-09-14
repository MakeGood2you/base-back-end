import sequelize from '../common/sequelize'
import { UserService, errorHandler, logger } from '../services'

export default class Users {
  static userService = new UserService(sequelize)

  static async changePassword(req, res) {
    try {
      return Users.userService.changePassword(req, res)
    } catch (error) {
      logger.error('Failed to changed Password to User : ', error, req)
      errorHandler(error, req, res)
    }
  }

  static async login(req, res) {
    try {
      return Users.userService.login(req, res)
    } catch (error) {
      logger.error('Failed to create User : ', error, req)
      errorHandler(error, req, res)
    }
  }

  static async createUser(req, res) {
    try {
      return Users.userService.createUser(req, res)
    } catch (error) {
      logger.error('Failed to create User : ', error, req)
      errorHandler(error, req, res)
    }
  }

  static async getUsers(req, res) {
    try {
      return Users.userService.getUsers(req, res)
    } catch (error) {
      logger.error('Failed to get users: : ', error, req)
      errorHandler(error, req, res)
    }
  }

  static async updateUser(req, res) {
    try {
      return Users.userService.updateUser(req, res)
    } catch (error) {
      logger.error('Failed to update user: : ', error, req)
      errorHandler(error, req, res)
    }
  }

  static async deleteUser(req, res) {
    try {
      return Users.userService.deleteUser(req, res)
    } catch (error) {
      logger.error('Failed to delete user: : ', error, req)
      errorHandler(error, req, res)
    }
  }

}
