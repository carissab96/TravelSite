const express = require('express');
const { Op } = require('sequelize');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');
const { Booking, Spot, User } = require('../../db/models');

const router = express.Router();

const validateBooking = [
  check('startDate')
    .exists({ checkFalsy: true })
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  check('endDate')
    .exists({ checkFalsy: true })
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  handleValidationErrors
];

// Get all of the Current User's Bookings
router.get('/current', requireAuth, async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Spot,
          attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price']
        }
      ]
    });

    return res.json({ Bookings: bookings });
  } catch (error) {
    return res.status(400).json({
      message: "Couldn't find bookings",
      statusCode: 400
    });
  }
});

// Create a Booking for a Spot
router.post('/spots/:spotId/bookings', requireAuth, validateBooking, async (req, res) => {
  const { startDate, endDate } = req.body;
  const { spotId } = req.params;
  const userId = req.user.id;

  try {
    // Check if spot exists
    const spot = await Spot.findByPk(spotId);
    if (!spot) {
      return res.status(404).json({
        message: "Spot couldn't be found",
        statusCode: 404
      });
    }

    // Check if user owns the spot
    if (spot.ownerId === userId) {
      return res.status(403).json({
        message: "Cannot book your own spot",
        statusCode: 403
      });
    }

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      where: {
        spotId,
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          },
          {
            endDate: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        statusCode: 403,
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking"
        }
      });
    }

    const booking = await Booking.create({
      spotId: parseInt(spotId),
      userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    return res.status(201).json(booking);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        statusCode: 400,
        errors: {
          startDate: "Start date must be in the future",
          endDate: "End date must be after start date"
        }
      });
    }
    return res.status(400).json({
      message: "Bad Request",
      statusCode: 400
    });
  }
});

// Edit a Booking
router.put('/:bookingId', requireAuth, validateBooking, async (req, res) => {
  const { startDate, endDate } = req.body;
  const { bookingId } = req.params;
  const userId = req.user.id;

  try {
    const booking = await Booking.findByPk(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        message: "Booking couldn't be found",
        statusCode: 404
      });
    }

    // Check if booking belongs to current user
    if (booking.userId !== userId) {
      return res.status(403).json({
        message: "Forbidden",
        statusCode: 403
      });
    }

    // Can't edit a booking that's past the end date
    if (new Date(booking.endDate) < new Date()) {
      return res.status(403).json({
        message: "Past bookings can't be modified",
        statusCode: 403
      });
    }

    // Check for booking conflicts
    const conflictingBooking = await Booking.findOne({
      where: {
        id: { [Op.ne]: bookingId },
        spotId: booking.spotId,
        [Op.or]: [
          {
            startDate: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          },
          {
            endDate: {
              [Op.between]: [new Date(startDate), new Date(endDate)]
            }
          }
        ]
      }
    });

    if (conflictingBooking) {
      return res.status(403).json({
        message: "Sorry, this spot is already booked for the specified dates",
        statusCode: 403,
        errors: {
          startDate: "Start date conflicts with an existing booking",
          endDate: "End date conflicts with an existing booking"
        }
      });
    }

    await booking.update({
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });

    return res.json(booking);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        statusCode: 400,
        errors: {
          startDate: "Start date must be in the future",
          endDate: "End date must be after start date"
        }
      });
    }
    return res.status(400).json({
      message: "Bad Request",
      statusCode: 400
    });
  }
});

// Delete a Booking
router.delete('/:bookingId', requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  try {
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: Spot }]
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking couldn't be found",
        statusCode: 404
      });
    }

    // Check if user owns the booking or the spot
    if (booking.userId !== userId && booking.Spot.ownerId !== userId) {
      return res.status(403).json({
        message: "Forbidden",
        statusCode: 403
      });
    }

    // Can't delete a booking that's already started
    if (new Date(booking.startDate) <= new Date()) {
      return res.status(403).json({
        message: "Bookings that have been started can't be deleted",
        statusCode: 403
      });
    }

    await booking.destroy();

    return res.json({
      message: "Successfully deleted",
      statusCode: 200
    });
  } catch (error) {
    return res.status(400).json({
      message: "Bad Request",
      statusCode: 400
    });
  }
});

module.exports = router;
