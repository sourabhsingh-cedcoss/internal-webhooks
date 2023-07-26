import { awsConfig as awsInfo } from "../../Config/config.js";
import AWS from 'aws-sdk';


AWS.config.update({ region: awsInfo.region, accessKeyId: awsInfo.accessKeyId, secretAccessKey: awsInfo.secretAccessKey });

export const sqs = new AWS.SQS({
    'apiVersion': 'latest'
});

export const s3 = new AWS.S3({ 'apiVersion': 'latest' });

export const AWSEventBridge = new AWS.EventBridge();
 