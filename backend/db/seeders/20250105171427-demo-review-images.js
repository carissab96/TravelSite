'use strict';
const { Sequelize } = require('sequelize'); // Add this import statement

let options = {};
if (process.env.NODE_ENV === 'production') {
    options.schema = process.env.SCHEMA;  // define your schema in options object
}
const { Review, ReviewImage } = require('../models'); // Import Review and ReviewImage models
module.exports = {
    async up(queryInterface) {
    

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

      
    },

    async down(queryInterface) {

        options.tableName = 'ReviewImages';
        const Op = Sequelize.Op;
        queryInterface.bulkDelete(options.tableName, null, {}); 
        },
};