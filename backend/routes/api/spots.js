const express = require('express');
const { Op } = require('sequelize');
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('../../utils/auth');
const { Spot, SpotImage, User, Review } = require('../../db/models/');

const router = express.Router();

// Public routes (no auth required)
// Get all spots
router.get('/', async (req, res) => {
  const { 
    city, 
    state, 
    country,
    minPrice,
    maxPrice,
    minLat,
    maxLat,
    minLng,
    maxLng,
    name,
    page = 1,
    size = 20
  } = req.query;

  // Validate query parameters
  const errors = {};
  
  // Validate price ranges
  if (minPrice && (isNaN(minPrice) || parseFloat(minPrice) < 0)) {
    errors.minPrice = "Minimum price must be greater than or equal to 0";
  }
  if (maxPrice && (isNaN(maxPrice) || parseFloat(maxPrice) < 0)) {
    errors.maxPrice = "Maximum price must be greater than or equal to 0";
  }
  if (minPrice && maxPrice && parseFloat(minPrice) > parseFloat(maxPrice)) {
    errors.price = "Minimum price cannot be greater than maximum price";
  }
  
  // Validate latitude ranges
  if (minLat && (isNaN(minLat) || parseFloat(minLat) < -90 || parseFloat(minLat) > 90)) {
    errors.minLat = "Minimum latitude must be between -90 and 90";
  }
  if (maxLat && (isNaN(maxLat) || parseFloat(maxLat) < -90 || parseFloat(maxLat) > 90)) {
    errors.maxLat = "Maximum latitude must be between -90 and 90";
  }
  
  // Validate longitude ranges
  if (minLng && (isNaN(minLng) || parseFloat(minLng) < -180 || parseFloat(minLng) > 180)) {
    errors.minLng = "Minimum longitude must be between -180 and 180";
  }
  if (maxLng && (isNaN(maxLng) || parseFloat(maxLng) < -180 || parseFloat(maxLng) > 180)) {
    errors.maxLng = "Maximum longitude must be between -180 and 180";
  }

  // Validate page and size
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    errors.page = "Page must be greater than or equal to 1";
  }
  if (size && (isNaN(size) || parseInt(size) < 1)) {
    errors.size = "Size must be greater than or equal to 1";
  }

  // Return validation errors if any
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Bad Request",
      errors: errors
    });
  }

  try {
    const where = {};
    
    // Add filters based on query parameters
    if (city) where.city = { [Op.like]: `%${city}%` };
    if (state) where.state = { [Op.like]: `%${state}%` };
    if (country) where.country = { [Op.like]: `%${country}%` };
    if (name) where.name = { [Op.like]: `%${name}%` };
    
    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    // Latitude range filter
    if (minLat || maxLat) {
      where.lat = {};
      if (minLat) where.lat[Op.gte] = parseFloat(minLat);
      if (maxLat) where.lat[Op.lte] = parseFloat(maxLat);
    }
    
    // Longitude range filter
    if (minLng || maxLng) {
      where.lng = {};
      if (minLng) where.lng[Op.gte] = parseFloat(minLng);
      if (maxLng) where.lng[Op.lte] = parseFloat(maxLng);
    }

    // Calculate pagination
    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    const { count, rows: spots } = await Spot.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        {
          model: SpotImage,
          attributes: ['url'],
          where: { preview: true },
          required: false
        },
        {
          model: Review,
          attributes: ['stars'],
          required: false
        }
      ]
    });

    // Format spots to include preview image and average rating
    const formattedSpots = spots.map(spot => {
      const spotData = spot.toJSON();
      spotData.previewImage = spot.SpotImages?.[0]?.url || null;
      
      // Calculate average rating
      if (spot.Reviews && spot.Reviews.length > 0) {
        const totalStars = spot.Reviews.reduce((sum, review) => sum + review.stars, 0);
        spotData.avgRating = totalStars / spot.Reviews.length;
      } else {
        spotData.avgRating = null;
      }
      
      delete spotData.SpotImages;
      delete spotData.Reviews;
      return spotData;
    });

    return res.json({
      Spots: formattedSpots,
      page: parseInt(page),
      size: parseInt(size),
      totalSpots: count,
      totalPages: Math.ceil(count / limit)
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      statusCode: 500
    });
  }
});

