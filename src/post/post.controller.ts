import { Request, Response } from "express";
import { logger } from "../config/logger";
import { PostRepository } from "./post.repository";
import { success } from "../utils/response";
import { addMediaJob } from "../jobs/media/media.producer";
import { validateUploadedFileDisk } from "../utils/file-validation.util";
import { injectable } from "tsyringe";

@injectable()
export class PostController {
  constructor(private postRepository: PostRepository) {}

  public createPost = async (req: Request, res: Response) => {
    const { text, privacy } = req.body;
    const user_id = req.user_id!;
    const files = req.files as {
      images?: Express.Multer.File[];
      document?: Express.Multer.File[];
      video?: Express.Multer.File[];
    };

    if (!files || Object.keys(files).length === 0) {
      await this.postRepository.addPost({ user_id, text, privacy, status: "completed" });
      return success(res, 201, { message: "Post created successfully" });
    }
    if (files.images) {
      for (const file of files.images) {
        const buffer = await validateUploadedFileDisk(file, {
          allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
          maxSizeInMB: 20,
        });
        file.buffer = buffer;
      }
    }
    if (files.document) {
      for (const file of files.document) {
        const buffer = await validateUploadedFileDisk(file, {
          allowedMimeTypes: ["application/pdf"],
          maxSizeInMB: 20,
        });
        file.buffer = buffer;
      }
    }
    if (files.video) {
      for (const file of files.video) {
        const buffer = await validateUploadedFileDisk(file, {
          allowedMimeTypes: ["video/mp4"],
          maxSizeInMB: 20,
        });
        file.buffer = buffer;
      }
    }

    const post = await this.postRepository.addPost({ user_id, text, privacy, status: "processing" });

    await addMediaJob({ user_id, post_id: post.post_id, files });

    return success(res, 201, { message: "Post will processing" });
  };
}
