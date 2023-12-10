const User = require('../model/userModel');
const Pending = require('../model/pendingModel');
const AppError = require('../util/AppError');
const catchAsync = require('../util/catchAsync');

exports.sendRequest = catchAsync( async (req,res,next)=>{
    let recipient = req.body.username;
    if(req.params.username) recipient = req.params.username
    const user = await User.findOne({username:recipient})
    
    const currentUser = await User.findById(req.user.id);
    if(currentUser.connections.includes(user._id)){
        return next(new AppError('the user already exists in your connections',400))
    }else{
        await Pending.create({
            requester:req.user.id,
            recipient:user._id
        });
    }
    res.status(200).json({
        status:'success'
    })
})

exports.getRequests = catchAsync(async (req,res,next) =>{
    const requests = await Pending.find({recipient:req.user.id})
    res.status(200).json({
        requests
    })
})

exports.acceptRequest = catchAsync(async (req,res,next)=>{
    let requester = req.body.username;
    if(req.params.username) requester = req.params.username
    const user = await User.findOne({username:requester})
    const pending = await Pending.findOne({recipient:req.user.id , requester:user._id});
    if(!pending) return next(new AppError('no pending found',404));

    const currentUser = await User.findById(req.user.id);
    user.connections.push(req.user.id)
    currentUser.connections.push(user._id);
    await currentUser.save({validateModifiedOnly:true});
    await user.save({validateModifiedOnly:true});
    await Pending.findOneAndDelete({recipient:req.user.id , requester:user._id})
    res.status(200).json({
        status:'success',
        data:{
            currentUser
        }
    })
})

exports.rejectRequest = catchAsync(async (req,res,next)=>{
    let requester = req.body.username;
    if(req.params.username) requester = req.params.username
    const user = await User.findOne({username:requester})
    const pending = await Pending.findOne({recipient:req.user.id , requester:user._id});
    if(!pending) return next(new AppError('no pending found',404));
    await Pending.findByIdAndDelete(pending._id)
    res.status(200).json({
        status:'success'
    })
});


exports.getDistanceSuggestions = catchAsync(async (req,res,next)=>{
    const user = await User.findById(req.user.id).populate('connections');
    const distancesSuggestion = await User.aggregate([
        {
            $geoNear:{
                near:{
                    type:'Point',
                    coordinates:user.location.coordinates
                },
                key: "location",
                distanceField:'distance',
                maxDistance:200000
            }
        },
        {
            $match:{'_id':{$ne:user._id}}
        },
        {
            $match:{'_id':{$nin:user.connections}}
        },
        {
            $sample:{size:10}
        }
    ])
    distancesSuggestion.forEach(user =>{
        user.password = undefined
    })
    res.status(200).json({
        suggestions:distancesSuggestion,
        len:distancesSuggestion.length
    })
});


//friends of friends
exports.getFriendsSuggestions = catchAsync(async(req,res,next)=>{
    const user = await User.findById(req.user.id).populate('connections');
    let connections  = user.connections.map(el=>({
        ...el.connections
    }))
    const arr = []
    connections.forEach(val=>{
        Object.keys(val).forEach(vl=>{
            if (val[vl].toString() !== req.user.id)
                arr.push(val[vl])
        })
    })
    const users = await User.aggregate(
        [
            {
                $match:{'_id':{$in:arr}}
            },
            {
                $sample:{
                    size:10
                }
            }
        ]
    );
    users.forEach(ur=>{
        ur.password = undefined
    })
    res.status(200).json({
        users
    })

})