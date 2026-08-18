const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = (
  buffer,
  folder = "attendance/selfies"
) => {
  return new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
      return reject(
        new Error("Invalid or empty image buffer")
      );
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        use_filename: false,
        unique_filename: true,

        // Allow enough time for Cloudinary network upload.
        timeout: 120000,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        if (!result?.secure_url) {
          return reject(
            new Error(
              "Cloudinary upload completed without a secure URL"
            )
          );
        }

        resolve(result);
      }
    );

    uploadStream.on("error", (error) => {
      reject(error);
    });

    uploadStream.end(buffer);
  });
};

module.exports = uploadToCloudinary;