import { prisma } from "../prisma";
import {
  PostCreateInput,
  PostCreateNestedOneWithoutImagesInput,
  PostImageCreateInput,
  PostImageUncheckedCreateInput,
  PostUncheckedCreateInput,
  PostUncheckedUpdateInput,
  PostUpdateInput,
  PostWhereUniqueInput,
} from "../generated/prisma/models";
import { singleton } from "tsyringe";

@singleton()
export class PostRepository {
  async addPost(
    postData: PostCreateInput | PostUncheckedCreateInput,
  ) {
    return prisma.post.create({ data: postData });
  }

  async findPostBy(query: PostWhereUniqueInput) {
    return prisma.post.findUnique({ where: query });
  }

  async updatePost(
    query: PostWhereUniqueInput,
    updateData: PostUpdateInput | PostUncheckedUpdateInput,
  ) {
    return prisma.post.update({
      where: query,
      data: updateData,
    });
  }

  async addPostImage(
    data:
      | (PostImageCreateInput & PostCreateNestedOneWithoutImagesInput)
      | (PostImageUncheckedCreateInput & PostCreateNestedOneWithoutImagesInput),
  ) {
    return prisma.postImage.create({ data });
  }

  async updatePostAndAddImagesInTransaction(
    query: PostWhereUniqueInput,
    updateData: PostUpdateInput | PostUncheckedUpdateInput,
    images:
      | (PostImageCreateInput &
          PostCreateNestedOneWithoutImagesInput & {
            post: { connect: { post_id: string } };
          })[]
      | (PostImageUncheckedCreateInput &
          PostCreateNestedOneWithoutImagesInput & {
            post: { connect: { post_id: string } };
          })[],
  ) {
    return prisma.$transaction(
      async (tx) => {
        for (const image of images) {
          await tx.postImage.create({
            data: {
              imageUrl: image.imageUrl,
              imageKey: image.imageKey,
              post: image.post,
            },
          });
        }
        return tx.post.update({ where: query, data: updateData });
      },
      {
        isolationLevel: "Serializable",
      },
    );
  }
}
