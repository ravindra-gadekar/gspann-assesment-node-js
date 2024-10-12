const { asyncErrorHandler, AppError } = require('../utils/errorHandler');
const User = require('./../models/usersModel');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const createJWTToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: +process.env.JWT_EXPIRES_IN,
    });
};

exports.isTokenValid = asyncErrorHandler(async (req, res, next) => {
    let token;
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return next(new AppError('authorization failed ! token is missing', 400));

    const decodedToken = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    const loginUser = await User.findById(decodedToken.id).select('-password -__v');
    if (!loginUser) return next(new AppError('authorization failed ! user not found.', 401));
    next();
});

exports.signIn = asyncErrorHandler(async (req, res, next) => {
    // check email & password fields
    const { email, password } = req.body;
    if (!email || !password) return next(new AppError('please enter email and passwrod !', 400));

    // check user is exits for given email
    const user = await User.findOne({ email }).select('+password +isActive');

    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('incorrect email or password', 401));
    }
    if (!user.isActive) return next(new AppError('user is inactive', 401));
    // create JWT token
    const token = await createJWTToken(user._id);

    // set token in cookie
    /**
        res.cookie('token', token, {
            expires: new Date(
                Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
            ),
            httpOnly: true,
            secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });
    */

    res.status(200).json({
        status: 'Success',
        message: 'You are sign in successefully !',
        data: {
            token,
        },
    });
});

exports.signUp = asyncErrorHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);
    const resFields = { name: newUser.name, email: newUser.email, role: newUser.role };
    res.status(201).json({
        status: 'Success',
        message: 'user created successfully !',
        data: {
            user: resFields,
        },
    });
});

exports.isAuthorized = asyncErrorHandler(async (req, res, next) => {
    res.status(200).json({
        status: 'suucess',
        message: 'authorization successful !',
    });
});
