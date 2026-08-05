import { prisma } from "../prisma";
import {
  UserCreateInput,
  UserUncheckedCreateInput,
  UserUncheckedUpdateInput,
  UserUpdateInput,
  UserWhereInput,
  UserWhereUniqueInput,
} from "../generated/prisma/models/User";

export const createUser = async (
  userData: UserCreateInput | UserUncheckedCreateInput,
) => {
  return prisma.user.create({ data: userData });
};

export const findUserByAndUpdate = async (
  query: UserWhereUniqueInput,
  updateData: UserUpdateInput | UserUncheckedUpdateInput,
) => {
  return prisma.user.update({
    where: query,
    data: updateData,
  });
};

export const findUserBy = async (query: UserWhereInput) => {
  return prisma.user.findFirst({ where: query });
};
