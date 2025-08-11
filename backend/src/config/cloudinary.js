const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Verify Cloudinary configuration
const verifyCloudinaryConfig = async () => {
    try {
        await cloudinary.api.ping();
        logger.info('☁️ Cloudinary connected successfully');
        return true;
    } catch (error) {
        logger.error('Cloudinary configuration error:', error);
        return false;
    }
};

// Storage configuration for different file types
const createCloudinaryStorage = (folder, resourceType = 'image', allowedFormats = ['jpg', 'jpeg', 'png', 'webp']) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `rental-management/${folder}`,
            resource_type: resourceType,
            allowed_formats: allowedFormats,
            transformation: resourceType === 'image' ? [
                { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' }
            ] : undefined,
            public_id: (req, file) => {
                const timestamp = Date.now();
                const randomString = Math.random().toString(36).substring(2, 8);
                return `${timestamp}_${randomString}`;
            }
        }
    });
};

// Different storage configurations
const storageConfigs = {
    products: createCloudinaryStorage('products', 'image', ['jpg', 'jpeg', 'png', 'webp']),
    avatars: createCloudinaryStorage('avatars', 'image', ['jpg', 'jpeg', 'png']),
    reviews: createCloudinaryStorage('reviews', 'image', ['jpg', 'jpeg', 'png', 'webp']),
    documents: createCloudinaryStorage('documents', 'raw', ['pdf', 'doc', 'docx']),
    general: createCloudinaryStorage('general', 'auto')
};

// File filter function
const createFileFilter = (allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) => {
    return (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type ${file.mimetype} not allowed. Allowed types: ${allowedTypes.join(', ')}`), false);
        }
    };
};

// Multer configurations
const uploadConfigs = {
    products: multer({
        storage: storageConfigs.products,
        fileFilter: createFileFilter(['image/jpeg', 'image/png', 'image/webp']),
        limits: {
            fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
            files: 10
        }
    }),

    avatars: multer({
        storage: storageConfigs.avatars,
        fileFilter: createFileFilter(['image/jpeg', 'image/png']),
        limits: {
            fileSize: 2 * 1024 * 1024, // 2MB
            files: 1
        }
    }),

    reviews: multer({
        storage: storageConfigs.reviews,
        fileFilter: createFileFilter(['image/jpeg', 'image/png', 'image/webp']),
        limits: {
            fileSize: 3 * 1024 * 1024, // 3MB
            files: 5
        }
    }),

    documents: multer({
        storage: storageConfigs.documents,
        fileFilter: createFileFilter(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
        limits: {
            fileSize: 10 * 1024 * 1024, // 10MB
            files: 5
        }
    }),

    general: multer({
        storage: storageConfigs.general,
        limits: {
            fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
            files: 10
        }
    })
};

// Upload middleware factory
const createUploadMiddleware = (configName, fieldName, maxCount = 1) => {
    const upload = uploadConfigs[configName];

    if (maxCount === 1) {
        return upload.single(fieldName);
    } else {
        return upload.array(fieldName, maxCount);
    }
};

// Utility functions
const uploadToCloudinary = async (buffer, options = {}) => {
    return new Promise((resolve, reject) => {
        const uploadOptions = {
            resource_type: 'auto',
            folder: 'rental-management/temp',
            ...options
        };

        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        }).end(buffer);
    });
};

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });
        return result;
    } catch (error) {
        logger.error('Error deleting from Cloudinary:', error);
        throw error;
    }
};

const generateImageUrl = (publicId, transformations = {}) => {
    return cloudinary.url(publicId, {
        secure: true,
        ...transformations
    });
};

// Image transformation presets
const imageTransformations = {
    thumbnail: { width: 150, height: 150, crop: 'fill', quality: 'auto:low' },
    small: { width: 300, height: 300, crop: 'limit', quality: 'auto:good' },
    medium: { width: 600, height: 600, crop: 'limit', quality: 'auto:good' },
    large: { width: 1200, height: 1200, crop: 'limit', quality: 'auto:good' },
    avatar: { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto:good' }
};

// Generate multiple image sizes
const generateImageVariants = (publicId) => {
    const variants = {};

    Object.keys(imageTransformations).forEach(size => {
        variants[size] = generateImageUrl(publicId, imageTransformations[size]);
    });

    variants.original = generateImageUrl(publicId);

    return variants;
};

// Batch upload utility
const batchUpload = async (files, folder = 'general') => {
    const uploadPromises = files.map(file => {
        return uploadToCloudinary(file.buffer, {
            folder: `rental-management/${folder}`,
            resource_type: 'auto'
        });
    });

    try {
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        logger.error('Batch upload error:', error);
        throw error;
    }
};

// Cleanup old files utility
const cleanupOldFiles = async (folder, daysOld = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await cloudinary.api.delete_resources_by_prefix(
            `rental-management/${folder}/`,
            {
                resource_type: 'image',
                created_at: { $lt: cutoffDate.toISOString() }
            }
        );

        logger.info(`Cleaned up ${result.deleted.length} old files from ${folder}`);
        return result;
    } catch (error) {
        logger.error('Cleanup error:', error);
        throw error;
    }
};

module.exports = {
    cloudinary,
    uploadConfigs,
    createUploadMiddleware,
    uploadToCloudinary,
    deleteFromCloudinary,
    generateImageUrl,
    generateImageVariants,
    imageTransformations,
    batchUpload,
    cleanupOldFiles,
    verifyCloudinaryConfig
};