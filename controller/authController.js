const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const {promisify} = require('util');
const bcrypt = require('bcryptjs');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');
const crypto = require('crypto');
const sendEmail = require('../email');

const signToken = id=>{
    return jwt.sign({id},process.env.JWTSECRET,{
        expiresIn:'90d'
    })
};

const createSendToken = (user,statusCode,res)=>{
    const token = signToken(user._id);
    user.password = undefined;
    res.status(statusCode).json({
        status:'success',
        token,
        data:{
            user
        }
    })
};

exports.signup = catchAsync(async (req,res,next)=>{
    
    const existUser = await User.findOne({email:req.body.email});
    if(existUser && existUser.active === false){
        await User.findOneAndDelete({email:req.body.email})
    }

    const user = await User.create({
        username:req.body.username,
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.password,
        gender:req.body.gender
    })
    const token = user.createRegisterToken();
    await user.save({validateBeforeSave:false})
    const message = `${token} is your register key`
    try {
        await sendEmail({
            email:user.email,
            subject:'your register token',
            text:message
        })
        res.status(200).json({
            status:'success',
            message:'register key sent to your email'
        })

    } catch (error) {
        user.registerToken = undefined;
        await user.save({validateBeforeSave:false});
        next(error)
    }

});

exports.confirmSignup = catchAsync(async(req,res,next)=>{
    const registerToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({username:req.params.username});
    if(user.registerToken.token === registerToken){
        user.active = true;
        user.registerToken = undefined;
        await user.save({validateBeforeSave:false});
        createSendToken(user,201,res)
    }else{
        await User.findOneAndDelete({username:req.params.username});
        res.status(400).json({
            message:'try again'
        })
    }
});

exports.login = catchAsync(async (req,res,next)=>{
    const {email,password} = req.body
    if(!email || !password){
        return next(new AppError('no email or password provided',400))
    }
    const user = await User.findOne({email:email}).select('+password');
    if(!user || user.active === false){
        return next(new AppError('user not found',404))
    };
    if(!await bcrypt.compare(password,user.password)){
        return next(new AppError('incorrect email or password',401))
    }
    createSendToken(user,200,res)
});

exports.protect = catchAsync(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token){
        return next(new AppError('no token provided',498))
    }
    const decoded = await promisify(jwt.verify)(token,process.env.JWTSECRET);
    const user = await User.findById(decoded.id);
    if(!user){
        return next(new AppError('no user found',404))
    }
    if(user.checkPasswordChange(decoded.iat)){
        return next(new AppError('token is no longer valid',498))
    }

    req.user = user;
    next();
})

exports.forgetPassword = catchAsync(async(req,res,next)=>{
    const user = await User.findOne({email:req.body.email});
    if(!user){
        return next(new AppError('user not found',404))
    };
    const token = user.createResetToken();
    await user.save({validateBeforeSave:false});
    const message = `${token} is your reset password token`;
    try {
        
        await sendEmail({
            email:user.email,
            subject:'your reset password token',
            text:message
        })
        res.status(200).json({
            status:'success',
            message:'reset token sent to your email'
        })

    } catch (error) {
        user.passwordResetToken = undefined;
        await user.save({validateBeforeSave:false});
        res.status(400).json({
            status:'fail'
        })
    }
});

exports.resetPassword = catchAsync(async(req,res,next)=>{
    const token = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await User.findOne({'passwordResetToken.token':token,'passwordResetToken.expiresAt':{$gt:Date.now()}})

    if(!user){
        return next(new AppError('no user found',404));
    }

    user.password = req.body.password,
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined
    await user.save({validateBeforeSave:false})
    res.status(200).json({
        status:'success',
        message:'password updated successfully'
    })
})

exports.updatePassword = catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user.id).select('+password');
    if(!(await bcrypt.compare(req.body.currentPassword ,user.password))){
        return next(new AppError('your current password is not correct,try again',401))
    }
    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    await user.save();
    res.status(200).json({
        status:'succes',
        message:'password updated successfully'
    })
})