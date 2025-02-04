'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

const { User, Spot } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    options.tableName = 'Bookings';

    try {
      // First verify that we have users and spots in the database
      const users = await User.findAll();
      const spots = await Spot.findAll();

      if (users.length === 0 || spots.length === 0) {
        console.error('No users or spots found. Cannot seed bookings.');
        return;
      }

      // Proceed with seeding only if we have the required data
      return queryInterface.bulkInsert(options, [
        {
          spotId: spots[0].id,
          userId: users[0].id,
          startDate: new Date('2025-02-01'),
          endDate: new Date('2025-02-05'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          spotId: spots[1].id,
          userId: users[1].id,
          startDate: new Date('2025-02-10'),
          endDate: new Date('2025-02-15'),
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          spotId: spots[2].id,
          userId: users[2].id,
          startDate: new Date('2025-02-20'),
          endDate: new Date('2025-02-25'),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], {});
    } catch (error) {
      console.error('Error seeding bookings:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'Bookings';
    return queryInterface.bulkDelete(options, null, {});
  }
};
