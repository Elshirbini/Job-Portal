import {
  HydratedDocument,
  InferSchemaType,
  Schema,
  model,
} from "mongoose";

const post = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "users", required: true },
    privacy: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    text: { type: String, required: true },
    images: [{ imageKey: { type: String }, imageUrl: { type: String } }],
    video: { videoKey: { type: String }, videoUrl: { type: String } },
    document: { docKey: { type: String }, docUrl: { type: String } },
  },
  { timestamps: true }
);

export type Post = InferSchemaType<typeof post>;

export type PostDocument = HydratedDocument<Post>;

export const Post = model("posts", post);
