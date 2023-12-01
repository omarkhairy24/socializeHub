const router = require('express').Router();
const authController = require('../controller/authController');

router.post('/signup',authController.signup);

router.post('/confirm-signup/:username',authController.confirmSignup);

router.post('/login',authController.login);

router.post('/forget-password',authController.forgetPassword);

router.put('/reset-password',authController.resetPassword);

router.put('/update-password',authController.protect,authController.updatePassword);

module.exports = router