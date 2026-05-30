const multer = require("multer");
const { imageFileFilter } = require("../utils/imageUploadConfig");

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: imageFileFilter,
});

module.exports = upload;
