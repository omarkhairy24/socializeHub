const Comment = require('../model/commentModel');
const Post = require('../model/postModel');
const catchAsync = require('../util/catchAsync');
const AppError = require('../util/AppError');
const multer = require('multer');

const multerStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public/img/comment')
    },
    filename:(req,file,cb)=>{
        cb(null,`comment-${req.params.id}-${req.user.id}-${Date.now()}-${file.originalname}`)
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
    const post = await Post.findById(req.params.id);
    if(!post){
        return next(new AppError('no post found',400))
    }
    const comment = await Comment.create({
        user:req.user.id,
        post:req.params.id,
        text:req.body.text,
        photo:req.file.filename
    })
    res.status(201).json({
        status:'success',
        data:{
            comment
        }
    })
})