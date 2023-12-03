const User = require('../model/userModel');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

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
});

exports.uploadUserImages = upload.fields([
    {name:'image',maxCount:1},
    {name:'imageCover',maxCount:1}
]);

exports.resizeUserImages = catchAsync(async (req,res,next)=>{
    if(!req.files.image || !req.files.imageCover) return next();
    
    req.body.image = `image-${req.params.username}-${Date.now()}-profile.jpeg`;
    await sharp(req.files.image[0].buffer)
    .resize(400,400)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/user/${req.body.image}`);
    

    req.body.imageCover = `image-${req.params.username}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
    .resize(851,315)
    .toFormat('jpeg')
    .jpeg({quality:90})
    .toFile(`public/img/user/${req.body.imageCover}`);

    next();

});


exports.getAllUsers = catchAsync(async(req,res,next)=>{
    const users = await User.find({active:true});
    res.status(200).json({
        status:'success',
        data:{
            users
        }
    })
})

exports.updateUserInfo = catchAsync(async (req,res,next)=>{
    if(req.body.password ||req.body.confirmPassword){
        return next(new AppError('not allowed to update password',401))
    };
    const user = await User.findByIdAndUpdate(req.user.id,req.body,{
        new:true,
        runValidators:true
    });
    res.status(200).json({
        status:'success',
        data:{
            user
        }
    })
});

exports.deleteUser = catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
    if(! (await bcrypt.compare(req.body.password,user.password))){
        return next(new AppError('the password is not correct,try again',401))
    }
    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({
        status:'success',
        message:'user deleted successfully'
    })
});

exports.searchUser = catchAsync(async (req,res,next)=>{
    const search = req.query.search;
    const results = await User.find({
        $or:[
            {name:{$regex:search,$options:"xi"}},
            {username:{$regex:search,$options:"xi"}}
        ]
    })
    res.status(200).json({
        status:'success',
        data:{
            results,
            resultLength : results.length
        }
    })
})