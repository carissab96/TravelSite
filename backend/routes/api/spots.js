const express = require('express');
const { Op } = require('sequelize'); // Import Op for query operators
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('../../utils/auth'); // Middleware for authentication
const { Spot, SpotImage } = require('../../db/models/');
const { User } = require('../../db/models/');

const router = express.Router();

// Public routes (no auth required)
// Get all spots
router.get('/', async (req, res) => {
  const { city, state, price } = req.query; 
  const where = {}; 
  // Add filters based on query parameters
  if (city) {
      where.city = city; // Filter by city
  }
  if (state) {
      where.state = state; // Filter by state
  }
  if (price) {
      where.price = { [Op.lte]: price }; // Filter by price (less than or equal)
  }

  try {
      const Spots = await Spot.findAll({
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
               
              // avgRating will need to be calculated later
          ],
          where, // Include the where clause for filtering
      });

      return res.status(200).json({
          spots: Spots,
      });
  } catch (error) {
      console.error('Error fetching spots:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get details of a spot by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const spot = await Spot.findByPk(id, {
      include: [
        {
          model: SpotImage,
          attributes: ['id', 'url', 'preview']
        },
        {
          model: User,
          as: 'Owner',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    // Check if the spot exists
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
        statusCode: 404
      });
    }

    // Format the response to match API docs
    const response = {
      id: spot.id,
      ownerId: spot.ownerId,
      address: spot.address,
      city: spot.city,
      state: spot.state,
      country: spot.country,
      lat: spot.lat,
      lng: spot.lng,
      name: spot.name,
      description: spot.description,
      price: spot.price,
      createdAt: spot.createdAt,
      updatedAt: spot.updatedAt,
      numReviews: 0, // You'll need to implement this
      avgStarRating: null, // You'll need to implement this
      SpotImages: spot.SpotImages,
      Owner: spot.Owner
    };

    return res.json(response);
  } catch (error) {
    return res.status(404).json({
      message: "Spot couldn't be found",
      statusCode: 404
    });
  }
});

// Protected routes (auth required)
// Create a Spot
router.post('/', requireAuth, [
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

// Edit a Spot
router.put('/:spotId', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  try {
      const spot = await Spot.findByPk(spotId);

      if (!spot) {
          return res.status(404).json({ message: 'Spot not found' });
      }

      // Update the spot with new values
      const updatedSpot = await spot.update({
          address,
          city,
          state,
          country,
          lat,
          lng,
          name,
          description,
          price,
          updatedAt: new Date(),
      });

      return res.status(200).json({
          message: 'Spot updated successfully',
          spot: updatedSpot,
      });
  } catch (error) {
      console.error('Error updating spot:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a Spot
router.delete('/:spotId', requireAuth, async (req, res) => {
  const { spotId } = req.params;

  try {
      const spot = await Spot.findByPk(spotId);

      if (!spot) {
          return res.status(404).json({ message: 'Spot not found' });
      }

      await spot.destroy(); // Delete the spot

      return res.status(200).json({
          message: 'Spot deleted successfully',
      });
  } catch (error) {
      console.error('Error deleting spot:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get current user's spots
router.get('/current', requireAuth, async (req, res) => {
  try {
      const { currentUserId } = req.user;

      // Validate currentUserId
      if (!currentUserId) {
          return res.status(400).json({ message: 'User ID is required' });
      }

      const Spots = await Spot.findAll({
          where: {
              ownerId: currentUserId,
          },
      });
      // Check if spots are found
      if (Spots.length === 0) {
          return res.status(404).json({ message: 'No spots found for this user' });
      }
      return res.status(200).json({
          message: 'Spots fetched successfully',
          spots: Spots,
      });
  } catch (error) {
      console.error('Error fetching user spots:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }   
});

// Add an image to a spot
router.post('/:id/images', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { url, preview } = req.body;

    // Validate input
    if (!url || typeof preview !== 'boolean') {
        return res.status(400).json({ message: 'Invalid input' });
    }

    try {
        // Find the spot by ID
        const spot = await Spot.findByPk(id);

        // Check if the spot exists
        if (!spot) {
            return res.status(404).json({ message: "Spot couldn't be found" });
        }

        // Check if the current user is the owner of the spot
        if (spot.ownerId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to add an image to this spot' });
        }

        // Create the new image in the database
        const newImage = await SpotImage.create({
            spotId: spot.id,
            url,
            preview,
        });

        // Return the newly created image
        return res.status(201).json({
            id: newImage.id,
            url: newImage.url,
            preview: newImage.preview,
        });
    } catch (error) {
        console.error('Error adding image to spot:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

// Edit a spot image
router.put('/:id/images/:imageId', requireAuth, async (req, res) => {
  const { id, imageId } = req.params;
  const { url, preview } = req.body;

  try {
      const spot = await Spot.findByPk(id);
      if (!spot) {
          return res.status(404).json({ message: "Spot couldn't be found" });
      }

      const image = await SpotImage.findByPk(imageId);
      if (!image) {
          return res.status(404).json({ message: "Image couldn't be found" });
      }

      // Check if the current user is the owner of the spot
      if (spot.ownerId !== req.user.id) {
          return res.status(403).json({ message: 'Forbidden: You do not have permission to edit this image' });
      }

      // Update the image
      const updatedImage = await image.update({ url, preview });

      return res.status(200).json({
          id: updatedImage.id,
          url: updatedImage.url,
          preview: updatedImage.preview,
      });
  } catch (error) {
      console.error('Error updating image:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a spot image
router.delete('/:id/images/:imageId', requireAuth, async (req, res) => {
  const { id, imageId } = req.params;

  try {
      const spot = await Spot.findByPk(id);
      if (!spot) {
          return res.status(404).json({ message: "Spot couldn't be found" });
      }

      const image = await SpotImage.findByPk(imageId);
      if (!image) {
          return res.status(404).json({ message: "Image couldn't be found" });
      }

      // Check if the current user is the owner of the spot
      if (spot.ownerId !== req.user.id) {
          return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this image' });
      }

      await image.destroy(); // Delete the image

      return res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
      console.error('Error deleting image:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Test route in spots is working!' });
});

module.exports = router;