// Get current user's spots
router.get('/current', requireAuth, async (req, res) => {
  try {
      const userId = req.user.id;

      const Spots = await Spot.findAll({
          where: {
              ownerId: userId
          },
          include: [
              {
                  model: Review,
                  attributes: ['stars'],
                  required: false
              },
              {
                  model: SpotImage,
                  where: { preview: true },
                  required: false,
                  attributes: ['url']
              }
          ]
      });
      // Format spots to include preview image and average rating
      const formattedSpots = Spots.map(spot => {
          const spotData = spot.toJSON();
          spotData.previewImage = spot.SpotImages?.[0]?.url || null;
          
          // Calculate average rating
          if (spot.Reviews && spot.Reviews.length > 0) {
              const totalStars = spot.Reviews.reduce((sum, review) => sum + review.stars, 0);
              spotData.avgRating = totalStars / spot.Reviews.length;
          } else {
              spotData.avgRating = null;
          }
          
          delete spotData.SpotImages;
          delete spotData.Reviews;
          return spotData;
      });
      return res.status(200).json({
          Spots: formattedSpots
      });
  } catch (error) {
      console.error('Error fetching user spots:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }   
});

// Get current user's spots
router.get('/current', requireAuth, async (req, res) => {
  try {
      const userId = req.user.id;

      const Spots = await Spot.findAll({
          where: {
              ownerId: userId
          },
          include: [
              {
                  model: Review,
                  attributes: ['stars'],
                  required: false
              },
              {
                  model: SpotImage,
                  where: { preview: true },
                  required: false,
                  attributes: ['url']
              }
          ]
      });
      // Format spots to include preview image and average rating
      const formattedSpots = Spots.map(spot => {
          const spotData = spot.toJSON();
          spotData.previewImage = spot.SpotImages?.[0]?.url || null;
          
          // Calculate average rating
          if (spot.Reviews && spot.Reviews.length > 0) {
              const totalStars = spot.Reviews.reduce((sum, review) => sum + review.stars, 0);
              spotData.avgRating = totalStars / spot.Reviews.length;
          } else {
              spotData.avgRating = null;
          }
          
          delete spotData.SpotImages;
          delete spotData.Reviews;
          return spotData;
      });
      return res.status(200).json({
          Spots: formattedSpots
      });
  } catch (error) {
      console.error('Error fetching user spots:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }   
});

// Get current user's spots
router.get('/current', requireAuth, async (req, res) => {
  try {
      const userId = req.user.id;

      const Spots = await Spot.findAll({
          where: {
              ownerId: userId
          },
          include: [
              {
                  model: Review,
                  attributes: ['stars'],
                  required: false
              },
              {
                  model: SpotImage,
                  where: { preview: true },
                  required: false,
                  attributes: ['url']
              }
          ]
      });

      const formattedSpots = Spots.map(spot => {
          const spotData = spot.toJSON();
          spotData.previewImage = spot.SpotImages?.[0]?.url || null;
          
          if (spot.Reviews && spot.Reviews.length > 0) {
              const totalStars = spot.Reviews.reduce((sum, review) => sum + review.stars, 0);
              spotData.avgRating = totalStars / spot.Reviews.length;
          } else {
              spotData.avgRating = null;
          }
          
          delete spotData.SpotImages;
          delete spotData.Reviews;
          return spotData;
      });

      return res.status(200).json({
          Spots: formattedSpots
      });
  } catch (error) {
      console.error('Error fetching user spots:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }   
});

// Get details of a spot by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Skip this route if the ID is 'current'
    if (id === 'current') {
      return next();
    }

    // First validate that id is a number
    if (isNaN(parseInt(id))) {
      return res.status(400).json({
        message: "Spot ID must be a number",
        statusCode: 400
      });
    }

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

    // Get review stats
    const reviews = await Review.findAndCountAll({
      where: { spotId: id }
    });

    const avgStarRating = reviews.rows.length > 0 
      ? reviews.rows.reduce((sum, review) => sum + review.stars, 0) / reviews.rows.length
      : null;

    // Format the response
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
      numReviews: reviews.count,
      avgStarRating,
      SpotImages: spot.SpotImages,
      Owner: spot.Owner
    };

    return res.json(response);
  } catch (error) {
    console.error('Error fetching spot details:', error);
    return res.status(500).json({
      message: "An error occurred while fetching the spot",
      statusCode: 500
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
    console.error('Error creating spot:', error);
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Edit a Spot
router.put('/:spotId', requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { address, city, state, country, lat, lng, name, description, price } = req.body;

  // Validation: Check for empty attributes
  const errors = [];
  if (!address) errors.push('Address is required');
  if (!city) errors.push('City is required');
  if (!state) errors.push('State is required');
  if (!country) errors.push('Country is required');
  if (lat === undefined) errors.push('Latitude is required');
  if (lng === undefined) errors.push('Longitude is required');
  if (!name) errors.push('Name is required');
  if (!description) errors.push('Description is required');
  if (price === undefined) errors.push('Price is required');

  if (errors.length) {
    return res.status(400).json({ errors });
  }

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) return res.status(404).json({ message: 'Spot not found' });

    // Update the spot with the provided data
    await spot.update({ address, city, state, country, lat, lng, name, description, price });

    return res.status(200).json({ spot });
  } catch (error) {
    console.error('Error updating spot:', error);
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        message: 'Validation error',
        errors
      });
    }
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a Spot
router.delete('/:spotId', requireAuth, async (req, res) => {
  const { spotId } = req.params;

  // Validate spotId is a number
  const spotIdNum = parseInt(spotId, 10);
  if (isNaN(spotIdNum)) {
      return res.status(400).json({ 
          message: 'Spot ID must be a valid number',
          statusCode: 400
      });
  }

  try {
      const spot = await Spot.findByPk(spotIdNum, {
          include: [
              { model: SpotImage },
              { model: Review }
          ]
      });

      if (!spot) {
          return res.status(404).json({ 
              message: 'Spot not found',
              statusCode: 404
          });
      }

      // Check if the current user is the owner of the spot
      // Convert both to numbers for comparison
      if (Number(spot.ownerId) !== Number(req.user.id)) {
          return res.status(403).json({ 
              message: 'Forbidden: You do not have permission to delete this spot',
              statusCode: 403
          });
      }

      // Delete associated records first
      if (spot.SpotImages && spot.SpotImages.length > 0) {
          await SpotImage.destroy({
              where: { spotId: spotIdNum }
          });
      }
      
      if (spot.Reviews && spot.Reviews.length > 0) {
          await Review.destroy({
              where: { spotId: spotIdNum }
          });
      }

      // Finally delete the spot
      await spot.destroy();

      return res.status(200).json({
          message: 'Spot deleted successfully',
          statusCode: 200
      });
  } catch (error) {
      console.error('Error deleting spot:', error);
      return res.status(500).json({ 
          message: 'Internal Server Error',
          statusCode: 500,
          errors: process.env.NODE_ENV === 'development' ? [error.message] : undefined
      });
  }
});

// Get current user's spots
router.get('/current', requireAuth, async (req, res) => {
  try {
      const userId = req.user.id;

      const Spots = await Spot.findAll({
          where: {
              ownerId: userId
          },
          include: [
              {
                  model: Review,
                  attributes: ['stars'],
                  required: false
              },
              {
                  model: SpotImage,
                  where: { preview: true },
                  required: false,
                  attributes: ['url']
              }
          ]
      });
      // Format spots to include preview image and average rating
      const formattedSpots = Spots.map(spot => {
          const spotData = spot.toJSON();
          spotData.previewImage = spot.SpotImages?.[0]?.url || null;
          
          // Calculate average rating
          if (spot.Reviews && spot.Reviews.length > 0) {
              const totalStars = spot.Reviews.reduce((sum, review) => sum + review.stars, 0);
              spotData.avgRating = totalStars / spot.Reviews.length;
          } else {
              spotData.avgRating = null;
          }
          
          delete spotData.SpotImages;
          delete spotData.Reviews;
          return spotData;
      });
      return res.status(200).json({
          Spots: formattedSpots
      });
  } catch (error) {
      console.error('Error fetching user spots:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
  }   
});

const { upload } = require('../../config/aws');

// Add an image to a spot
router.post('/:id/images', requireAuth, upload.single('image'), async (req, res) => {
    const { id } = req.params;
    const preview = req.body.preview === 'true';

    if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
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

        // Check maximum images
        const imageCount = await SpotImage.count({
            where: { spotId: spot.id }
        });

        if (imageCount >= 10) {
            return res.status(403).json({
                message: "Maximum number of images for this spot was reached",
                statusCode: 403
            });
        }

        // Create the new image in the database
        const newImage = await SpotImage.create({
            spotId: spot.id,
            url: req.file.location, // S3 URL of the uploaded file
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
        if (error.name === 'SequelizeValidationError') {
          const errors = error.errors.map(err => ({
            field: err.path,
            message: err.message
          }));
          return res.status(400).json({
            message: 'Validation error',
            errors
          });
        }
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
      if (error.name === 'SequelizeValidationError') {
        const errors = error.errors.map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({
          message: 'Validation error',
          errors
        });
      }
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