import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";


export const authUser = async(req,res,next) =>{
    try{
        //token searching
         const token = req.cookies.token || req.headers.authorization.split(' ')[ 1 ]
         if(!token){
            return res.status(401).send({
                error:' Unauthorized User'
            });
         }

         const isBlackListed = await redisClient.get(token);

         if(isBlackListed){
            res.cookies('token','');
            return res.status(401).send({
                error:'Unauthorized user'
            });
         }

         //if token found
         const decoded = jwt.verify(token,process.env.SECRET_KEY);
         req.user = decoded;
         next();
    }catch(err){
        console.log(err);
        res.status(401).send({
            error:'User not authorized'
        });
    }
}