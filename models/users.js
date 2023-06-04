import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter your name']
    },
    email: {
        type: String,
        required: [true, 'Please enter your email address'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    role: {
        type: String,
        enum: {
            values: ['user', 'employer'],
            message: 'Please select correct role'
        },
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter password for your account'],
        minlength: [6, 'Your password must be at least 6 characters long'],
        select: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

// Encypting passwords before saving
userSchema.pre('save', async function (next) {
    // if (!this.isModified('password')) {
    //     next();
    // }
    this.password = await bcrypt.hash(this.password, 10);
});

// Return jwt
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE_TIME
    })
}

// Compare passwords
userSchema.methods.comparePassword = async function (inputPass) {
    return await bcrypt.compare(inputPass, this.password);
}

const User = mongoose.model('User', userSchema);
User.createIndexes();


export default User;