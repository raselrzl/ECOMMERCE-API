const express=require('express');
const app=express();
const fileUpload = require('express-fileupload')
const dotenv=require('dotenv')
const errorMiddleware=require('./middlewares/errors')


//setting up config file
dotenv.config({path:'backend/config/config.env'})

const cookieParser=require('cookie-parser')
const bodyParser=require('body-parser')
/* const cloudinary=require('cloudinary') */

module.exports=app;
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.use(fileUpload())

//setting up cloudinary
/* cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
}) */

//import all routes
const products=require('./routes/product')
const auth=require('./routes/auth')
const order=require('./routes/order')
const payment=require('./routes/payment')

app.use('/api/v1',products)
app.use('/api/v1',auth)
app.use('/api/v1',order)
app.use('/api/v1',payment)

//middlewares to handle errors
app.use(errorMiddleware)
module.exports=app
