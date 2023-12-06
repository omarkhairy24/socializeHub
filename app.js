const mongoose = require('mongoose');
const express = require('express');
const app = express();
const dotenv = require('dotenv');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const AppError = require('./util/AppError');
const errorController = require('./controller/errorController');

dotenv.config();
app.use(express.json());
app.use(morgan('dev'));
app.use(mongoSanitize());

const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const postRoute = require('./routes/postRoute')

app.use('/api',authRoute);
app.use('/api',userRoute);
app.use('/api',postRoute);

app.all('*',(req,res,next)=>{
    return next(new AppError('path not found',404))
})

app.use(errorController);

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('connected');
    app.listen(5000)
});