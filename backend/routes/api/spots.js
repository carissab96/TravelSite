const express = require('express');
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
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
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