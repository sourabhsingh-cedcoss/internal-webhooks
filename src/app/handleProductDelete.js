import { dbConfig } from '../Config/config.js';
import { productDeleteHelper } from '../components/ProductDeleteHelper.js';
import { getMongoDBOnceConnection } from '../infrastructure/MONGO/mongoConnection.js';


let aggregate = [{
    '$match': {
        'operationType': "delete",
        $or: [
            { "fullDocumentBeforeChange.uninstall_status": false },
            { "fullDocumentBeforeChange.uninstall_status": { $exists: false } }
        ]
    }
}, {
    '$project': {
        'fullDocument.description': 0, 'fullDocumentBeforeChange.description': 0, 'updateDescription.updatedFields.description': 0
    }
}];

let options = { fullDocument: 'updateLookup', fullDocumentBeforeChange: 'whenAvailable' };

async function startChangeStream(connection) {
    const db = connection.useDb(dbConfig.dbName);
    productDeleteHelper(db,aggregate,options);
}

const connection = await getMongoDBOnceConnection();
await startChangeStream(connection)


