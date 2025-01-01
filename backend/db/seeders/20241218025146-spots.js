'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Spot } = require('../models');

// Assume we have a separate seeder for users, and we want to use the first user's ID
'use strict';

const { User } = require('../models'); // Import the User model

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Fetch the first user ID dynamically
        const users = await User.findAll();
        const ownerId = users.length > 0 ? users[0].id : null; // Get the first user's ID

        // Check if we have a valid ownerId
        if (!ownerId) {
            console.error('No users found. Cannot seed spots.');
            return;
        }

        await queryInterface.bulkInsert('Spots', [
            {
                address: '123 Main St',
                city: 'Sample City',
                state: 'CA',
                country: 'USA',
                lat: 34.0522,
                lng: -118.2437,
                name: 'Test Spot 1',
                description: 'This is a test spot',
                price: 99.99,
                ownerId: ownerId, // Use the dynamic user ID
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                address: '456 Elm St',
                city: 'Sample City',
                state: 'CA',
                country: 'USA',
                lat: 34.0522,
                lng: -118.2437,
                name: 'Test Spot 2',
                description: 'This is another test spot',
                price: 199.99,
                ownerId: ownerId, // Use the dynamic user ID
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            // Add more spots as needed
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Spots', null, {});
    }
};