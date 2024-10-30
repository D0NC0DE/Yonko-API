const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client } = require('@aws-sdk/client-s3');
const { SPACE_ACCESS_KEY, SPACE_ACCESS_ID } = require('../../config/config');
const { ErrorHandler } = require('../../utils/errorHandler');

// Configure AWS SDK v3
const s3 = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: SPACE_ACCESS_ID,
        secretAccessKey: SPACE_ACCESS_KEY,
    },
    endpoint: 'https://ams3.digitaloceanspaces.com',
});

// Helper function to generate S3 storage settings
const generateMulterStorage = (isLogo = false) => {
    return multerS3({
        s3: s3,
        bucket: 'yonko-drive',
        acl: 'public-read',
        key: function (req, file, cb) {
            const shopId = req.shopId; // Changed to req.body.shopId to ensure it's fetched from the request body
            let fileName;

            if (isLogo) {
                fileName = `${shopId}.png`; // Use shopId for logo filenames
                cb(null, `logos/${fileName}`);
            } else {
                const timestamp = Date.now().toString();
                fileName = `${timestamp}_${file.originalname}`; // Create a unique filename for other media
                cb(null, `media/${shopId}/${fileName}`); // Store in the media directory
            }
        },
    });
};

// Multer middleware to upload files to S3
const upload = multer({
    storage: generateMulterStorage(),
}).array('media', 10);

// Multer middleware for logo upload
const uploadLogo = multer({
    storage: generateMulterStorage(true),
}).single('logo');

// Upload files route
exports.upload = (req, res) => {
    upload(req, res, (error) => {
        if (error) {
            return next(new ErrorHandler(500, 'Error uploading file', error.message));
        }

        if (!req.files || req.files.length === 0) {
            return next(new ErrorHandler(400, 'No file was uploaded.'));
        }

        const fileUrls = req.files.map(file => file.location);
        res.status(200).json({ message: 'Files uploaded successfully', files: fileUrls });
    });
};

// Update logo route
exports.updateLogo = (req, res, next) => {
    try {
        uploadLogo(req, res, (error) => {
            if (error) {
                return next(new ErrorHandler(500, 'Error uploading file', error.message));
            }

            if (!req.file) {
                return next(new ErrorHandler(400, 'No file was uploaded.'));
            }

            res.status(200).json({ message: 'Logo uploaded successfully', file: req.file.location });
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};