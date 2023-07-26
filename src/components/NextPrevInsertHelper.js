import { limiters } from "../Config/config.js";
import { putInEventBridge } from "../infrastructure/AWS/EventBridgeHelper.js";
import { getChangeStream } from "../infrastructure/MONGO/changeStream.js";
import { writeJSONToFileAsync } from "../utils/fileHandler.js";
// put message wala logic likhna hai
let maintainUserInfo = {};
let resume_token;
let key = 'rest_all';

export function nextPrevInsertHelper(db, aggregate, options) {
    if(resume_token){
        options= {...options,resumeAfter: resume_token}
    }
   
    getChangeStream(db, 'product_container', aggregate, options, changeStreamHelper)
}

const changeStreamHelper = (change,resumeToken) => {
    let user_id = change?.fullDocument?.user_id ?? null;

    if (!maintainUserInfo[user_id]) {
        maintainUserInfo[user_id] = {};
    }

    if (!maintainUserInfo[user_id][key]) {
        maintainUserInfo[user_id][key] = {
            count: 0,
            data: [],
            waitTime: setTimeout(() => {
                putMessage(user_id, key, ['executeAnyHow']);
            }, limiters.waitTime)
        }
    }

    let data = maintainUserInfo[user_id][key];
    data.count++;
    let fullDocument = change.fullDocument;
    data.data.push({
        currentValue: fullDocument, operationType: change.operationType
    });

    if (data.count == limiters.maxCount) {
        putMessage(user_id, key, ['waitTime', 'executeAnyHow']);
    }

    resume_token = resumeToken;
}

const putMessage = (user_id, key, clearTimeoutOf = []) => {
    // console.log(maintainUserInfo[user_id]);
    let dataMajor = { ...maintainUserInfo[user_id][key] };
    delete maintainUserInfo[user_id][key];

    clearTimeoutOf.forEach((ele) => clearTimeout(dataMajor[ele]));

    putInEventBridge({
        data: dataMajor.data,
        key: key,
        type: 'fullData',
        user_id: user_id
    });
}