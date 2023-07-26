import { dbConfig } from '../Config/config.js';
import { userSyncHelper } from '../components/UserSyncHelper.js';
import { getChangeStream } from '../infrastructure/MONGO/changeStream.js';
import { getMongoDBOnceConnection } from '../infrastructure/MONGO/mongoConnection.js';


let aggregate = [
    { $match: { $or: [{ operationType: 'update' }, { operationType: 'insert' }] } },
    { '$project': { 'fullDocument.shops': 0, 'fullDocumentBeforeChange.description': 0, 'updateDescription.updatedFields.description': 0 } }
];

let options =  { fullDocument: 'updateLookup', fullDocumentBeforeChange: 'whenAvailable' };

async function startChangeStream(connection) {
    const db = connection.useDb(dbConfig.dbName);
    getChangeStream(db,'user_details',aggregate,options,userSyncHelper)    
}

const connection = await getMongoDBOnceConnection();
await startChangeStream(connection)


