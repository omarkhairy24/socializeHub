const router = require('express').Router();
const authController = require('../controller/authController');
const postController = require('../controller/postController');

router.get('/post/:id',postController.getPost);

router.patch('/likes',authController.protect,postController.Like);

router.post('/add-post',authController.protect,postController.uploadImages,postController.formatPics,postController.createPost);

router.patch('/edit-post',authController.protect,postController.uploadImages,postController.formatPics,postController.updatePost);

router.delete('/delete-post',authController.protect,postController.deletePost);

module.exports = router