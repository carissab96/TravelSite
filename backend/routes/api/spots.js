const express = require('express');
<<<<<<< HEAD
const { check, validationResult } = require('express-validator');
const { Spot } = require('../../db/models'); // Adjust the path as necessary
const { requireAuth } = require('../../utils/auth'); // Middleware for authentication
const router = express.Router();

// Middleware to require authentication
router.use(requireAuth);

// Create a Spot
router.post('/spots', [
  check('address').notEmpty().withMessage('Street address is required'),
  check('city').notEmpty().withMessage('City is required'),
  check('state').notEmpty().withMessage('State is required'),
  check('country').notEmpty().withMessage('Country is required'),
  check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
  check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
  check('name').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
  check('description').notEmpty().withMessage('Description is required'),
  check('price').isFloat({ gt: 0 }).withMessage('Price per day must be a positive number'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Bad Request",
      errors: errors.mapped()
});
  }
  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  const ownerId = req.user.id; // Get ownerId from the authenticated user

  try {
    const { address, city, state, country, lat, lng, name, description, price } = req.body;
    

    const newSpot = await Spot.create({
      ownerId,
=======
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
>>>>>>> 3896bf8223997ad6f24b5f35377d3f2082acdd01
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
<<<<<<< HEAD
    });

    return res.status(201).json({
      message: "Spot created successfully",
      spot: newSpot,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
=======
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
>>>>>>> 3896bf8223997ad6f24b5f35377d3f2082acdd01
