// backend/routes/index.js
const express = require('express');
const router = express.Router();

// Middleware for logging incoming requests
router.use((req, res, next) => {
    console.log(`[index.js]${req.method} ${req.url}`);
    next();
});

// Add a root route
router.get('/', (req, res) => {
  res.json({
    message: 'Welcome to TravelSite API! Server is running.',
    endpoints: {
      csrf: '/api/csrf/restore',
      login: '/api/session',
      signup: '/api/users',
      spots: '/api/spots',
      reviews: '/api/reviews'
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
//Add a XSRF-TOKEN cookie in development
if (process.env.NODE_ENV !== 'production') {
  router.get('/api/csrf/restore', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.json({});
  });
}

const apiRouter = require('./api');
router.use('/api', apiRouter);

//Static Routes
//Serve react build files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  //Serve the frontend'sindex.html file at the root route
  router.get('/', (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
    );
  });
  //Serve the static assests in teh frontend's build folder
  router.use(express.static(path.resolve("../frontend/dist")));
  
  //Serve the frontend's index.hjtml file at all other routes NOT starting with /api
  router.get(/^\/(?!api).*/, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken());
    return res.sendFile(
      path.resolve(__dirname, '../../frontend', 'dist', 'index.html')
    );
  });
}
router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});



module.exports = router;
