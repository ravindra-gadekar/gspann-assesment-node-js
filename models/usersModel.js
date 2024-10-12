const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'please enter your name'],
    },
    email: {
        type: String,
        required: [true, 'please enter email address'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'email address format is not valid'],
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        minlength: 6,
    },
    passwordConfirm: {
        type: String,
        required: [true, 'confirm passeord is required'],
        validate: {
            // This only works on CREATE and SAVE!!!
            validator: function (el) {
                return el === this.password;
            },
            message: 'Passwords are not the same!',
        },
    },
    isActive: {
        type: Boolean,
        default: true,
        select: false,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false,
    },
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
});

userSchema.pre(/^find/, function (next) {
    this.find({ isActive: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (inputPassword, userPassword) {
    return await bcrypt.compare(inputPassword, userPassword);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
