const Comment = require('../model/commentModel');
const Reply = require('../model/ReplyModel');
const Post = require('../model/postModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');
const multer = require('multer');

const multerStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/img/comment')
    },
    filename:(req,file,cb)=>{
        cb(null,`comment-${req.params.id}-${req.user.username}-${Date.now()}-${file.originalname}`)
    }
})

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

exports.uploadPhoto = upload.single('photo');

exports.addComment = catchAsync(async (req,res,next)=>{
    let photo = req.body.photo
    if(req.file){
        photo = req.file.filename
    }
    const post = await Post.findById(req.params.id);
    if(!post){
        return next(new AppError('no post found',404));
    }
    const comment = await Comment.create({
        user:req.user.id,
        post:req.params.id,
        text:req.body.text,
        photo:photo
    })
    res.status(201).json({
        status:'success',
        data:{
            comment
        }
    })
});

exports.updateComment = catchAsync(async (req,res,next) =>{
    let photo = req.body.photo
    if(req.file){
        photo = req.file.filename
    }
    const post = await Post.findById(req.params.id);
    const comment = await Comment.findById(req.body.id);
    if(!comment){
        return next(new AppError('no comment found',404));
    }
    if(!post || comment.post._id.toString() !== req.params.id){
        return next(new AppError('bad request.',400));
    }
    if(comment.user._id.toString() !== req.user.id){
        return next(new AppError('not authorized.',403));
    }
    await Comment.findByIdAndUpdate(req.body.id,{
        text:req.body.text,
        photo:photo
    },{new:true , runValidators:true});
    res.status(200).json({
        status:'success',
        data:{
            comment
        }
    })
});

exports.deleteComment = catchAsync(async (req,res,next) =>{
    const post = await Post.findById(req.params.id);
    const comment = await Comment.findById(req.body.id);
    if(!comment) return next(new AppError('no comment found',404));
    if(!post || comment.post._id.toString() !== req.params.id) return next(new AppError('bad request.',400));
    if(comment.user._id.toString() !== req.user.id) return next(new AppError('not authorized.',403));

    await Comment.findByIdAndDelete(req.body.id);
    res.status(200).json({
        status:'success'
    })
});

exports.Like = catchAsync(async (req,res,next) =>{
    const post = await Post.findById(req.params.id);
    const comment = await Comment.findById(req.body.id);
    if(!comment) return next(new AppError('no comment found',404));
    if(!post || comment.post._id.toString() !== req.params.id) return next(new AppError('bad request.',400));

    const arr = comment.likedBy.some(fn =>{
        if(fn.equals(req.user.id)){
            return comment.likedBy.pull(fn)
        }
    });
    if(arr === false){
        comment.likedBy.push(req.user.id)
    }
    await comment.save();
    const isLiked = comment.isLiked(req.user.id);
    res.status(200).json({
        status:'success',
        data:{
            comment,
            isLiked
        }
    })
});

exports.getComment = async(req,res,next)=>{
    const comment = await Comment.findById(req.body.id);
    const isLiked = comment.isLiked(req.user.id)
    res.status(200).json({
        comment,
        isLiked
    })
}

exports.getComments = catchAsync(async (req,res,next)=>{
    const comments = await Comment.find();
    const commentswl = comments.map(comment =>({
        ...comment.toObject(),
        isLiked:comment.isLiked(req.user.id)
    }))
    res.status(200).json({
        commentswl
    })
});

exports.addReply = catchAsync(async(req,res,next)=>{
    const photo = req.body.photo;
    if(req.file){
        photo = req.file.filename
    }
    const comment = await Comment.findById(req.body.id);
    if(!comment) return next(new AppError('comment not found',404));

    const reply = await Reply.create({
        comment:req.body.id,
        user:req.user.id,
        text:req.body.text,
        photo:photo
    })
    res.status(201).json({
        status:'success',
        data:{
            reply
        }
    })
})

exports.editReply = catchAsync(async (req,res,next)=>{
    let photo = req.body.photo;
    if(req.file){
        photo = req.file.filename
    }
    const reply = await Reply.findById(req.body.id);
    if(!reply) return next(new AppError('not found',404));
    if(reply.user._id.toString() !== req.user.id) return next(new AppError('not authorized',403));

    await Reply.findByIdAndUpdate(req.body.id,{
        text:req.body.text,
        photo:photo
    },{new:true , runValidators:true})

    res.status(200).json({
        status:'success',
        data:{
            reply
        }
    })
});

exports.deletReply = catchAsync(async (req,res,next)=>{
    const reply = await Reply.findById(req.body.id);
    if(!reply) return next(new AppError('not found',404));
    if(reply.user._id.toString() !== req.user.id) return next(new AppError('not authorized',403));
    await Reply.findByIdAndDelete(req.body.id);
    res.status(200).json({
        status:'success'
    })
})