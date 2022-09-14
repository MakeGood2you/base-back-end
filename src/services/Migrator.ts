import Umzug from 'umzug'
import logger from './logger'

class Migrator {
  private umzug: any

  constructor(Sequelize: any, sequelize: any, migrations: string) {
    logger.info(`Migrations base url : ${migrations}`)
    this.umzug = new Umzug({
      migrations : {
        path : migrations,
        pattern : /\.js$/,
        params : [sequelize.getQueryInterface(), Sequelize, sequelize],
      },
      storage : 'sequelize',
      storageOptions : { sequelize },
    })
  }

  async getLastMigration() {
    const migrations = await this.umzug.executed()
    const numMigrations = migrations.length
    return numMigrations > 0 ? migrations[numMigrations - 1] : null
  }

  async getPendingMigrations() {
    return await this.umzug.pending()
  }

  async migrateUpToDate() {
    return await this.umzug.up()
  }
}

export default Migrator