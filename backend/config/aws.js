const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
require('dotenv').config();

// Verify required AWS environment variables
const requiredEnvVars = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_BUCKET_NAME'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Missing required AWS environment variables:', missingVars);
    throw new Error(`Missing required AWS environment variables: ${missingVars.join(', ')}`);
}

// Configure AWS with explicit error handling
try {
    AWS.config.update({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        logger: console,
        maxRetries: 3
    });

    console.log('AWS Configuration updated successfully');
} catch (error) {
    console.error('Error updating AWS configuration:', error);
    throw error;
}

const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {
        Bucket: process.env.AWS_BUCKET_NAME
    }
});

// Verify S3 bucket exists and is accessible
s3.headBucket({ Bucket: process.env.AWS_BUCKET_NAME })
    .promise()
    .then(() => console.log('Successfully connected to S3 bucket:', process.env.AWS_BUCKET_NAME))
    .catch(error => console.error('Error connecting to S3 bucket:', error));

// Configure multer for file upload
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read',
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `spots/${uniqueSuffix}-${file.originalname}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    },
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB limit
    }
});

module.exports = { upload, s3 };
