import express from 'express';
import morgan from 'morgan';
import connect from "./db/db.js";
import cookieParser from "cookie-parser";
import cors from 'cors';


import userRoutes from './routes/users.routes.js'
import projectRoutes from './routes/project.routes.js'

connect();

 const app = express();

 app.use(morgan('dev')); // will probide you logs of url
 app.use(express.json());
 app.use(express.urlencoded({extended:true}));
 app.use(cookieParser());
 app.use(cors());


 app.use('/users',userRoutes);
 app.use('/projects',projectRoutes);


 app.get('/',(req,res) => {
    res.send('hello world');
 });

 export default app;