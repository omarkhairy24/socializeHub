const authController = require('../controller/authController');
const userController = require('../controller/userController');
const router = require('express').Router();
const connectionRoute = require('./connectionRoute');

router.use('/:username',connectionRoute);

router.get('/all-users',userController.getAllUsers);

router.get('/search-user',userController.searchUser);

router.get('/user',userController.getUser);

router.post('/user-location',authController.protect,userController.userLocation);

router.put('/update-user-info/:username',authController.protect,userController.uploadUserImages,userController.resizeUserImages,userController.updateUserInfo);

router.delete('/delete-user',authController.protect,userController.deleteUser);

module.exports = router;