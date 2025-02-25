'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  
}

module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = "Users";
    await queryInterface.addColumn(options, 'firstName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "User"  // Default value for existing records
    });
    await queryInterface.addColumn(options, 'lastName', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Name'  // Default value for existing records
    });
  },

  async down(queryInterface, Sequelize) {
    options.tableName = "Users";
 return queryInterface.removeColumn(options, 'firstName');
    return queryInterface.removeColumn(options, 'lastName');
  }
};