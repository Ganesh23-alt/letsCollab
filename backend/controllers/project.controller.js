import projectModel from '../models/projectmodel.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/users.model.js';
import { validationResult } from 'express-validator';


export const createProjectController = async(req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    try {
        const { name } = req.body;
     const loggedInUser = await userModel.findOne({email:req.user.email});
     const userId = loggedInUser._id;


     const newProject = await projectService.createProject({name,userId});

     res.status(201).json(newProject);
    } catch (err) {
        res.status(400).send(err.message);
    }
}