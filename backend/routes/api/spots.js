const express = require('express');
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('../../utils/auth'); // Middleware for authentication
const { Spot } = require('../../db/models/');
const router = express.Router();

router.use(requireAuth); // Ensure this is applied before the route
//validate the request body

// Create a Spot
router.post('/', [
  check('address').notEmpty().withMessage('Street address is required'),
  check('city').notEmpty().withMessage('City is required'),
  check('state').notEmpty().withMessage('State is required'),
  check('country').notEmpty().withMessage('Country is required'),
  check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
  check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
  check('name').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
  check('description').notEmpty().withMessage('Description is required'),
  check('price').isFloat({ gt: 0 }).withMessage('Price per day must be a positive number')
], async (req, res) => {


  if (!req.user) {
    console.log('User not authenticated');
    return res.status(401).json({ message: 'User not authenticated' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.mapped());
    return res.status(400).json({
      message: 'Bad Request',
      errors: errors.mapped(),
    });
  }

  const { address, city, state, country, lat, lng, name, description, price } = req.body;
  
  try {
    const newSpot = await Spot.create({
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
      updatedAt: new Date(),
    });

    return res.status(201).json({
      message: 'Spot created successfully',
      spot: newSpot,
    });
  } catch (error) {
    console.error('Error creating spot:', error); // Log the error
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get all spots
router.get('/', async (req, res) => {
  try {
      const spots = await Spot.findAll({
          attributes: [
              'id', // Assuming 'id' is the spotId
              'ownerId',
              'address',
              'city',
              'state',
              'country',
              'lat',
              'lng',
              'name',
              'description',
              'price',
              'createdAt',
              'updatedAt',
              // Add any other attributes you want to include
              // 'previewImage', // Ensure this is defined in your Spot model
              // avgRating will need to be calculated later
          ],
      });

      return res.status(200).json({
          spots,
      });
  } catch (error) {
      console.error('Error fetching spots:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Test route in spots is working!' });
});

module.exports = router;