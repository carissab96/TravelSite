'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
    options.schema = process.env.SCHEMA;  // define your schema in options object
}
const { SpotImage } = require('../models'); // Import the SpotImage model

module.exports = {
   up: async (queryInterface, Sequelize) => {
     
    await SpotImage.bulkCreate([
            {
              spotId: 3, // Ensure this ID exists in your spots table
              url: 'https://example.com/image1.jpg',
              preview: true,
              createdAt: new Date(),
              updatedAt: new Date(),
          },
          {
              spotId: 4, // Ensure this ID exists in your spots table
              url: 'https://example.com/image2.jpg',
              preview: false,
              createdAt: new Date(),
              updatedAt: new Date(),
          },
          {
              spotId: 3, // Ensure this ID exists in your spots table
              url: 'https://example.com/image3.jpg',
              preview: true,
              createdAt: new Date(),
              updatedAt: new Date(),
          },
          {
              spotId: 4, // Ensure this ID exists in your spots table
              url: 'https://example.com/image4.jpg',
              preview: false,
              createdAt: new Date(),
              updatedAt: new Date(),
          },
      ], options);
  },

    down: async (queryInterface, Sequelize) => {
        console.log('SpotImages down');
        options.tableName = 'SpotImages';
        await queryInterface.bulkDelete('SpotImages', null, options);
    },
};