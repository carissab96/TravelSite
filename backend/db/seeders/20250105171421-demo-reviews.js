'use strict';

let options = {};
if (process.env.NODE_ENV === 'production') {
  options.schema = process.env.SCHEMA; // define your schema in options object
}
const { User, Review, Spot } = require('../models'); // Import User, Review, and Spot models
module.exports = {
  async up(queryInterface) {
    console.log("Starting to seed reviews...");

    // Fetch existing spot IDs
    const spots = await Spot.findAll({
      attributes: ['id'] // Fetch only the 'id' field
    });

    const spotIds = spots.map(spot => spot.id);
    console.log("Existing Spot IDs:", spotIds);

    // Fetch the first user ID dynamically
    const users = await User.findAll();
    const ownerId = users.length > 0 ? users[0].id : null; // Get the first user's ID

    if (!ownerId) {
      console.error("No valid user ID found. Cannot seed reviews.");
      return;
    }

    // Ensure there are valid spot IDs before seeding
    if (spotIds.length === 0) {
      console.error("No valid Spot IDs found. Cannot seed reviews.");
      return;
    }

    await Review.bulkCreate([
      {
        spotId: spotIds[0], // Use the first existing spotId
        userId: ownerId, // Use the dynamic user ID
        rating: 5,
        comment: 'Amazing place!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        spotId: spotIds[1], // Use the second existing spotId
        userId: ownerId, // Use the dynamic user ID
        rating: 4,
        comment: 'Great experience!',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { validate: true });

    console.log("Reviews seeded successfully.");
  },

  async down(queryInterface) {
    console.log('Reviews down');
    options.tableName = 'Reviews';
    const Op = Sequelize.Op;
    return queryInterface.bulkDelete(options.tableName, {
      userId: { [Op.in]: [1] } // Adjust this to match the IDs you want to delete
    }, {});
  },
};