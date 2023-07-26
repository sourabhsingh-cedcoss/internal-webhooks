import { dbConfig } from '../Config/config.js';
import { nextPrevInsertHelper } from '../components/NextPrevInsertHelper.js';
import { getMongoDBOnceConnection } from '../infrastructure/MONGO/mongoConnection.js';


let aggregate = [{
    $match: { operationType: 'insert' }
}, { '$project': { 'fullDocument.description': 0, 'fullDocumentBeforeChange.description': 0, 'updateDescription.updatedFields.description': 0 } }];

let options = {
    fullDocument: 'updateLookup',
    fullDocumentBeforeChange: 'whenAvailable',
};

async function startChangeStream(connection) {
    const db = connection.useDb(dbConfig.dbName);
    nextPrevInsertHelper(db, aggregate, options);
}

const connection = await getMongoDBOnceConnection();
await startChangeStream(connection)


