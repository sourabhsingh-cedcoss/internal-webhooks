import { limiters } from "../../../config.js";
import { getChangeStream } from "../infrastructure/MONGO/changeStream.js";
import { putInEventBridge } from "../infrastructure/AWS/EventBridgeHelper.js";
import { changesOn, createKeyOn } from "../Config/config.js";
import { writeJSONToFileAsync } from "../utils/fileHandler.js";

let maintainUserInfo = {};
let resume_token;

export function nextPrevUpdateHelper(db, aggregate, options) {
    if(resume_token){
        options= {...options,resumeAfter: resume_token}
    }
    getChangeStream(db, 'product_container', aggregate, options, changeStreamHelper)
}

const changeStreamHelper = (change, resumeToken) => {
    let user_id = change?.fullDocumentBeforeChange?.user_id ?? null;
    if (!maintainUserInfo[user_id]) {
        maintainUserInfo[user_id] = {};
    }

    let valueR = insertInKey(change.updateDescription.updatedFields, change.fullDocumentBeforeChange, change.updateDescription.removedFields);

    let key = valueR.key;

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
    let fullDocument = change.fullDocumentBeforeChange;

    data.data.push({
        currentValue: {
            ...change.updateDescription.updatedFields,
            source_product_id: fullDocument?.source_product_id ?? '',
            container_id: fullDocument?.container_id ?? '',
            shop_id: fullDocument?.shop_id ?? '',
            clusterTime: change.clusterTime,
            user_id: change?.fullDocument?.user_id ?? '',
            source_shop_id: fullDocument.source_shop_id ?? fullDocument.shop_id
        }, beforeValue: valueR.beforeValue, operationType: change.operationType
    });

    if (data.count == limiters.maxCount) {
        putMessage(user_id, key, ['waitTime', 'executeAnyHow']);
    }
    resume_token = resumeToken;
}

const insertInKey = (data, beforeChange
    , removedFields = []
) => {
    let matchKey = '', matchCount = 0; let beforeValue = {};
    removedFields.length > 0 && removedFields.forEach((ele) => {
        if (beforeChange && beforeChange[ele]) {
            beforeValue[ele] = beforeChange[ele];
        }
    });
    Object.keys(data).forEach((ele) => {
        if (beforeChange && beforeChange[ele]) {
            beforeValue[ele] = beforeChange[ele];
        }
        if (createKeyOn[ele]) {
            matchKey = createKeyOn[ele];
            matchCount++;
        } else if (changesOn[ele]) {
            matchCount++;
        }
    });
    let key = (matchCount == 1 && matchKey != '') ? matchKey : 'rest_all';

    return {
        key: key,
        beforeValue: beforeValue
    }
}

const putMessage = (user_id, key, clearTimeoutOf = []) => {
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
