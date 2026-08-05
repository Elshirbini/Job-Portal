import express from "express";
import { upload } from "../config/multerDisk";
import { verifyToken } from "../middlewares/verifyToken";
import { createPostValidator } from "./post.validator";
import { validateInputs } from "../middlewares/validateInputs";
import { PostController } from "./post.controller";
import { container } from "tsyringe";

const router = express.Router();
const postController = container.resolve(PostController);

router.use(verifyToken);

router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "video", maxCount: 1 },
    { name: "document", maxCount: 1 },
  ]),
  createPostValidator,
  validateInputs,
  postController.createPost,
);

export const postRoutes = router;
