'use strict';

const { Review, User, Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const users = await User.findAll();
      const spots = await Spot.findAll();

      if (users.length === 0 || spots.length === 0) {
        console.error('No users or spots found. Cannot seed reviews.');
        return;
      }

      await Review.bulkCreate([
        {
          spotId: spots[0].id,
          userId: users[0].id,
          comment: 'Great place to stay!',
          stars: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          spotId: spots[1].id,
          userId: users[1].id,
          comment: 'Nice location, clean space',
          stars: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          spotId: spots[0].id,
          userId: users[2].id,
          comment: 'Decent stay, but a bit pricey',
          stars: 3,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { validate: true });
    } catch (error) {
      console.error('Error seeding reviews:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    await Review.destroy({
      where: {}
    });
  }
};
