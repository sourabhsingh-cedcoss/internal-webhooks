import { sendSQSMessage } from "../infrastructure/AWS/SQSHelper.js";
import { getChangeStream } from "../infrastructure/MONGO/changeStream.js";
import { v4 as uuidv4 } from 'uuid';

let activityCollection;
const MAX_LIMIT = 5;

// docs storing data for bulk insertion
let docs = [];
let userId = [];


// variable storing interval ID
let intervalId;
let process_id;

export function productDeleteHelper(db, aggregate, options) {
    if (!activityCollection) {
        activityCollection = db.collection('product_activity');
    }

    // Setting interval for handleSQS
    intervalId = setInterval(handleSQS, 300000);
    process_id = uuidv4();

    getChangeStream(db, 'product_container', aggregate, options, changeStreamHelper)
}

const changeStreamHelper = (next,resume_token) => {
    let data = prepareDataForInsertion(next);
    docs.push(data);
    handleSQS(true);
}

function prepareDataForInsertion(event) {

    if (!userId.includes(event.fullDocumentBeforeChange.user_id)) {
        userId.push(event.fullDocumentBeforeChange.user_id);
    }

    let variants = [];
    if (event.fullDocumentBeforeChange.visibility === "Catalog and Search") {
        variants = getVariantIds(event.fullDocumentBeforeChange);
    }
    return {
        operationType: event.operationType,
        process_id: process_id,
        before_change: event.fullDocumentBeforeChange,
        container_id: event.fullDocumentBeforeChange.container_id,
        source_product_id: event.fullDocumentBeforeChange.source_product_id,
        user_id: event.fullDocumentBeforeChange.user_id,
        after_change: event.documentKey,
        time: event.clusterTime,
        variants: variants
    };
}

function getVariantIds(parent) {
    let source_product_id = parent.source_product_id;
    let variantsArray = [];
    parent.marketplace.forEach((item) => {
        if (item.source_product_id !== source_product_id) {
            variantsArray.push(item.source_product_id);
        }
    });
    return variantsArray;
}

function handleSQS(manual = false) {

    if (docs.length === MAX_LIMIT && manual) {
        let insertionData = [...docs];
        let processID = process_id;
        insertAndSendSQS(insertionData, processID);

        docs = [];
        userId = [];
        process_id = uuidv4();
        clearInterval(intervalId);
        intervalId = setInterval(handleSQS, 300000);
    } else if (!manual) {
        if (docs.length > 0) {
            let insertionData = [...docs];
            let processID = process_id;
            insertAndSendSQS(insertionData, processID);

            docs = [];
            userId = []
            process_id = uuidv4();
        }
    }

}

function insertAndSendSQS(data, process_id) {
    let query = buildQuery(data);
    activityCollection.bulkWrite(query);
    const sqsData = {
        className: "\\App\\Connector\\Models\\Mongostream\\Product",
        method: 'formatProductData',
        process_id: process_id,
        user_id: [...userId]
    }
    sendSQSMessage(sqsData,'handle_product_delete_event');
}

function buildQuery(docs) {
    const insertOperations = docs.map(document => {
        return { insertOne: { document } };
    });
    return insertOperations;
}
