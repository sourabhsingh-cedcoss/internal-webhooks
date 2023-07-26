import dotenv from 'dotenv';
dotenv.config();


export const dbConfig = {
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    url: process.env.DB_URL,
    dbName: process.env.DB_NAME
};


export const awsConfig = {
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    queue_url: process.env.QUEUE_URL,
    queue_prefix: process.env.QUEUE_PREFIX
};


export const bucketName = process.env.BUCKET_NAME;

export const eventBusName = process.env.EVENT_BUS_NAME;

export const PORT = process.env.PORT;

export const changesOn = {
    'price': 1, 'quantity': 1, 'title': 1, 'main_image': 1, 'additional_images': 1, 'sku': 1, 'profile': 1, 'type': 1, 'brand': 1, 'location': 1, 'barcode': 1, 'source_product_id': 1, 'visibility': 1, 'product_type': 1, 'grams': 1, 'weight': 1, 'weight_unit': 1, 'variant_title': 1, 'variant_attributes': 1, 'variant_attributes_values': 1
};

export const createKeyOn = { 'price': 'price', 'quantity': 'quantity', 'main_image': 'image', 'additional_images': 'image' };

export const additionalProjectOn = { 'user_id': 1, 'container_id': 1, 'shop_id': 1 }

export const limiters = {
    waitTime: .5 * 60 * 1000,
    executeAnyHow: 1.5 * 60 * 1000,
    maxCount: 200
}
