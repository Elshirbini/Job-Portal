import express from "express";
import { upload } from "../config/multerMemory";
import { verifyToken } from "../middlewares/verifyToken";
import { createPostValidator } from "./post.validator";
import { validateInputs } from "../middlewares/validateInputs";
import { createPost } from "./post.controller";
import { validateFiles } from "../middlewares/validateFiles";

const router = express.Router();

router.use(verifyToken);

router.post(
  "/",
  // createPostValidator,
  validateInputs,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  validateFiles,
  createPost
);

export const postRoutes = router;
