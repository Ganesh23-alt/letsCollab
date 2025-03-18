import projectModel from '../models/projectmodel.js';
import * as projectService from '../services/project.service.js';
import userModel from '../models/users.model.js';
import { validationResult } from 'express-validator';


export const createProjectController = async ( req, res ) => {
    const errors = validationResult( req );
    if ( !errors.isEmpty() )
    {
        return res.status( 400 ).json( { errors: errors.array() } );
    }

    try
    {
        const { name } = req.body;
        const loggedInUser = await userModel.findOne( { email: req.user.email } );
        const userId = loggedInUser._id;


        const newProject = await projectService.createProject( { name, userId } );

        res.status( 201 ).json( newProject );
    } catch ( err )
    {
        res.status( 400 ).send( err.message );
    }
}


export const getAllProject = async ( req, res ) => {
    try
    {
        const loggedInUser = await userModel.findOne( {
            email: req.user.email
        } )

        const allUserProjects = await projectService.getAllProjectByUserId( {
            userId: loggedInUser._id
        } )

        return res.status( 200 ).json( {
            projects: allUserProjects
        } )
    } catch ( error )
    {
        console.log( error )
        res.status( 404 ).json( {
            error: error.message
        } )
    }
}

export const addUserToProject = async ( req, res ) => {
    const errors = validationResult( req );
    if ( !errors.isEmpty() )
    {
        return res.status( 400 ).json( { errors: errors.array() } );
    }

    try
    {
        const { projectId, users } = req.body

        const loggedInUser = await userModel.findOne( {
            email: req.user.email
        } )


        const project = await projectService.addUsersToProject( {
            projectId,
            users,
            userId: loggedInUser._id
        } )

        return res.status( 200 ).json( {
            project,
        } )

    } catch ( error )
    {
        console.log( error )
        res.status( 400 ).json( {
            error: error.message
        } )
    }
}

export const removeUserFromProject = async ( req, res ) => {
    const errors = validationResult( req );
    if ( !errors.isEmpty() )
    {
        return res.status( 400 ).json( { errors: errors.array() } );
    }

    try
    {
        const { projectId, userId } = req.body;
        console.log( projectId, userId );

        const loggedInUser = await userModel.findOne( {
            email: req.user.email
        } )

        const project = await projectService.removeUserFromProject( {
            projectId,
            userId,
            loggedInUserId: loggedInUser._id
        } )

        return res.status( 200 ).json( {
            project
        } )
    } catch ( error )
    {
        console.log( error )
        res.status( 400 ).json( {
            error: error.message
        } )
    }
}

export const getProjectById = async ( req, res ) => {
    const { projectId } = req.params;

    try
    {
        const project = await projectService.getProjectById( {
            projectId
        } );

        return res.status( 200 ).json( {
            project
        } );
    } catch ( error )
    {
        console.log( error )
        res.status( 400 ).json( {
            errror: error.message
        } )
    }
}

export const getCollaborators = async ( req, res ) => {
    const { projectId } = req.params;

    try
    {
        const collaborators = await projectService.getCollaborators( {
            projectId
        } );

        return res.status( 200 ).json( {
            collaborators
        } );
    } catch ( error )
    {
        console.log( error );
        res.status( 400 ).json( {
            error: error.message
        } );
    }
}