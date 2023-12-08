const Post = require('../model/postModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');
const multer = require('multer');
const sharp = require('sharp');
const Comment = require('../model/commentModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('the file is not image.',400),false)
    }
}

const upload = multer({
    storage:multerStorage,
    fileFilter:multerFilter
})

exports.uploadImages = upload.fields([
    {name:'pics',maxCount:10}
])


exports.formatPics = catchAsync(async(req,res,next)=>{
    if(!req.files.pics) return next();
    req.body.pics = [];
    await Promise.all(
        req.files.pics.map(async (file,i)=>{
            const filename = `post-${req.user.username}-${Date.now()}-${i + 1}.jpeg`
            await sharp(file.buffer)
            .toFormat('jpeg')
            .jpeg({quality:90})
            .toFile(`public/img/posts/${filename}`);
            req.body.pics.push(filename)
        })
    )
    next();
})

exports.createPost = catchAsync(async (req,res,next)=>{
    if(!req.user.id){
        return next(new AppError('no token provided',498));
    }
    const post = await Post.create({
        user:req.user.id,
        text:req.body.text,
        pics:req.body.pics
    })
    res.status(200).json({
        status:'success',
        data:{
            post
        }
    })
});

exports.updatePost = catchAsync(async(req,res,next)=>{
    const post = await Post.findById(req.body.id);
    if(post.user.id.toString() !== req.user.id){
        return next(new AppError('not allowed',403))
    }
    await Post.findByIdAndUpdate(req.body.id,req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        status:'success',
        data:{
            post
        }
    })
});

exports.deletePost = catchAsync(async (req,res,next)=>{
    const post = await Post.findById(req.body.id);
    if(post.user.id.toString() !== req.user.id){
        return next(new AppError('not allowed',403))
    }
    await Post.findByIdAndDelete(req.body.id);
    await Comment.deleteMany({post:req.body.id})
    res.status(200).json({
        status:'success',
        message:'post deleted successfully'
    })
});

exports.Like = catchAsync(async (req,res,next) =>{
    const post = await Post.findById(req.body.id);
    const arr = post.likedBy.some(fn =>{
        if(fn.equals(req.user.id)){
            return post.likedBy.pull(fn)
        }
    });
    if(arr === false){
        post.likedBy.push(req.user.id)
    }
    await post.save();
    const isLiked = post.isLiked(req.user.id);
    res.status(200).json({
        status:'success',
        data:{
            post,
            isLiked
        }
    })
});

exports.getPost = catchAsync(async(req,res,next)=>{
    const post = await Post.findById(req.params.id).populate('comments');
    const isLiked = post.isLiked(req.user.id);
    const comments = await Comment.find({post:req.params.id});
    const commentsWithLike = comments.map(comment =>({
        ...comment.toObject(),
        isLiked:comment.isLiked(req.user.id)
    }))
    post.comments = commentsWithLike
    res.status(200).json({
        status:'success',
        data:{
            post,
            isLiked
        }
    })
})