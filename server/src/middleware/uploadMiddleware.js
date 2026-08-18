const multer = require("multer");
const AppError = require("../utils/AppError");

// Memory storage use kar rahe hain.
// File ko server disk par permanently save nahi karna.
// Direct Cloudinary par upload karenge.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new AppError(
        "Only JPEG, PNG and WebP images are allowed",
        400
      ),
      false
    );
  }

  cb(null, true);
};

const upload = multer({
  storage,

  limits: {
    // Maximum selfie size = 5 MB
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter,
});

module.exports = upload;