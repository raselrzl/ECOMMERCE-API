const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt= require('jsonwebtoken');
const crypto = require('crypto');


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please Enter Your Name'],
        maxlength:[30,'Your Name cannot exceed 30 characters'],
    },
    email:{
        type: String,
        required: [true, 'Please Enter Your email address'],
        unique:true,
        validate: [validator.isEmail, 'Please enter a valid email address']
    },
    password:{
        type: String,
        required: [true, 'Please Enter Your password'],
        minlength:[6,'Password cannot less than 6 characters'],
        select:false
    },
/*     avatar:{
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        },

    }, */
    role:{
        type: String,
        default: 'user'
    },
    created_at:{
        type: Date,
        default: Date.now
    },
    resetPasswordToken:String,
    resetPasswordExpire:Date
})
//Encrypting the password 
userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        next()
    }
    this.password =await bcrypt.hash(this.password, 10)
})

//compare user password
userSchema.methods.comparePassword=async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password)
}
//Return JSON WEB  token

userSchema.methods.getJwtToken = function(){
    return jwt.sign({id:this._id},process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRES_TIME
    })
}

//generate password reset token

userSchema.methods.getResetPasswordToken=function(){
    //generate token
    const resetToken =crypto.randomBytes(20).toString('hex');

    //hash and set to reset password token
    this.resetPasswordToken=crypto.createHash('sha256').update(resetToken).digest('hex');

    //set token expires time
    this.resetPasswordExpire=Date.now()+30*60*1000;
    return resetToken;

}

module.exports =mongoose.model('User',userSchema);