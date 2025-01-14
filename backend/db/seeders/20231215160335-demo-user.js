'use strict';

const bcrypt = require("bcryptjs");
const { Sequelize } = require('sequelize'); // Add this import statement

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}
const { User } = require('../models'); // Import the User model

module.exports = {
  async up (queryInterface, Sequelize) {

    try {
      await User.bulkCreate([
        {
          email: 'demo@user.io',
          firstName: 'Demo',
          lastName: 'User',
          username: 'Demo-lition',
          hashedPassword: bcrypt.hashSync('password'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'user1@user.io',
          firstName: 'Fake',
          lastName: 'User1',
          username: 'FakeUser1',
          hashedPassword: bcrypt.hashSync('password2'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          email: 'user2@user.io',
          firstName: 'Fake',
          lastName: 'User2',
          username: 'FakeUser2',
          hashedPassword: bcrypt.hashSync('password3'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { validate: true });
    } catch (error) {
      console.error("Error seeding users:", error);
    }
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Users';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options.tableName, {
      username: { [Op.in]: ['Demo-lition', 'FakeUser1', 'FakeUser2'] }
    }, {});
  }
};