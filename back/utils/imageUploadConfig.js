const path = require("path");

const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".heic",
  ".heif",
  ".bmp",
  ".tiff",
  ".tif",
  ".ico"
];

const ALLOWED_MIMETYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/heic",
  "image/heif",
  "image/bmp",
  "image/tiff",
  "image/x-icon",
  "image/vnd.microsoft.icon"
];

const SUPPORTED_IMAGE_FORMATS_MESSAGE = "File upload only supports image files: jpg, jpeg, png, webp, gif, avif, heic, heif, bmp, tiff, tif, ico";

const DEFAULT_FILE_SIZE_LIMIT = 10 * 1024 * 1024; // 10MB default limit

/**
 * Validates an uploaded file's extension and mimetype.
 * Returns { valid: boolean, error?: string }
 */
function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype.toLowerCase();

  const isExtValid = ALLOWED_EXTENSIONS.includes(ext);
  const isMimeValid = ALLOWED_MIMETYPES.includes(mimetype);

  if (!isExtValid || !isMimeValid) {
    return {
      valid: false,
      error: SUPPORTED_IMAGE_FORMATS_MESSAGE
    };
  }

  return { valid: true };
}

/**
 * Multer compatible fileFilter middleware function
 */
function imageFileFilter(req, file, cb) {
  const result = validateImageFile(file);
  if (!result.valid) {
    return cb(new Error(result.error), false);
  }
  cb(null, true);
}

module.exports = {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIMETYPES,
  SUPPORTED_IMAGE_FORMATS_MESSAGE,
  DEFAULT_FILE_SIZE_LIMIT,
  validateImageFile,
  imageFileFilter
};
