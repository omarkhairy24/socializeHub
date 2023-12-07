const router = require('express').Router();
const authController = require('../controller/authController');
const commentController = require('../controller/commentController');

router.post('/:id',authController.protect,commentController.uploadPhoto,commentController.addComment);

module.exports = router;