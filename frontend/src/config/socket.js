import socket from 'socket.io-client';

let socketInstance = null;

export const initializeSocket = ( projectId ) => {
    console.log( 'Initializing socket with projectId:', projectId );

    socketInstance = socket( `${import.meta.env.VITE_API_URL}`, {
        auth: {
            token: localStorage.getItem( 'token' ),
        },
        query: {
            projectId: projectId,
        },
    } );

    console.log( 'Socket instance created with query:', {
        projectId: projectId,
    } );

    socketInstance.on( 'connect', () => {
        console.log( 'WebSocket connected' );
    } );

    socketInstance.on( 'connect_error', ( err ) => {
        console.error( 'WebSocket connection error:', err );
    } );

    socketInstance.on( 'disconnect', ( reason ) => {
        console.warn( 'WebSocket disconnected:', reason );
        if ( reason === 'io server disconnect' )
        {
            // The disconnection was initiated by the server, reconnect manually
            socketInstance.connect();
        } else
        {
            // The disconnection was initiated by the client or network issues, attempt to reconnect
            setTimeout( () => {
                socketInstance.connect();
            }, 3000 ); // Attempt to reconnect after 3 seconds
        }
    } );

    return socketInstance;
};

export const receiveMessage = ( eventName, cb ) => {
    if ( socketInstance )
    {
        socketInstance.on( eventName, cb );
    } else
    {
        console.error( 'Socket instance is not initialized.' );
    }
};

export const sendMessage = ( eventName, data ) => {
    if ( socketInstance )
    {
        socketInstance.emit( eventName, data );
    } else
    {
        console.error( 'Socket instance is not initialized.' );
    }
};