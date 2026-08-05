import {
  JobCreateInput,
  JobUncheckedCreateInput,
  JobUncheckedUpdateInput,
  JobUpdateInput,
  SavedJobCreateInput,
  SavedJobUncheckedCreateInput,
} from "../generated/prisma/models";
import { prisma } from "../prisma";
import { singleton } from "tsyringe";

@singleton()
export class JobRepository {
  async createJob(
    jobData: JobCreateInput | JobUncheckedCreateInput,
  ) {
    return prisma.job.create({ data: jobData });
  }

  async findJobByAndUpdate(
    query: any,
    updateData: JobUpdateInput | JobUncheckedUpdateInput,
  ) {
    return prisma.job.update({
      where: query,
      data: updateData,
    });
  }

  async getJobs(query?: any) {
    return prisma.job.findMany({ where: query });
  }

  async findJobBy(query: any) {
    return prisma.job.findFirst({
      where: query,
      include: {
        user: { select: { user_id: true, full_name: true, location: true } },
      },
    });
  }

  async deleteJobBy(query: any) {
    return prisma.job.delete({ where: query });
  }

  async createSavedJob(
    savedJobData: SavedJobCreateInput | SavedJobUncheckedCreateInput,
  ) {
    return prisma.savedJob.create({ data: savedJobData });
  }

  async deleteSavedJobBy(query: any) {
    return prisma.savedJob.delete({ where: query });
  }
}
