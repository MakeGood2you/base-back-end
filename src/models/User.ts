// User model
import Sequelize, { Model, DataTypes } from 'sequelize'
import sequelize from '../common/sequelize'
import { IUser } from '../interfaces'


export default class User extends Model<IUser> {}

User.init({
  uuid : {
    type : DataTypes.UUID,
    defaultValue : DataTypes.UUIDV4,
    primaryKey : true,
    allowNull : false,
  },
  first_name : {
    type : DataTypes.STRING,
    allowNull : false,
  },
  last_name : {
    type : DataTypes.STRING,
    allowNull : false,
  },
  email : {
    type : DataTypes.STRING,
    allowNull : false,
  },
  password : {
    type : DataTypes.STRING,
    allowNull : false,
  },
  roles : {
    type : DataTypes.ARRAY(DataTypes.STRING),
    allowNull : false,
  },
}, {
  sequelize,
  timestamps : false,
  modelName : 'users',
})

// Security update!
User.prototype.toJSON = function () {
  let values = Object.assign({}, this.get())
  // @ts-ignore
  delete values.password
  return values
}
