const express = require('express');
const { Op } = require('sequelize');
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('../../utils/auth');
const { Review, Spot, User, ReviewImage } = require('../../db/models');

const router = express.Router();

const validateReview = [
  check('comment')
    .exists({ checkFalsy: true })
    .withMessage('Comment text is required'),
  check('stars')
    .exists({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Stars must be an integer from 1 to 5'),
];

// Middleware for logging incoming requests
router.use((req, res, next) => {
 
    next();
});

// Authentication middleware
router.use(requireAuth); // Ensure this is applied before the routes

// Create a review for a Spot
router.post('/:spotId/reviews', validateReview, async (req, res) => {
  const { comment, stars } = req.body;
  const { spotId } = req.params;
  const userId = req.user.id; // Assuming you have middleware to attach the user to the request

  try {
    // Check if spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
        statusCode: 404
      });
    }

    // Check if user already has a review for this spot
    const existingReview = await Review.findOne({
      where: {
        spotId,
        userId
      }
    });

    if (existingReview) {
      return res.status(403).json({
        message: "User already has a review for this spot",
        statusCode: 403
      });
    }

    const newReview = await Review.create({
      spotId: parseInt(spotId),
      userId: req.user.id,
      comment,
      stars
    });

    return res.status(201).json(newReview);
  } catch (error) {
    console.error('Error creating review:', error);
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

// Get all Reviews of the Current User
router.get('/current', requireAuth, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        statusCode: 401
      });
    }

    const reviews = await Review.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Spot,
          attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price']
        },
        {
          model: ReviewImage,
          attributes: ['id', 'image_url']
        }
      ]
    });

    return res.json({ Reviews: reviews });  
  } catch (error) {
    console.error('Error getting user reviews:', error);  
    return res.status(500).json({  
      message: "An error occurred while fetching reviews",
      statusCode: 500
    });
  }
});

// Get all reviews for a spot
router.get('/spot/:spotId', async (req, res) => {
    const { spotId } = req.params;
    
    try {
        // Check if spot exists
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found",
                statusCode: 404
            });
        }

        // Get all reviews for the spot
        const reviews = await Review.findAll({
            where: { spotId },
            include: [
                {
                    model: User,
                    attributes: ['id', 'firstName', 'lastName']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return res.json({ reviews });
    } catch (error) {
        console.error('Error fetching spot reviews:', error);
        return res.status(500).json({
            message: "An error occurred while fetching reviews",
            statusCode: 500
        });
    }
});

// Get all reviews for a specific spot
router.get('/reviews/:spotId/reviews', async (req, res) => {
    const { spotId } = req.params;

   

    try {
        const reviews = await Review.findAll({
            where: { spotId },
            include: [{ model: User,
                attributes: ['id', 'firstName', 'lastName']
             }] // Include associated user information if needed
        });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this spot' });
        }

        return res.status(200).json({ reviews });
    } catch (error) {
        console.error('Error retrieving reviews for spot:', error);
        return res.status(500).json({ message: 'Error retrieving reviews for spot', error });
    }
});

// Add an Image to a Review
router.post('/:reviewId/images', async (req, res) => {
  const { image_url } = req.body;
  const { reviewId } = req.params;

  try {
    const review = await Review.findByPk(reviewId);
    
    if (!review) {
      return res.status(404).json({
        message: "Review couldn't be found",
        statusCode: 404
      });
    }

    // Check if review belongs to current user
    if (review.userId !== req.user.id) {
      return res.status(403).json({
        message: "Forbidden",
        statusCode: 403
      });
    }

    // Check maximum images
    const imageCount = await ReviewImage.count({
      where: { reviewId }
    });

    if (imageCount >= 10) {
      return res.status(403).json({
        message: "Maximum number of images for this review was reached",
        statusCode: 403
      });
    }

    const newImage = await ReviewImage.create({
      reviewId,
      image_url
    });

    return res.json({
      id: newImage.id,
      image_url: newImage.image_url
    });
  } catch (error) {
    return res.status(400).json({
      message: "Bad Request",
      statusCode: 400
    });
  }
});

// Edit a Review
router.put('/:spotId/:userId/reviews/:id', async (req, res) => {
    const { id, spotId } = req.params;
    const userId = req.user.id;
    const { comment, stars } = req.body;

   

    try {
        // Check if the review exists
        const review = await Review.findByPk(id);
        // Log the entire review object
       

        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }


        //     // Proceed with the update
            const [updated] = await Review.update({ comment, stars }, { where: { id: id } });
            if (!updated) {
                console.log('Review not found');
                return res.status(404).json({ message: 'Review not found' });
            }

            // Fetch the updated review
            const updatedReview = await Review.findByPk(id);
            if (!updatedReview) {
                console.log('Review not found after update');
                return res.status(404).json({ message: 'Review not found after update' });
            }

            console.log('Updated review:', updatedReview);
            return res.status(200).json({ message: 'Review updated successfully', updatedReview });
  
    } catch (error) {
      console.error('Error updating review:', error);
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

// Delete a review
router.delete('/:reviewId', requireAuth, async (req, res) => {
    const reviewId = parseInt(req.params.reviewId, 10);
    const userId = req.user.id;

    try {
        const review = await Review.findOne({
            where: {
                id: reviewId,
                userId: userId
            }
        });
        
        if (!review) {
            return res.status(404).json({
                message: "Review couldn't be found",
                statusCode: 404
            });
        }

        await Review.destroy({
            where: {
                id: reviewId,
                userId: userId
            }
        });
        
        return res.status(200).json({
            message: "Successfully deleted",
            statusCode: 200
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error",
            statusCode: 500
        });
    }
});

// Delete an image for a review by ID
router.delete('/ReviewImages/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const image = await ReviewImage.findByPk(id);
        if (!image) {
            return res.status(404).json({ message: "ReviewImage couldn't be found" });
        }   

        // Fetch the review using reviewId from the image
        const review = await Review.findByPk(image.reviewId);
        if (!review || review.userId !== req.user.id) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to delete this image' });
        }
        
        await image.destroy(); // delete the image

        return res.status(200).json({ message: 'Image successfully deleted' });
    } catch (error) {
        console.error('Error deleting image:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
