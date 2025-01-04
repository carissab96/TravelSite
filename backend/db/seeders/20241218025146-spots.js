'use strict';

/** @type {import('sequelize-cli').Migration} */

const { User, Spot } = require('../models'); // Import the User and Spot models

let options = {};
if (process.env.NODE_ENV === 'production') {
    options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
        console.log('Spots up');
 
        // Fetch the first user ID dynamically
        const users = await User.findAll();
        const ownerId = users.length > 0 ? users[0].id : null; // Get the first user's ID

        // Check if we have a valid ownerId
        if (!ownerId) {
            console.error('No users found. Cannot seed spots.');
            return;
        }

        await Spot.bulkCreate([
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
            },
        ], { validate: true });
    },

//  async down (queryInterface, Sequelize) {
//         console.log('Spots down');
//         options.tableName = 'Spots';
//         const Op = Sequelize.Op;
//         return queryInterface.bulkDelete(options.tableName, {
//             ownerId: { [Op.in]: [1, 2] } // Adjust this to match the IDs you want to delete
//         }, {});

async down (queryInterface, Sequelize) {
  await queryInterface.bulkDelete('Spots', null, {});

},

};