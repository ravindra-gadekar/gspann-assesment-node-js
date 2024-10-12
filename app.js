const express = require('express');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
var cors = require('cors');
const helmet = require('helmet');
const sanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const { customErrorHandler, AppError } = require('./utils/errorHandler');

const app = express();

const limiter = rateLimit({
    max: 1000,
    window: 60 * 60 * 1000,
    message: 'we are recieved too many request from this IP, please try after 1 hour',
});
app.use(limiter);
app.use(cors());
app.use(
    helmet({
        crossOriginResourcePolicy: false,
    })
);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(sanitize());
app.use(xss());
app.use(hpp());

// Application Routings
const routes = require('./routes/routes');
app.use('/', routes);

app.all('*', (req, res, next) => {
    next(new AppError(`requested path ${req.originalUrl} is not found on this server!`, 404));
});
app.use(customErrorHandler);
module.exports = app;
