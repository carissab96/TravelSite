const express = require('express');
const router = express.Router();
const { requireAuth } = require('../../utils/auth');
const { Op } = require('sequelize');
const { spot } = require('../../db/models');
// const validateSpot = require('../../utils/validation')

const { check, validationResult } = require('express-validator');

// Create a Spot function
const createSpot = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'You must be logged in to create a spot.' });
  }

  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  try {
    const newSpot = await spot.create({
      ownerId: req.user.id,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return res.status(201).json(newSpot);
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while creating the spot.' });
  }
};

const validateSpot = [
  check('address')
    .isLength({ min: 1 })
    .withMessage('Address is required'),
  check('city')
    .isLength({ min: 1 })
    .withMessage('City is required'),
  check('state')
    .isLength({ min: 1 })
    .withMessage('State is required'),
  check('country')
    .isLength({ min: 1 })
    .withMessage('Country is required'),
  check('lat')
    .isNumeric()
    .withMessage('Latitude must be a number'),
  check('lng')
    .isNumeric()
    .withMessage('Longitude must be a number'),
  check('name')
    .isLength({ min: 1 })
    .withMessage('Name is required'),
  check('description')
    .isLength({ min: 1 })
    .withMessage('Description is required'),
  check('price')
    .isNumeric()
    .withMessage('Price must be a number'),
];

router.post('/spots', validateSpot, (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
}, createSpot);

module.exports = router;

// // Test createSpot endpoint
// // Test createSpot endpoint
// async function testCreateSpot() {
//   try {
//     // Create a test user
//     const testUser = { id: 1, username: 'testuser' };

//     // Create a test spot
//     const testSpot = {
//       address: '123 Main St',
//       city: 'Anytown',
//       state: 'CA',
//       country: 'USA',
//       lat: 37.7749,
//       lng: -122.4194,
//       name: 'Test Spot',
//       description: 'This is a test spot',
//       price: 100,
//     };

//     // Create a mock req object
// //     const req = {
// //       user: testUser,
// //       body: testSpot,
// //     };

//     // Create a mock res object
//     const res = {
//       status: (statusCode) => {
//         return {
//           json: (data) => {
//             console.log(`Status code: ${statusCode}`);
//             console.log(`Response data: ${JSON.stringify(data)}`);
//           },
//         };
//       },
//     };

//     // Call the createSpot endpoint
//     await createSpot(req, res);
//   } catch (error) {
//     console.log('Test failed:', error);
//   }
// }

// // Run the test
// testCreateSpot();