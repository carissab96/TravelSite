'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
    options.schema = process.env.SCHEMA;  // define your schema in options object
}
const { Spot, SpotImage } = require('../models'); // Import the SpotImage model

module.exports = {
    async up (queryInterface, Sequelize) {
    
        await SpotImage.bulkCreate([
            {
                spotId: 7, // Ensure this ID exists in your spots table
                url: 'https://example.com/image1.jpg',
                preview: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                spotId: 8, // Ensure this ID exists in your spots table
                url: 'https://example.com/image2.jpg',
                preview: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // {
            //     spotId: 1, // Ensure this ID exists in your spots table
            //     url: 'https://example.com/image3.jpg',
            //     preview: true,
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            // },
            // {
            //     spotId: 2, // Ensure this ID exists in your spots table
            //     url: 'https://example.com/image4.jpg',
            //     preview: false,
            //     createdAt: new Date(),
            //     updatedAt: new Date(),
            // },
          ], options, 
          { validate: true });
    },
    async down (queryInterface, Sequelize) {
        console.log('SpotImages down');
        options.tableName = 'SpotImages';
        const Op = Sequelize.Op;
        return queryInterface.bulkDelete(options.tableName, {
            spotId: { [Op.in]: [7,8] } // Adjust this to match the IDs you want to delete
        }, {});
    },
};