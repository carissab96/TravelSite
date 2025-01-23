'use strict';

const { Review, ReviewImage } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // Fetch existing review IDs
      const reviews = await Review.findAll({
        attributes: ['id'] // Fetch only the 'id' field
      });

      const reviewIds = reviews.map(review => review.id);

      // Ensure there are valid review IDs before seeding
      if (reviewIds.length < 2) {
        console.error("Not enough Review IDs found. At least 2 are required to seed ReviewImages.");
        return;
      }

      // Create ReviewImages using the fetched review IDs
      await ReviewImage.bulkCreate([
        {
          reviewId: reviewIds[0], // Use the first existing reviewId
          image_url: 'http://example.com/image1.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          reviewId: reviewIds[1], // Use the first existing reviewId again for another image
          image_url: 'http://example.com/image2.jpg',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Add more records as needed, ensuring they reference valid reviewIds
      ], { validate: true });
    } catch (error) {
      console.error('Error seeding review images:', error);
    }
  },

  async down(queryInterface, Sequelize) {
    if (process.env.NODE_ENV === 'production') {
      // For production, use the schema-qualified table name
      await queryInterface.sequelize.query(`DELETE FROM "${options.schema}"."ReviewImages";`);
    } else {
      // For development
      await ReviewImage.destroy({ where: {} });
    }
  }
};