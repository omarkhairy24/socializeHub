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
    }],
    reply:[{
        type:mongoose.Schema.ObjectId,
        ref:'Comment'
    }]
});

module.exports = mongoose.model('Comment',commentSchema);