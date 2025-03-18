import dotenv from 'dotenv/config.js';
import http from 'http';
import app from './app.js';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import projectModel from './models/projectmodel.js';
import { generateResult } from './services/ai.service.js';

const port = process.env.PORT || 3000;

const server = http.createServer( app );
const io = new Server( server, {
    cors: {
        origin: '*',
    }
} );

io.use( async ( socket, next ) => {
    try
    {
        const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.split( ' ' )[ 1 ];
        const projectId = socket.handshake.query.projectId;
        console.log( "Received projectId:", projectId );
        if ( !mongoose.Types.ObjectId.isValid( projectId ) )
        {
            return next( new Error( 'project id is invalid' ) );
        }

        const project = await projectModel.findById( projectId );
        console.log( "Project:", project );
        if ( !project )
        {
            return next( new Error( 'Project not found' ) );
        }

        if ( !token )
        {
            return next( new Error( 'Authentication error' ) );
        }

        const decoded = jwt.verify( token, process.env.SECRET_KEY );
        if ( !decoded )
        {
            return next( new Error( 'Authentication error' ) );
        }

        socket.project = project;
        socket.user = decoded;
        next();
    } catch ( error )
    {
        next( error );
    }
} );

io.on( 'connection', socket => {
    socket.roomId = socket.project._id.toString();
    console.log( 'new socket io connection', socket.roomId );
    socket.join( socket.roomId );

    socket.on( 'project-message',async  data => {

        const message = data.message;
        const aiIsPresentInMessage = message.includes( '@ai' );
        
        if(aiIsPresentInMessage){
            const prompt = message.replace('@ai', '');
            const result = await generateResult( prompt );
            io.to( socket.roomId ).emit( 'project-message', {
                message: result,
                sender: {
                    _id: 'AI',
                    email :'AI'
                },
            } );
            return;
        }
        socket.broadcast.to( socket.roomId ).emit( 'project-message', messageData );
    } );

    socket.on( 'event', data => { /* … */ } );
    socket.on( 'disconnect', () => { /* … */ } );
} );

server.listen( port, () => {
    console.log( `server is running on port ${port}` );
} );
