'use strict';
const { Sequelize } = require('sequelize'); // Add this import statement

let options = {};
if (process.env.NODE_ENV === 'production') {
    options.schema = process.env.SCHEMA;  // define your schema in options object
}
const { SpotImage, Spot } = require('../models'); // Import the SpotImage model

module.exports = {
    async up (queryInterface, Sequelize) {
       


        // Fetch existing spot IDs
        const existingSpots = await Spot.findAll({
            attributes: ['id'] // Fetch only the 'id' field
        });

        // Extract spot IDs into an array
        const spotIds = existingSpots.map(spot => spot.id);
        

        // Ensure there are valid spot IDs before seeding
        if (spotIds.length === 0) {
            console.error("No valid Spot IDs found. Cannot seed SpotImages.");
            return;
        }

        // Create SpotImages using the fetched spot IDs
        await SpotImage.bulkCreate([
          {
              spotId: spotIds[0], // Use the first existing spotId
              url: 'https://example.com/image1.jpg',
              preview: true,
              createdAt: new Date(),
              updatedAt: new Date(),
          },
          {
              spotId: spotIds[1], // Use the second existing spotId
              url: 'https://example.com/image2.jpg',
              preview: true,
              createdAt: new Date(),
              updatedAt: new Date(),
          },
          // Add more records as needed, ensuring they reference valid spotIds
      ], { validate: true });

   
  },
    async down (queryInterface, Sequelize) {

        options.tableName = 'SpotImages';
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete(options.tableName, {
            spotId: { [Op.in]: [8] } // Adjust this to match the IDs you want to delete
        }, {});
    },
};