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

export const addPost = async (
  postData: PostCreateInput | PostUncheckedCreateInput,
) => {
  return prisma.post.create({ data: postData });
};

export const findPostBy = async (query: PostWhereUniqueInput) => {
  return prisma.post.findUnique({ where: query });
};

export const updatePost = async (
  query: PostWhereUniqueInput,
  updateData: PostUpdateInput | PostUncheckedUpdateInput,
) => {
  return prisma.post.update({
    where: query,
    data: updateData,
  });
};

export const addPostImage = async (
  data:
    | (PostImageCreateInput & PostCreateNestedOneWithoutImagesInput)
    | (PostImageUncheckedCreateInput & PostCreateNestedOneWithoutImagesInput),
) => {
  return prisma.postImage.create({ data });
};

export const updatePostAndAddImagesInTransaction = async (
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
) => {
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
};
