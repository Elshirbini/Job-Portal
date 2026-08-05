import { prisma } from "../prisma";
import {
  UserCreateInput,
  UserUncheckedCreateInput,
  UserUncheckedUpdateInput,
  UserUpdateInput,
  UserWhereInput,
  UserWhereUniqueInput,
} from "../generated/prisma/models/User";
import { singleton } from "tsyringe";

@singleton()
export class UserRepository {
  async createUser(userData: UserCreateInput | UserUncheckedCreateInput) {
    return prisma.user.create({ data: userData });
  }

  async findUserByAndUpdate(
    query: UserWhereUniqueInput,
    updateData: UserUpdateInput | UserUncheckedUpdateInput,
  ) {
    return prisma.user.update({
      where: query,
      data: updateData,
    });
  }

  async findUserBy(query: UserWhereInput) {
    return prisma.user.findFirst({ where: query });
  }
}
