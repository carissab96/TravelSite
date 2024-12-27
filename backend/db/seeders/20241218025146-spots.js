'use strict';

/** @type {import('sequelize-cli').Migration} */
const { Spot } = require('../models');

// Assume we have a separate seeder for users, and we want to use the first user's ID
const ownerId = 1; // TODO: Replace with a dynamic value from the users seeder

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('spots', [
      {
        address: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        country: 'USA',
        lat: 37.7749,
        lng: -122.4194,
        name: 'Test Spot 1',
        description: 'This is a test spot',
        price: 99.99,
        ownerId: ownerId, // Use the variable instead of hardcoding
      },
      {
        address: '456 Elm St',
        city: 'Othertown',
        state: 'NY',
        country: 'USA',
        lat: 40.7128,
        lng: -74.0060,
        name: 'Test Spot 2',
        description: 'This is another test spot',
        price: 199.99,
        ownerId: ownerId, // Use the variable instead of hardcoding
      },
      // Add more spots as needed
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('spots', null, {});
  },
};