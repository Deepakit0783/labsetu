
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads", "reports");

// Create upload directory if it does not exist
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      `${Date.now()}-${require("crypto").randomUUID()}.pdf`;

    cb(null, uniqueName);
  },
});

// Accept PDF files only
const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf" || file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"));
  }

  cb(null, true);
};

const uploadReport = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maximum 5 MB
    files: 1,
  },
});

module.exports = uploadReport;
