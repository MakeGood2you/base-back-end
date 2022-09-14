'use strict';

const { DataTypes } = require('sequelize');
module.exports = {
    up: async (queryInterface, Sequelize) => {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable("users", {
            uuid: {
                type: Sequelize.UUID,
                primaryKey: true
            },
            first_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            last_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            roles: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false,
            },
            updatedAt: Sequelize.DATE,
            createdAt: Sequelize.DATE
        }, {})
    },
    down: async (queryInterface, Sequelize) => {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        const schema = queryInterface.sequelize.options.schema || 'public'

        await queryInterface.sequelize.query(
            `DROP POLICY IF EXISTS users_tenant ON ${schema}.users`)
        await queryInterface.dropTable("users")
    }
};