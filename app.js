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
const postRoute = require('./routes/postRoute');
const commentRoute = require('./routes/commentRoute');
const connectionRoute = require('./routes/connectionRoute');

app.use('/api',authRoute);
app.use('/api',userRoute);
app.use('/api',postRoute);
app.use('/api',connectionRoute);
app.use('/api',commentRoute);

app.all('*',(req,res,next)=>{
    return next(new AppError('path not found',404))
})

app.use(errorController);

mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log('connected');
    app.listen(5000)
});