const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authController');
router
    .route('/')
    .get((req, res) => {
        res.status(200).json({
            status: 'Success',
            message: 'request is recieved !',
        });
    })
    .post((req, res) => {
        console.log(req);
    });

router.route('/signup').post(authController.signUp);
router.route('/signin').post(authController.signIn);
router.route('/isauthorized').post(authController.isTokenValid, authController.isAuthorized);
module.exports = router;
