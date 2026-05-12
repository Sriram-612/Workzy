const { ZodError } = require('zod');
const { AppError } = require('../utils/errors');

function errorHandler(error, req, res, next) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      message: 'Validation failed',
      details: error.errors.map((item) => ({
        path: item.path.join('.'),
        message: item.message
      }))
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      details: error.details
    });
  }

  console.error(error);
  return res.status(500).json({ message: 'Internal server error' });
}

module.exports = { errorHandler };
