const User = require('../models/user')

const ErrorHandler=require('../utils/errorHandler')
const crypto = require('crypto')
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const sendToken = require('../utils/jwtToken');
const sendEmail= require('../utils/sendEmail');
const cloudinary = require('cloudinary');

//Register a user => /api/v1/register
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{
    /* const result=await cloudinary.v2.uploader.upload(req.body.avatar,{
        folder:'Theend',
        width:'600',
        crop:"scale"
    }) */
    const {name, email, password} = req.body;
    const user=await User.create({
        name,
        email,
        password/* ,
        avatar:{
            public_id:result.public_id,
            url:result.secure_url
        } */
    }) 

/*     const token=user.getJwtToken();

    res.status(200).json({
        success: true,
        token
    }) */  /* removed to cookiew */
    sendToken(user, 200, res)
})

//login user =>api/v1/user
exports.loginUser=catchAsyncErrors(async(req, res, next)=>{
    const {email, password} = req.body;
    //checking email password has entered or not
    if(!email || !password){
        return next(new ErrorHandler('Please enter your email & password', 401));
    }

    //finding user in database
    const user=await User.findOne({ email}).select('+password');

    if(!user){
        return next(new ErrorHandler('Unregistered email address', 401));
    }

    //checks if password is correct of not
    const isPasswordMatched=await user.comparePassword(password);
    if(!isPasswordMatched){
        return next(new ErrorHandler('Invalid password', 401));
    }

 /*    const token=user.getJwtToken();

    res.status(200).json({
        success: true,
        token
    }) 
    send this to cookies */
    sendToken(user, 200, res)
})


//forgot password =>/api/v1/password/forgot

exports.forgotPassword = catchAsyncErrors(async(req, res, next)=>{
    const user=await User.findOne({email: req.body.email});

    if(!user){
        return next(new ErrorHandler('User not found', 404));
    }
    //get reset token

    const resetToken=user.getResetPasswordToken();

    await user.save({validateBeforeSave:false})

    //create reset password url

  /*   const resetUrl=`${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}` */

    const resetUrl=`${process.env.FRONTEND_URL}/password/reset/${resetToken}` //this url is just for test in front end

    const message=`Your password reset token is as follows:\n\n${resetUrl}\n\nif you have not requested this email, then ignore it`

    try{
            await sendEmail({
                email:user.email,
                subject:'Zeras password recovery',
                message
            })
    res.status(200).json({
        success: true,
        message:`Email sent to ${user.email}`
    })

    }catch(error){
        user.getResetPasswordToken=undefined;
        user.getResetPasswordExpire=undefined;
        await user.save({validateBeforeSave:false})
        return next(new ErrorHandler(error.message, 500));
    }

})

//forgot password =>/api/v1/password/reset/:token

exports.resetPassword = catchAsyncErrors(async(req, res, next)=>{
        //hash URL token
        const resetPasswordToken=crypto.createHash('sha256').update(req.params.token).digest('hex');

        const user=await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: {$gt:Date.now()}
        })

        if(!user){
            return next(new ErrorHandler('Password reset token is invalid or has been expired', 400))
        }

        if(req.body.password !==req.body.confirmPassword){
            return next(new ErrorHandler('Password does not match', 400))
        }

        //setup new password
        user.password=req.body.password;
        user.getResetPasswordToken=undefined;
        user.getResetPasswordExpire=undefined;
        await user.save();
        sendToken(user, 200, res)
})
//Get currently logged in user =>/api/v1/me
exports.getUserProfile=catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findById(req.user.id);
    res.status(200).json({
        success:true,
        user
    })
})
//Update password=>/api/v1/password/update
exports.updatePassword=catchAsyncErrors(async(req, res, next)=>{
    const user=await User.findById(req.user.id).select('+password')

    //check Previous user password
    const isMatched=await user.comparePassword(req.body.oldPassword)
    if(!isMatched){
        return next(new ErrorHandler('Old password is incorrect', 400))
    }

    user.password = req.body.password
    await user.save()
    sendToken(user,200,res)
})

//Update user profile =>/api/v1/me/update

exports.updateUserProfile=catchAsyncErrors(async(req, res, next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email
    }
    //update avatar:TODO
    const user=await User.findByIdAndUpdate(req.user.id, newUserData, {
        new:true,
        runValidators: true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true
    })
})

//logout user =>/api/v1/logout
exports.logoutUser=catchAsyncErrors(async(req, res, next)=>{
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly: true
    })
    
    res.status(200).json({
        success:true,
        message: 'Logged out successfully'
    })
})


//Admin Routes start from here


//Get all users =>/api/v1/admin/users

exports.allUsers=catchAsyncErrors(async(req, res, next)=>{
    const users=await User.find();
    res.status(200).json({
        success:true,
        users
    })
})


//Get all user details =>/api/v1/admin/user/:id
exports.getUserDetails=catchAsyncErrors(async(req, res, next)=>{
    const user=await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist:${req.params.id}`));
    }
    res.status(200).json({
        success:true,
        user
    })
})

//Update user profile =>/api/v1/admin/user/:id

exports.updateUser=catchAsyncErrors(async(req, res, next)=>{
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role,
    }
     const user=await User.findByIdAndUpdate(req.params.id, newUserData, {
        new:true,
        runValidators: true,
        useFindAndModify:false
    })
    res.status(200).json({
        success:true
    })
})



//delete user =>/api/v1/admin/user/:id
exports.deleteUser=catchAsyncErrors(async(req, res, next)=>{
    const user=await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHandler(`User does not exist:${req.params.id}`));
    }
    await user.remove();

    //remove avatar todo

    res.status(200).json({
        success:true
    })
})