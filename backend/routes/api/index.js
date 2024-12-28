// backend/routes/api/index.js
const express = require('express');
const router = require('express').Router();
const sessionRouter = require('./session');
const usersRouter = require('./users');
const spotsRouter = require('./spots');

const { restoreUser } = require("../../utils/auth");

// Connect restoreUser middleware to the API router
  // If current user session is valid, set req.user to the user in the database
  // If current user session is not valid, set req.user to null
router.use(restoreUser);

router.use('/session', sessionRouter);

router.use('/users', usersRouter);

router.use('/spots', spotsRouter);

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Test route is working!' });
});

router.post('/test', (req, res) => {
  try {
    res.json({ requestBody: req.body });
  } catch (err) {
    res.status(500).json({ error: 'Error processing request body' });
  }
});


module.exports = router;
