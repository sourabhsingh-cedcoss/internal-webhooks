import { sendSQSMessage } from "../infrastructure/AWS/SQSHelper.js";

export function userSyncHelper(next,resume_token) {
    
    let userId = next?.fullDocument?.user_id ?? "";
    if (next && next.updateDescription && next.updateDescription.updatedFields && next.updateDescription.updatedFields.user_status) {
        insertAndSendSQS(userId, false);
    }
    insertAndSendSQS(userId, true);
}

function insertAndSendSQS(userId, sync = true) {
    const sqsData = {
        className: sync ? "\\App\\Frontend\\Components\\AdminpanelamazonmultiHelper" : "\\App\\Connector\\Models\\Mongostream\\Product",
        method: sync ? 'syncUserCollections' : 'formatUserStatus',
        user_id: userId,
        stream:true
    }
    sendSQSMessage(sqsData,"handle_user_sync",userId);
}