import projectModel from '../models/projectmodel.js';


export const createProject = async({
    name,userId
}) => {
    if(!name){
        throw new Error('Name is required')
    }
    if(!userId){
        throw new Error('User is required')
    }

    const project = await projectModel.create({
        name,
        users:[ userId ] 
    })

    return project;
}