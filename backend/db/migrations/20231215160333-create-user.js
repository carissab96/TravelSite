'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(256),
        allowNull: false,
        unique: true
      },
      hashedPassword: {
        type: Sequelize.STRING.BINARY,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    }, options);
  },

  async down(queryInterface, Sequelize) {
    const schema = process.env.NODE_ENV === 'production' ? process.env.SCHEMA : '';
    const prefix = schema ? `"${schema}".` : '';

    // Drop all dependent tables first
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS ${prefix}"ReviewImages" CASCADE;`);
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS ${prefix}"SpotImages" CASCADE;`);
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS ${prefix}"Reviews" CASCADE;`);
    await queryInterface.sequelize.query(`DROP TABLE IF EXISTS ${prefix}"Spots" CASCADE;`);
    
    // Finally drop Users table
    options.tableName = "Users";
    return queryInterface.dropTable(options);
  }
};