// backend/routes/api/session.js
const express = require('express');
const { Op } = require('sequelize');
const { sequelize } = require('../../db/models');
const bcrypt = require('bcryptjs');
const { setTokenCookie, restoreUser } = require('../../utils/auth');
const { User } = require('../../db/models');


const router = express.Router();
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');

const validateLogin = [
  (req, res, next) => {
    console.log('Validating request:', req.body);
    next();
  },
  check('credential')
    .exists({ checkFalsy: true })
    .notEmpty()
    .withMessage('Please provide a valid email or username.'),
  check('password')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a password.'),
  handleValidationErrors
];

// Log in
router.post(
  '/',
  validateLogin,
  async (req, res, next) => {
    const { credential, password } = req.body;
    const user = await User.scope('loginUser').findOne({
      where: {
        [Op.or]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('username')), sequelize.fn('LOWER', credential)),
          sequelize.where(sequelize.fn('LOWER', sequelize.col('email')), sequelize.fn('LOWER', credential))
        ]
      }
    });

    // Invalid credentials
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
        statusCode: 401,
        errors: {
          credential: "The provided credentials were invalid."
        }
      });
    }

    // Check password
    const isValidPassword = bcrypt.compareSync(password, user.hashedPassword.toString());
    if (!isValidPassword) {
      return res.status(401).json({
        message: "Invalid credentials",
        statusCode: 401,
        errors: {
          credential: "The provided credentials were invalid."
        }
      });
    }

    const safeUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      username: user.username,
    };

    await setTokenCookie(res, safeUser);

    return res.json({
      user: safeUser
    });
  }
);

// Log out
router.delete(
  '/',
  (_req, res) => {
    res.clearCookie('token');
    return res.json({ message: 'success' });
  }
);

// Restore session user
router.get(
  '/',
  (req, res) => {
    const { user } = req;
    if (user) {
      const safeUser = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
      return res.json({
        user: safeUser
      });
    } else return res.json({ user: null });
  }
);

module.exports = router;
