const authController = require('../controller/authController');
const userController = require('../controller/userController');
const router = require('express').Router();

router.put('/update-user-info/:username',authController.protect,userController.uploadUserImages,userController.resizeUserImages,userController.updateUserInfo);

router.delete('/delete-user',authController.protect,userController.deleteUser);

module.exports = router;