import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const addPost = async (
  postData: Prisma.PostCreateInput | Prisma.PostUncheckedCreateInput
) => {
  return prisma.post.create({ data: postData });
};
