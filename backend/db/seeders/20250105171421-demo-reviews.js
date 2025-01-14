'use strict';
const { Sequelize } = require('sequelize');
let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}
const { User, Spot, Review } = require('../models'); // Import User, Review, and Spot models
module.exports = {
  async up(queryInterface) {
 

    // Fetch existing spot IDs
    const spots = await Spot.findAll();

    const spotIds = spots.map(spot => spot.id);
  

    // Fetch the first user ID dynamically
    const users = await User.findAll();
    
    const ownerId = users.length > 0 ? users[0].id : null; // Get the first user's ID

    if (!ownerId) {
      console.error("No valid user ID found. Cannot seed reviews.");
      return;
    }


    // Ensure there are valid spot IDs before seeding
    if (spotIds.length < 2) {
      console.error("Not enough Spot IDs found. At least 2 are required to seed reviews.");
      return;
    }
try {
  await Review.bulkCreate([
      {
        spotId: spotIds[0], // Use the first existing spotId
        userId: ownerId, // Use the dynamic user ID
        stars: 5,
        comment: 'Amazing place!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: spotIds[1], // Use the second existing spotId
        userId: ownerId, // Use the dynamic user ID
        stars: 4,
        comment: 'Great experience!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { validate: true });
  } catch (error) {
    console.error("Error seeding reviews:", error);
  }
  },

  async down(queryInterface) {

    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options.tableName, {
      userId: { [Op.in]: [1] },
    }, {});
  },
};