import dotenv from 'dotenv';
import express from 'express';

dotenv.config(); //to use enav varaibles

 const app = express();

 app.use(express.json());
 app.use(express.urlencoded({extended:true}));


 app.get('/',(req,res) => {
    res.send('hello world');
 });