import { Request } from "express";
import multer from "multer";
const storage = multer.memoryStorage();

const fileFilter = (
  req: Request,
  file: { originalname: string },
  cb: CallableFunction
) => {
  if (!file.originalname.match(/\.(jpg|png|jpeg|webp|pdf)$/)) {
    return cb(new Error("Only Image files are allowed!"), false);
  }
  cb(null, true);
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB limit
  },
});
