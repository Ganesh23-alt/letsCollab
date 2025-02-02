import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        minLength:[6,'Email must be at least 6 characters long'],
        maxLength:[50, 'Email must not be longer than 50 character']
    },

    password:{
        type:String,
        select:false,
    }
})


// hashing password
userSchema.statics.hashPassword = async function(password){
    return await bcrypt.hash(password,10);
}

//checking password
userSchema.methods.isValidPassword = async function (password){
    return await bcrypt.compare(password,this.password);
}

//generating token 
userSchema.methods.generateJWT = function(){
    return jwt.sign({email:this.email},process.env.SECRET_KEY);
}

const User = mongoose.model('user',userSchema);




export default User;
