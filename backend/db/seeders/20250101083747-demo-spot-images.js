'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('SpotImages', [
            {
                spotId: 1, // Ensure this ID exists in your spots table
                url: 'https://example.com/image1.jpg',
                preview: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                spotId: 1,
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
                spotId: 3,
                url: 'https://example.com/image4.jpg',
                preview: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('SpotImages', null, {});
    }
};