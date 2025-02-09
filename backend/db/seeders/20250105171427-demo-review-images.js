'use strict';

const { ReviewImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    await ReviewImage.bulkCreate([
      {
        reviewId: 1,
        image_url: 'http://example.com/image1.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        reviewId: 2,
        image_url: 'http://example.com/image2.jpg',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    options.tableName = 'ReviewImages';
    return queryInterface.bulkDelete(options, null, {});
  }
};
