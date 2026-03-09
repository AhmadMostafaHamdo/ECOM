/**
 * Helper to wrap async express routes and pass errors to the global error handler.
 */
exports.asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Global Error Handler Middleware
 */
exports.errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    // Mongoose bad ObjectId
    if (err.name === "CastError") {
        message = `Resource not found with id of ${err.value}`;
        statusCode = 404;
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        message = "Duplicate field value entered";
        statusCode = 400;
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        message = Object.values(err.errors).map(val => val.message);
        statusCode = 400;
    }

    console.error(`[Error] ${req.method} ${req.url} - ${statusCode}: ${message}`);
    if (process.env.NODE_ENV === "development") {
        console.error(err.stack);
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
};
