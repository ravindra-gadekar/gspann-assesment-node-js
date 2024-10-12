class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

const asyncErrorHandler = (func) => {
    return (req, res, next) => {
        func(req, res, next).catch((err) => {
            next(err);
        });
    };
};
const customErrorHandler = (err, req, res, next) => {
    // Set default error properties if not provided
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    res.status(err.statusCode).json({
        status: err.status,
        message: err.message || 'Something went wrong!',
    });
};

module.exports = { AppError, customErrorHandler, asyncErrorHandler };
