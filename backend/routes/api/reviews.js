const express = require('express');
const { Op } = require('sequelize'); // Import Op for query operators
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('../../utils/auth'); // Middleware for authentication
const { Review } = require('../../db/models/');
const { Spot, SpotImage } = require('../../db/models/');
const { User } = require('../../db/models/');

const router = express.Router();
// Middleware for logging incoming requests
router.use((req, res, next) => {
    console.log(`[reviews.js] ${req.method} ${req.url}`);
    next();
});

router.use(requireAuth); // Ensure this is applied before the route

// Create a review
router.post('/:spotId/reviews', async (req, res) => {
    console.log('Attempting to create a review.');
    
    const userId = req.user ? req.user.id : null;
    const { spotId } = req.params;
    const { comment, stars } = req.body;

    console.log({ userId, spotId, comment, stars });

    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ message: 'Validation errors', errors: errors.array() });
    }

    try {
        // Check if the spot exists
        const spot = await Spot.findByPk(spotId);
        console.log('Spot:', spot);
        if (!spot) {
            return res.status(404).json({ message: 'Spot not found' });f
        }

        // Check if the user has already reviewed this spot
        const existingReview = await Review.findOne({ where: { spotId, userId: req.user.id } });
        console.log('Existing review:', existingReview);
        if (existingReview) {
            return res.status(403).json({ message: 'Review already exists for this spot from the current user' });
        }

        // Create the review
        const review = await Review.create({
            userId,
            spotId,
            comment,
            stars,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        console.log('Created review:', review);

        // Return the created review
        return res.status(201).json({
            id: review.id,
            userId: review.userId,
            spotId: review.spotId,
            comment: review.comment,
            stars: review.stars,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
        });
    } catch (error) {
        console.error('Error adding review:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Get all reviews for the current user
router.get('/user/reviews', async (req, res) => {
    const userId = req.user.id; 
    try {
        const reviews = await Review.findAll({ where: { userId } });
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user reviews', error });
    }
});
// all reviews for a specific spot
router.get('/:spotId/reviews', async (req, res) => {
    const { spotId } = req.params;

    try {
        const reviews = await Review.findAll({ where: { spotId } });
        res.status(200).json({ reviews });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving reviews', error });
    }
});

// Update a review
router.put('/:spotId/reviews/:reviewId', async (req, res) => {
    const { reviewId } = req.params;
    const { reviewText, rating } = req.body;

    try {
        const [updated] = await Review.update({ reviewText, rating }, { where: { id: reviewId } });
        if (!updated) {
            return res.status(404).json({ message: 'Review not found' });
        }
        const updatedReview = await Review.findByPk(reviewId);
        res.status(200).json({ message: 'Review updated successfully', updatedReview });
    } catch (error) {
        res.status(500).json({ message: 'Error updating review', error });
    }
});

// Delete a review
router.delete('/:spotId/reviews/:reviewId', async (req, res) => {
    const { reviewId } = req.params;

    try {
        const deleted = await Review.destroy({ where: { id: reviewId } });
        if (!deleted) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(204).send(); // No content to send back
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
});

// Upload an image for a review
router.post('/:spotId/reviews/:reviewId/images', async (req, res) => {
    const { reviewId } = req.params;
    const imagePath = req.body.imagePath; // Assume the image path is sent in the request body

    try {
        const updatedReview = await Review.findByPk(reviewId);
        if (!updatedReview) {
            return res.status(404).json({ message: 'Review not found' });
        }
        updatedReview.images = [...(updatedReview.images || []), imagePath]; // Assuming images is an array
        await updatedReview.save();
        res.status(201).json({ message: 'Image uploaded successfully', updatedReview });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error });
    }
});

module.exports = router;