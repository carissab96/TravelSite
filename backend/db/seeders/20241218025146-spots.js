'use strict';

const { Spot } = require('../models');

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA;  // define your schema in options object
}

module.exports = {
  async up (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    await Spot.bulkCreate([
      {
        ownerId: 1,
        address: '123 Main St',
        city: 'Sample City',
        state: 'CA',
        country: 'USA',
        lat: 34.0522,
        lng: -118.2437,
        name: 'Test Spot 1',
        description: 'This is a test spot',
        price: 99.99,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerId: 2,
        address: '456 Elm St',
        city: 'Sample City',
        state: 'CA',
        country: 'USA',
        lat: 34.0522,
        lng: -118.2437,
        name: 'Test Spot 2',
        description: 'This is another test spot',
        price: 199.99,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerId: 1,
        address: '789 Oceanview Drive',
        city: 'Malibu',
        state: 'CA',
        country: 'USA',
        lat: 34.0259,
        lng: -118.7798,
        name: 'Beachfront Paradise',
        description: 'Luxurious beachfront villa with private access to the ocean. Wake up to stunning sunrises and fall asleep to the sound of waves.',
        price: 599.99,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerId: 2,
        address: '321 Mountain Ridge',
        city: 'Aspen',
        state: 'CO',
        country: 'USA',
        lat: 39.1911,
        lng: -106.8175,
        name: 'Alpine Retreat',
        description: 'Cozy mountain cabin with panoramic views of the Rockies. Perfect for skiing in winter and hiking in summer.',
        price: 399.99,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerId: 1,
        address: '567 Desert Oasis Way',
        city: 'Sedona',
        state: 'AZ',
        country: 'USA',
        lat: 34.8697,
        lng: -111.7610,
        name: 'Red Rock Haven',
        description: 'Modern desert retreat surrounded by Sedonas famous red rocks. Features a private pool and stunning sunset views.',
        price: 349.99,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        ownerId: 2,
        address: '890 Lakefront Circle',
        city: 'Lake Tahoe',
        state: 'CA',
        country: 'USA',
        lat: 39.0968,
        lng: -120.0324,
        name: 'Tahoe Lakeside Lodge',
        description: 'Spacious lodge with direct lake access. Perfect for summer swimming or winter skiing at nearby resorts.',
        price: 449.99,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    options.tableName = 'Spots';
    return queryInterface.bulkDelete(options, null, {});
  }
};