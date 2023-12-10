const mongoose = require('mongoose');

const pendingSchema = new mongoose.Schema({
    requester:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    recipient:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      }
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps:true
});

pendingSchema.index({recipient:1,requester:1},{unique:true});

pendingSchema.pre(/^find/,function(next){
    this.populate({
        path:'requester',
        select:'name image username'
    })
    next();
})

module.exports = mongoose.model('Pending',pendingSchema);