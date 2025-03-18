import projectModel from '../models/projectmodel.js';
import mongoose from 'mongoose';


export const createProject = async ( {
    name, userId
} ) => {
    if ( !name )
    {
        throw new Error( 'Name is required' )
    }
    if ( !userId )
    {
        throw new Error( 'User is required' )
    }

    const project = await projectModel.create( {
        name,
        users: [ userId ]
    } )

    return project;
}

export const getAllProjectByUserId = async ( {
    userId
} ) => {
    if ( !userId )
    {
        throw new Error( 'User ID is required' )
    }

    const allUserProjects = await projectModel.find( {
        users: userId
    } )

    return allUserProjects
}

export const addUsersToProject = async ( {
    projectId, users, userId
} ) => {
    if ( !projectId )
    {
        throw new Error( 'Project Id is required' )
    }

    if ( !mongoose.Types.ObjectId.isValid( projectId ) )
    {
        throw new Error( "Invalid projectId" )
    }

    if ( !users )
    {
        throw new Error( 'Users are required' )
    }

    if ( !Array.isArray( users ) || users.some( userId => !mongoose.Types.ObjectId.isValid( userId ) ) )
    {
        throw new Error( "Invalid userId(s) in users array" )
    }

    if ( !userId )
    {
        throw new Error( 'user Id is required' )
    }

    if ( !mongoose.Types.ObjectId.isValid( userId ) )
    {
        throw new Error( 'Invalid user Id' )
    }

    const project = await projectModel.findOne( {
        _id: projectId,
        users: userId
    } )

    if ( !project )
    {
        throw new Error( "User does not belong to this user" )
    }

    const updatedProject = await projectModel.findOneAndUpdate( {
        _id: projectId
    }, {
        $addToSet: {
            users: {
                $each: users
            }
        }
    }, {
        new: true
    } )

    return updatedProject
}

export const removeUserFromProject = async( {
    projectId, userId, loggedInUserId
} ) => {
    if ( !projectId )
    {
        throw new Error( 'Project Id is required' )
    }

    if ( !mongoose.Types.ObjectId.isValid( projectId ) )
    {
        throw new Error( 'Invalid project Id' )
    }

    if ( !userId )
    {
        throw new Error( 'User Id is required' )
    }

    if ( !mongoose.Types.ObjectId.isValid( userId ) )
    {
        throw new Error( 'Invalid user Id' )
    }

    if ( !loggedInUserId )
    {
        throw new Error( 'Logged in user Id is required' )
    }

    if ( !mongoose.Types.ObjectId.isValid( loggedInUserId ) )
    {
        throw new Error( 'Invalid logged in user Id' )
    }

    const project = await projectModel.findOne( {
        _id: projectId,
        users: loggedInUserId
    } )

    if ( !project )
    {
        throw new Error( 'User does not belong to this project' )
    }

    const updatedProject = await projectModel.findOneAndUpdate( {
        _id: projectId
    }, {
        $pull: {
            users: userId
        }
    }, {
        new: true
    } )

    return updatedProject
}

export const getProjectById = async ( { projectId } ) => {
    if ( !projectId )
    {
        throw new Error( "Project Id id required" )
    }

    if ( !mongoose.Types.ObjectId.isValid( projectId ) )
    {
        throw new Error( 'Invalid project Id' )
    }

    const project = await projectModel.findOne( {
        _id: projectId
    } ).populate( 'users' )

    return project;
}

export const getCollaborators = async ( { projectId } ) => {
    if ( !projectId )
    {
        throw new Error( 'Project Id is required' )
    }

    if ( !mongoose.Types.ObjectId.isValid( projectId ) )
    {
        throw new Error( 'Invalid project Id' )
    }

    const collaborators = await projectModel.findOne( {
        _id: projectId
    } ).populate( 'users' )

    return collaborators.users
}