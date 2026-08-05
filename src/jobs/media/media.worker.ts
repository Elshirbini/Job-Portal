import "reflect-metadata";
import { logger } from "../../config/logger";
import { PostRepository } from "../../post/post.repository";
import { CloudflareService } from "../../services/cloudflareR2";
import { createChannel } from "../rabbitmq";
import { promises as fs } from "fs";
import { injectable } from "tsyringe";

@injectable()
export class MediaWorker {
  constructor(
    private cloudflareService: CloudflareService,
    private postRepository: PostRepository,
  ) {}

  async start() {
    const channel = await createChannel();

    await channel.assertQueue("media-queue", { durable: true });
    channel.prefetch(1);

    logger.info("🎯 Media worker started...");

    channel.consume("media-queue", async (msg) => {
      if (!msg) return;

      let images: {
        imageUrl: string;
        imageKey: string;
        post: { connect: { post_id: string } };
      }[] = [];

      let document: {
        docKey: string;
        docUrl: string;
      } | null = null;

      let video: {
        videoKey: string;
        videoUrl: string;
      } | null = null;

      try {
        const job = JSON.parse(msg.content.toString());

        const post = await this.postRepository.findPostBy({ post_id: job.post_id });
        if (!post) {
          logger.error("Post not found");
          channel.nack(msg, false, false);
          return;
        }

        if (job.files.images) {
          for (const file of job.files.images) {
            const { url, key } = await this.cloudflareService.uploadFileS3(
              Buffer.from(file.buffer),
              `images/${new Date().toISOString()}-${file.originalname}`,
              file.mimetype,
            );
            images.push({
              imageUrl: url,
              imageKey: key,
              post: { connect: { post_id: post.post_id as string } },
            });
            await fs.unlink(file.path);
          }
        }

        if (job.files.document) {
          const { url, key } = await this.cloudflareService.uploadFileS3(
            Buffer.from(job.files.document[0].buffer),
            `documents/${new Date().toISOString()}-${job.files.document[0].originalname}`,
            job.files.document[0].mimetype,
          );
          document = { docKey: key, docUrl: url };
          await fs.unlink(job.files.document[0].path);
        }

        if (job.files.video) {
          const { url, key } = await this.cloudflareService.uploadFileS3(
            Buffer.from(job.files.video[0].buffer),
            `videos/${new Date().toISOString()}-${job.files.video[0].originalname}`,
            job.files.video[0].mimetype,
          );
          video = { videoKey: key, videoUrl: url };
          await fs.unlink(job.files.video[0].path);
        }

        const result = await this.postRepository.updatePostAndAddImagesInTransaction(
          { post_id: post.post_id },
          {
            user: { connect: { user_id: job.user_id } },
            docKey: document?.docKey,
            docUrl: document?.docUrl,
            videoKey: video?.videoKey,
            videoUrl: video?.videoUrl,
            status: "completed",
          },
          images,
        );

        if (result.status === "completed") {
          logger.info("Media job completed");
          // notify user
        } else {
          logger.error("Media job failed");
          channel.nack(msg, false, false);
          return;
        }

        channel.ack(msg);
      } catch (err) {
        logger.error("Worker error:", err);
        channel.nack(msg, false, false);
      }
    });
  }
}

// Bootstrap the worker
import { container } from "tsyringe";
const worker = container.resolve(MediaWorker);
worker.start();
