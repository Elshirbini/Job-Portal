import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export const createUser = async (
  userData: Prisma.UserCreateInput | Prisma.UserUncheckedCreateInput
) => {
  return prisma.user.create({ data: userData });
};

export const findUserByAndUpdate = async (
  query: any,
  updateData: Prisma.UserUpdateInput | Prisma.UserUncheckedUpdateInput
) => {
  return prisma.user.update({
    where: query,
    data: updateData,
  });
};

export const findUserBy = async (query: any) => {
  return prisma.user.findFirst({ where: query });
};


