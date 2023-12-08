const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    post:{
        type:mongoose.Schema.ObjectId,
        ref:'Post',
        required:true
    },
    text:String,
    photo:String,
    likes:{
        type:Number,
        default:0
    },
    likedBy:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

commentSchema.virtual('replies',{
    ref:'Reply',
    foreignField:'comment',
    localField:'_id'
})

commentSchema.pre(/^find/,function(next){
    this.populate('replies');
    next();
})

commentSchema.pre('save',function(next){
    this.likes = this.likedBy.length;
    next();
});

commentSchema.virtual('isLiked').get(function(){
    return ((userId)=>{
        return this.likedBy.some(fn => fn.equals(userId));
    })
})

module.exports = mongoose.model('Comment',commentSchema);