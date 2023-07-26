import { changesOn, dbConfig } from '../Config/config.js';
import { nextPrevUpdateHelper } from '../components/NextPrevUpdateHelper.js';
import { getMongoDBOnceConnection } from '../infrastructure/MONGO/mongoConnection.js';
import { readJSONFromFileAsync, writeJSONToFileAsync } from '../utils/fileHandler.js';

let existsFilerQuery = Object.keys(changesOn).map((ele) => {
    return { ['updateDescription.updatedFields.' + ele]: { '$exists': true } };
});
let aggregate = [
    { $match: { $or: existsFilerQuery } },
    { $match: { operationType: 'update' } },
    { '$project': { 'fullDocument.description': 0, 'fullDocumentBeforeChange.description': 0, 'updateDescription.updatedFields.description': 0 } }
];

let options = {
    fullDocumentBeforeChange: 'whenAvailable',
};

async function startChangeStream(connection) {
    const db = connection.useDb(dbConfig.dbName);
    nextPrevUpdateHelper(db, aggregate, options);
}

const connection = await getMongoDBOnceConnection();
await startChangeStream(connection)
