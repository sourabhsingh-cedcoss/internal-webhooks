import { default as connection } from './mongobase.js';

let staticConnection = null;
export function getMongoDBOnceConnection() {
    if(!staticConnection){
        return new Promise((resolve, reject) => {
            connection.once('open', async () => {
                console.log('Connection set');
                staticConnection = connection;
                resolve(connection);
            })
        })
    }else{
        return staticConnection;
    }

}

export function getMongoDBOnConnection() {
    if(!staticConnection){
        return new Promise((resolve, reject) => {
            connection.on('open', async () => {
                console.log('Connection set');
                staticConnection = connection;
                resolve(connection);
            })
        })
    }else{
        return staticConnection;
    }
}