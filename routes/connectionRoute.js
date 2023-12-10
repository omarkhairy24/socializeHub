const router = require('express').Router({mergeParams:true});
const authController = require('../controller/authController');
const connectionController = require('../controller/connectionController');

router.get('/requests',authController.protect,connectionController.getRequests);

router.get('/near-suggestions',authController.protect,connectionController.getNearSuggestions);

router.get('/suggestions',authController.protect,connectionController.getFriendsSuggestions);

router.post('/request',authController.protect,connectionController.sendRequest);

router.post('/accept-request',authController.protect,connectionController.acceptRequest);

router.delete('/delete-request',authController.protect,connectionController.rejectRequest);

module.exports = router