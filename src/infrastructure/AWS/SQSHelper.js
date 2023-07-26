import { sqs } from '../AWS/AWSbase.js';
import { awsConfig, awsConfig as awsInfo } from "../../Config/config.js";

export const sendSQSMessage = (data = {}, queueName, userId = "", delay = 1) => {

    let SqsData = {
        appTag: "amazon_sales_channel",
        appCode: "amazon",
        type: "full_class",
        class_name: "\\App\\Connector\\Models\\Mongostream\\Core",
        method: "receiveSqsMessage",
        user_id: userId,
        queue_name: awsConfig.queue_prefix + queueName,
        data: data
    };
    let params = {
        DelaySeconds: delay,
        MessageBody: JSON.stringify(SqsData),
        QueueUrl: awsConfig.queue_url + awsConfig.queue_prefix + queueName
    };
    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log("Error", err);
        }
    });
}