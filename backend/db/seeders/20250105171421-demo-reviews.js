'use strict';

const { Review } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await Review.bulkCreate([
        {
          spotId: 1,
          userId: 2,
          comment: "Great place to stay!",
          stars: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          spotId: 2,
          userId: 1,
          comment: "Decent spot, but could be cleaner",
          stars: 4,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          spotId: 3,
          userId: 3,
          comment: "Amazing location and view!",
          stars: 5,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ], { validate: true });
    } catch (error) {
      console.error('Error seeding reviews:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      // For production, use the schema-qualified table name
      await queryInterface.sequelize.query(`DELETE FROM "${options.schema}"."Reviews";`);
    } else {
      // For development
      await Review.destroy({ where: {} });
    }
  }
};