const app=require('./app')
const cloudinary=require('cloudinary')
const dotenv=require('dotenv');
//handle uncought exceptions
process.on('uncaughtException',err=>{
    console.log(`ERROR: ${err.stack}`);
    console.log('Shutting down server due to uncaughtException');
    process.exit(1);
})

//Setting up config file
dotenv.config({path:'backend/config/config.env'})

const connectDatabase=require('./config/database')






//connecting to database
connectDatabase();

//setting up cloudinary configuration
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
})

const server=app.listen(process.env.PORT, ()=>{
    console.log(`Server Started on PORT:${process.env.PORT} in ${process.env.NODE_ENV} mode.`)
}) 

//handle Unhandled Promise rejections

process.on('unhandledRejection', err=>{
    console.log(`ERROR:${err.stack}`);
    console.log('Shutting down the server due to unhandled Promise rejection');
    server.close(()=>{
        process.exit(1)
    })
})

