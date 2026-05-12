class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

const createError = (message, statusCode = 500, details) => new AppError(message, statusCode, details);

module.exports = { AppError, createError };
