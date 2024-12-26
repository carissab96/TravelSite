'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('spots', [
      {
        ownerId: '9',
        address: '123 Disney Lane',
        city: 'San Francisco',
        state: 'California',
        country: 'United States of America',
        lat: 37.7645358,
        lng: -122.4730327,
        name: 'App Academy',
        description: 'Place where web developers are created',
        price: 123,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Add more spots as needed
    ]);
  },
  async down (queryInterface, Sequelize) {
      await queryInterface.bulkDelete('spots', null, {});
    },
  };
  