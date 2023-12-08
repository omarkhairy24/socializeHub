const router = require('express').Router();
const authController = require('../controller/authController');
const commentController = require('../controller/commentController');

router.get('/comment',authController.protect,commentController.getComment);

router.get('/comments',authController.protect,commentController.getComments);

router.post('/:id',authController.protect,commentController.uploadPhoto,commentController.addComment);

router.post('/:id/comment/reply',authController.protect,commentController.uploadPhoto,commentController.addReply);

router.patch('/comment/reply',authController.protect,commentController.uploadPhoto,commentController.editReply);

router.patch('/:id/comment/like',authController.protect,commentController.Like);

router.patch('/:id/edit-comment',authController.protect,commentController.uploadPhoto,commentController.updateComment);

router.delete('/:id/delet-comment',authController.protect,commentController.deleteComment); 

router.delete('/comment/reply',authController.protect,commentController.deletReply);

module.exports = router;