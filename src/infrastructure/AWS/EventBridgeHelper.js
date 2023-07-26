import { bucketName, eventBusName } from "../../Config/config.js";
import { AWSEventBridge, s3 } from "../AWS/AWSbase.js";
import { v4 as uuidv4 } from 'uuid';

export const putInEventBridge = async (Detail) => {
    AWSEventBridge.putEvents({
        Entries: [
            {
                EventBusName: eventBusName,
                Detail: JSON.stringify(Detail),
                DetailType: 'message',
                Source: 'my-application'
            }
        ]
    }, (err, data) => {
        if (err) {
            if (err.statusCode == '413' || err.statusCode == '400') {
                let s3MessageKey = uuidv4();
                s3.putObject({ Bucket: bucketName, Key: s3MessageKey, Body: JSON.stringify({ Detail: Detail, key: Detail.key }) }, (err, data) => {
                    if (err) {
                        console.log(err);
                    } else {
                        putInEventBridge({
                            key: s3MessageKey,
                            type: 's3Message',
                            data_key: Detail.key,
                            bucketName: bucketName
                        })
                    }
                });
            } else {
                console.log(err);
            }
        } else {
            console.log(data);
        }
    })
}
