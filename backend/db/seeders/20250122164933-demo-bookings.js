'use strict';
const { Booking, User, Spot } = require('../models');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      const users = await User.findAll();
      const spots = await Spot.findAll();

      if (users.length === 0 || spots.length === 0) {
        console.error('No users or spots found. Cannot seed bookings.');
        return;
      }

      // Only create bookings if we have at least one spot and two users
      if (spots.length > 0 && users.length > 1) {
        await Booking.bulkCreate([
          {
            spotId: spots[0].id,
            userId: users[1].id, // Use second user to book first spot
            startDate: new Date('2025-02-01'),
            endDate: new Date('2025-02-05'),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ], { validate: true });

        // Only add second booking if we have at least two spots
        if (spots.length > 1) {
          await Booking.bulkCreate([
            {
              spotId: spots[1].id,
              userId: users[0].id, // Use first user to book second spot
              startDate: new Date('2025-03-15'),
              endDate: new Date('2025-03-20'),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ], { validate: true });
        }
      }
    } catch (error) {
      console.error('Error seeding bookings:', error);
    }
  },

  async down (queryInterface, Sequelize) {
    await Booking.destroy({
      where: {}
    });
  }
};
