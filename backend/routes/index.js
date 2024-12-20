// backend/routes/index.js
const express = require('express');
const router = express.Router();

// Add a root route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TravelSite API! Server is running.',
    endpoints: {
      csrf: '/api/csrf/restore',
      login: '/api/session',
      signup: '/api/users',
      spots: '/api/spots'
    } // Add more endpoints here
  });
});

// Add a XSRF-TOKEN cookie
router.get("/api/csrf/restore", (req, res) => {
  const csrfToken = req.csrfToken();
  res.cookie("XSRF-TOKEN", csrfToken);
  res.status(200).json({
    'XSRF-Token': csrfToken
  });
});

const apiRouter = require('./api');
router.use('/api', apiRouter);

router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

module.exports = router;
