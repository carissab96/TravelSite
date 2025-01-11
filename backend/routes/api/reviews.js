const express = require('express');
const { Op } = require('sequelize'); // Import Op for query operators
const { check, validationResult } = require('express-validator');
const { requireAuth } = require('../../utils/auth'); // Middleware for authentication
const { Review } = require('../../db/models/');
const { Spot, SpotImage } = require('../../db/models/');
const { User } = require('../../db/models/');
const { ReviewImage } = require('../../db/models/');

const router = express.Router();

// Middleware for logging incoming requests
router.use((req, res, next) => {
    console.log(`[reviews.js] ${req.method} ${req.url}`);
    next();
});

// Authentication middleware
router.use(requireAuth); // Ensure this is applied before the routes

router.get('/test', (req, res) => {
    res.json({ message: 'Auth successful, route reached!' });
});

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
            return res.status(404).json({ message: 'Spot not found' });
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

/// Get all reviews for the current user
router.get('/user/reviews', async (req, res) => {
    const userId = req.user.id; // Assuming req.user is set by your authentication middleware

    console.log('User ID:', userId);
    
    try {
        const reviews = await Review.findAll({
            where: { userId },
            include: [{ model: Spot, 
                attributes: ['id', 'name', 'ownerId', 'address', 'city', 'state', 'country'

                ]
             }] 
        });

        return res.status(200).json({ reviews });
    } catch (error) {
        console.error('Error retrieving user reviews:', error);
        return res.status(500).json({ message: 'Error retrieving user reviews', error });
    }
});
// Get all reviews for a specific spot
router.get('/:spotId/reviews', async (req, res) => {
    const { spotId } = req.params;

    console.log('Spot ID:', spotId);

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

// Update a review
router.put('/:spotId/:userId/reviews/:id', async (req, res) => {
    const { id, spotId } = req.params;
    const userId = req.user.id;
    const { comment, stars } = req.body;

    console.log(`Attempting to update review ${id} for spot ${spotId} which belongs to ${userId} with comment ${comment} and ${stars} stars`);

    try {
        // Check if the review exists
        const review = await Review.findByPk(id);
        // Log the entire review object
        console.log('Review object:', review);

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
        return res.status(500).json({ message: 'Error updating review', error });
    }
});


// Delete a review
router.delete('/:spotId/:userId/reviews/:id', async (req, res) => {
    const { id } = req.params;
    const { spotId } = req.params;
    const userId = req.user.id;

    console.log(`Attempting to delete review ${id} for spot ${spotId} which belongs to ${userId}`);

    try {
        const deleted = await Review.destroy({ where: { id: id } });
        if (!deleted) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(204).send(); // No content to send back
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
});

// add an image to a review by ID
router.post('/:reviewId/images', async (req, res) => {
    const { reviewId } = req.params; //Review id

    const { image_url } = req.body;

if (!image_url) {
    return res.status(400).json({ message: 'Invalid input' });
}
try {
    //Find the review by ID
    const review = await Review.findByPk(reviewId);

    //check if review exists
    if (!review) {
        return res.status(404).json ({ message: "Review couldn't be found" });
    }

    //check if the current user is the owner of the review
    if (review.userId !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden: You do not have permission to add an image to this review' });
    }
    //create the new image in the database
    const newImage = await ReviewImage.create({ reviewId: review.id, image_url });

    //Return the newly created image
    return res.status(201).json({
        id: newImage.id,
        image_url: newImage.image_url,
    });

} catch (error) {
    console.error('Error adding image to review:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
}
});

//Edit an image for a review by ID
router.put('/reviews/:id/reviews/images/:imageId',
    async (req, res) => {
        const { id, imageId } = req.params;
        const { image_url } = req.body;
    
        try {
            const imageId = await Review.findByPk(id);
            if (!ReviewImage) {
                return res.status(404).json({ message: "Review couldn't be found" });
            }
            const image = await ReviewImage.findByPk(id);
            if (!image) {
                return res.status(404).json({ message: "Image couldn't be found" });
            }

            //check if the current user is the owner of the review. 
            if(review.userId !== req.user.id) {
                return res.status(403).json({ messsage: 'Forbidden: You do not have permission to edit this image' });
            }

            //update the image
            const updatedImage = await image.update({ image_url });

            return res.status(200).json({ 
                id: updatedImage.id,
                image_url: updatedImage.image_url,
            });

        } catch (error) {
            console.error('Error updating image:', error);
            
        return res.status(500).json({ message: 'Internal Server Error' });  
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

//test route
router.get('/test', (res, req) => {
    res.json({ message: 'Test route in spots is working!'});
});
    

    module.exports = router;
