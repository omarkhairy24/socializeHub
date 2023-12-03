const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:[true,'username already exists']
    },
    image:{
        type:String
    },
    imageCover:{
        type:String
    },
    email:{
        type:String,
        required:true,
        lowercase:true,
        unique:true,
        validate:validator.isEmail
    },
    password:{
        type:String,
        required:true,
        minlength:6,
        select:false
    },
    confirmPassword:{
        type:String,
        required:true,
        validate:{
            validator:function(val){
                return this.password === val
            },
            message:'passwords are not matched, try again'
        }
    },
    birthDay:{type:Date},
    gender:{
        type:String,
        required:true,
        enum:['male','female']
    },
    connections:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }],
    location:{
        type:{
            type:String,
            default:'Point',
            enum:['Point']
        },
        coordinates:[Number],
        address:String
    },
    active:{
        type:Boolean,
        default:false
    },
    registerToken:{
        token:String,
        expiresAt:Date
    },
    passwordResetToken:{
        token:String,
        expiresAt:Date
    },
    passwordupdatedAt:Date
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

userSchema.methods.createRegisterToken = function(){
    const token = crypto.randomBytes(3).toString('hex');
    this.registerToken.token = crypto.createHash('sha256').update(token).digest('hex');
    this.registerToken.expiresAt = Date.now() + 10 * 60 * 1000;
    return token;
}

userSchema.methods.createResetToken = function(){
    const token = crypto.randomBytes(3).toString('hex');
    this.passwordResetToken.token = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetToken.expiresAt = Date.now() + 10*60*1000;
    return token;
}

userSchema.methods.checkPasswordChange = function(jwtTimeStamp){
    if(this.passwordupdatedAt){
        const changeTime = parseInt(this.passwordupdatedAt.getTime()/1000,10);
        return jwtTimeStamp < changeTime
    }
}

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password,12);
    this.confirmPassword = undefined;
    next();
});

userSchema.pre('save',function(next){
    if(!this.isModified('password') || this.isNew) return next();
    this.passwordupdatedAt = Date.now() - 1000;
    next();
})

module.exports = mongoose.model('User',userSchema);