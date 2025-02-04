// backend/utils/validation.js
const { validationResult } = require('express-validator');

// middleware for formatting errors from express-validator middleware
// (to customize, see express-validator's documentation)
const handleValidationErrors = (req, _res, next) => {
  console.log('Validation middleware:', req.body);
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log('Validation errors:', validationErrors.array());
  }

  if (!validationErrors.isEmpty()) { 
    const errors = {};
    validationErrors
      .array()
      .forEach(error => errors[error.path] = error.msg);

    const err = Error("Bad request.");
    err.errors = errors;
    err.status = 400;
    err.title = "Bad request.";
    return next(err);
  }
  return next();
};



module.exports = {
  handleValidationErrors
};
