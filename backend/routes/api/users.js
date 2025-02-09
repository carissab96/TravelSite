const express = require('express');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');

const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateSignup = [
  check('email')
    .exists({ checkFalsy: true })
    .withMessage('Please provide an email.')
    .isEmail()
    .withMessage('The provided email is invalid.')
    .custom(async (value) => {
      const existingUser = await User.findOne({ where: { email: value } });
      if (existingUser) {
        throw new Error('The provided email is already in use.');
      }
      return true;
    }),
  check('username')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a username.')
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.')
    .custom(async (value) => {
      const existingUser = await User.findOne({ where: { username: value } });
      if (existingUser) {
        throw new Error('This username is already taken.');
      }
      return true;
    })
    .not()
    .isEmail()
    .withMessage('Username cannot be an email.'),
  check('firstName')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a first name.'),
  check('lastName')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a last name.'),
  check('password')
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be 6 characters or more.'),
  handleValidationErrors
];

// Sign up
router.post(
  '/',
  validateSignup,
  async (req, res) => {
    const { email, password, username, firstName, lastName } = req.body;

    try {

      const hashedPassword = bcrypt.hashSync(password);
      const user = await User.create({ 
        email, 
        username, 
        hashedPassword,
        firstName,
        lastName
      });

      const safeUser = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
      };

      await setTokenCookie(res, safeUser);

      return res.status(201).json({
        user: safeUser
      });
    } catch (error) {
      console.error('Error with user operation:', error);
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
      if (error.name === 'SequelizeUniqueConstraintError') {
        const errors = error.errors.map(err => ({
          field: err.path,
          message: `${err.path} is already in use`
        }));
        return res.status(400).json({
          message: 'Validation error',
          errors
        });
      }
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  }
);  


module.exports = router;
