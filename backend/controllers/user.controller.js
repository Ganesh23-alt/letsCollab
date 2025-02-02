import userModel from "../models/users.model.js";
import * as userService from '../services/user.service.js';
import { validationResult } from 'express-validator';
import redisClient from '../services/redis.service.js';


export const createUserController = async (req,res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try{
        const user = await userService.createUser(req.body);

        const token = await user.generateJWT();
        res.status(201).json({user, token});
    }catch(error){
        res.status(400).send(error.message);
    }
}


export const loginUserController = async (req, res) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try{
        const {email,password} = req.body;

        //user validation 
        const user = await userModel.findOne({email}).select('+password');
        if(!user){
            return res.status(401).json({
                errors:'Invalid Credentials.userName'
            })
        }

        //password validation
        const isMatch = await user.isValidPassword(password);
        if(!isMatch){
            return res.status(401).json({
                errors:'Invalid Credentials.password'
            })
        }

        const token = await user.generateJWT();

        res.status(200).json({user,token});

    }catch(err){
        res.status(401).send(err.message)
    }
}

export const userProfileController = async (req,res) => {
    res.status(200).json({
        user: req.user
    })
}

export const userLogoutController = async(req,res) => {
    try{
        const token = req.cookies.token || req.headers.authorization.split(' ')[1];

        redisClient.set(token,'logout','EX',60*60*24);

        res.status(200).json({
            message:"logged out sucessfully"
        })
    } catch(err){
        res.status(401).send(err.message);
    }
}