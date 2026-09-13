const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name' &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_KEY !== 'your_api_key';

let uploadAvatar, uploadPostMedia, uploadImage, deleteFromCloudinary, cloudinary;

const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if ([...allowedImageTypes, ...allowedVideoTypes].some(t => allowedTypes.includes(t) && t === file.mimetype)) {
    cb(null, true);
  } else if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

if (isCloudinaryConfigured) {
  cloudinary = require('cloudinary').v2;
  const { CloudinaryStorage } = require('multer-storage-cloudinary');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'campusconnect/avatars',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    },
  });

  const postMediaStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      const isVideo = allowedVideoTypes.includes(file.mimetype);
      return {
        folder: 'campusconnect/posts',
        resource_type: isVideo ? 'video' : 'image',
        allowed_formats: isVideo ? ['mp4', 'webm', 'mov'] : ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        transformation: isVideo ? [] : [{ width: 1200, quality: 'auto' }],
      };
    },
  });

  const genericImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'campusconnect/misc',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, quality: 'auto' }],
    },
  });

  uploadAvatar = multer({
    storage: avatarStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter(allowedImageTypes),
  });

  uploadPostMedia = multer({
    storage: postMediaStorage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: fileFilter([...allowedImageTypes, ...allowedVideoTypes]),
  });

  uploadImage = multer({
    storage: genericImageStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter(allowedImageTypes),
  });

  deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    if (!publicId) return;
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch (err) {
      console.error('Cloudinary delete error:', err.message);
    }
  };
} else {
  // Local disk storage fallback
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname) || (file.mimetype.startsWith('video/') ? '.mp4' : '.jpg');
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
  });

  const formatLocalFile = (req, file) => {
    // When saved locally, file.path is replaced or enhanced with public URL
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    file.path = `${protocol}://${host}/uploads/${file.filename}`;
  };

  const wrapMulter = (multerInstance) => {
    return {
      single: (fieldName) => (req, res, next) => {
        multerInstance.single(fieldName)(req, res, (err) => {
          if (err) return next(err);
          if (req.file) formatLocalFile(req, req.file);
          next();
        });
      },
      array: (fieldName, maxCount) => (req, res, next) => {
        multerInstance.array(fieldName, maxCount)(req, res, (err) => {
          if (err) return next(err);
          if (req.files) req.files.forEach(f => formatLocalFile(req, f));
          next();
        });
      }
    };
  };

  const localAvatar = multer({
    storage: localStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: fileFilter(allowedImageTypes),
  });

  const localPost = multer({
    storage: localStorage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: fileFilter([...allowedImageTypes, ...allowedVideoTypes]),
  });

  const localGeneric = multer({
    storage: localStorage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: fileFilter(allowedImageTypes),
  });

  uploadAvatar = wrapMulter(localAvatar);
  uploadPostMedia = wrapMulter(localPost);
  uploadImage = wrapMulter(localGeneric);

  deleteFromCloudinary = async () => {};
}

module.exports = { uploadAvatar, uploadPostMedia, uploadImage, deleteFromCloudinary, cloudinary };
