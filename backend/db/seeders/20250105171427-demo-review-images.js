'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
    options.schema = process.env.SCHEMA;  // define your schema in options object
}
const { Review, ReviewImage } = require('../models'); // Import Review and ReviewImage models
module.exports = {
    async up(queryInterface) {
        console.log("Starting to seed ReviewImages...");

        // Fetch existing review IDs
        const reviews = await Review.findAll({
            attributes: ['id'] // Fetch only the 'id' field
        });

        const reviewIds = reviews.map(review => review.id);
        console.log("Existing Review IDs:", reviewIds);

        // Ensure there are valid review IDs before seeding
        if (reviewIds.length === 0) {
            console.error("No valid Review IDs found. Cannot seed ReviewImages.");
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

        console.log("ReviewImages seeded successfully.");
    },

    async down(queryInterface) {
        console.log('ReviewImages down');
        options.tableName = 'ReviewImages';
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete(options.tableName, {
            reviewId: { [Op.in]: [1] } // Adjust this to match the IDs you want to delete
        }, {});
    },
};