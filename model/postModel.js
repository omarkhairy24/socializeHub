const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    text:String,
    pics:[String],
    likes:{
        type:Number,
        default:0
    },
    likedBy:[{
        type:mongoose.Schema.ObjectId,
        ref:'User'
    }]
},{
    timestamps:true,
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

postSchema.virtual('comments',{
    ref:'Comment',
    foreignField:'post',
    localField:'_id'
})

postSchema.pre('save',function(next){
    this.likes = this.likedBy.length
    next();
})

postSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'name username image'
    }).populate({
        path:'likedBy',
        select:'name image'
    });
    next();
})

postSchema.virtual('isLiked').get(function(){
    return ((userId)=>{
        return this.likedBy.some(fn => fn.equals(userId));
    })
})

module.exports = mongoose.model('Post',postSchema);