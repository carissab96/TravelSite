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
    .isEmail()
    .withMessage('Please provide a valid email.'),
  check('username')
    .exists({ checkFalsy: true })
    .isLength({ min: 4 })
    .withMessage('Please provide a username with at least 4 characters.'),
  check('username')
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
      // Check if user exists first
      const existingUser = await User.findOne({
        where: {
          [Op.or]: [
            { email: email },
            { username: username }
          ]
        }
      });

      if (existingUser) {
        return res.status(403).json({
          message: "User already exists",
          statusCode: 403,
          errors: {
            email: "User with that email already exists",
            username: "User with that username already exists"
          }
        });
      }

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
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          message: "Validation error",
          statusCode: 400,
          errors: {
            email: "Invalid email",
            username: "Username is required",
            firstName: "First Name is required",
            lastName: "Last Name is required",
            password: "Password is required"
          }
        });
      }
      
      // For any other errors, return 400
      return res.status(400).json({
        message: "Bad Request",
        statusCode: 400,
        errors: error.errors || { error: "An error occurred" }
      });
    }
  }
);  


module.exports = router;
