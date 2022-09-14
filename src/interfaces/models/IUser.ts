export default interface IUser {
  uuid: string
  first_name: string
  last_name: string
  email: string
  password?: string,
  roles: string[]
}