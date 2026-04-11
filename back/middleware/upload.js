const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg|tif|tiff)$/i)) {
            return cb(new Error("Only image files are allowed!"), false);
        }
        cb(null, true);
    },
});

module.exports = upload;
