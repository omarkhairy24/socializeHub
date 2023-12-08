const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    comment:{
        type:mongoose.Schema.ObjectId,
        ref:'Comment',
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    text:String,
    photo:String
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});

replySchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:'name image'
    })
    next();
});

module.exports = mongoose.model('Reply',replySchema);