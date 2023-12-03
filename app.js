const mongoose = require('mongoose');
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const AppError = require('./util/AppError');
const errorController = require('./controller/errorController');

dotenv.config();
app.use(express.json());

const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');

app.use('/api',authRoute);
app.use('/api',userRoute);

app.all('*',(req,res,next)=>{
    return next(new AppError('path not found',404))
})

app.use(errorController);

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('connected');
    app.listen(5000)
});