import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

// Create temp directory if it doesn't exist

const tempDir = path.join(process.cwd(), "temp-uploads");
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    const uniqueId = uuidv4();
    cb(null, `${uniqueId}-${file.originalname}`);
  },
});

// File filter
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: CallableFunction,
) => {
  if (file.fieldname === "video") {
    if (!file.originalname.match(/\.(mp4|mov|avi|mkv)$/)) {
      return cb(new Error("Only video files are allowed!"), false);
    }
  } else if (file.fieldname === "thumbnail" || file.fieldname === "images") {
    if (!file.originalname.match(/\.(jpg|png|jpeg|webp)$/)) {
      return cb(new Error("Only image files are allowed!"), false);
    }
  } else if (file.fieldname === "document") {
    if (!file.originalname.match(/\.(pdf)$/)) {
      return cb(new Error("Only document files are allowed!"), false);
    }
  } else {
    return cb(new Error("Unexpected field"), false);
  }
  cb(null, true);
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 1024 * 5, // 5 GB limit
  },
});
