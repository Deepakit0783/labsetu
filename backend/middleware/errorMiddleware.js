
const errorMiddleware = (err, req, res, next) => {
  console.error("API Error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((item) => item.message)
      .join(", ");
  }

  // Invalid MongoDB document ID
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format";
  }

  // Duplicate unique field, such as email
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = field
      ? `${field} already exists`
      : "Duplicate value already exists";
  }

  // Invalid JSON request body
  if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    statusCode = 400;
    message = "Invalid JSON request body";
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "Internal server error"
        : message,
  });
};

module.exports = errorMiddleware;
