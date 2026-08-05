import {
  JobCreateInput,
  JobUncheckedCreateInput,
  JobUncheckedUpdateInput,
  JobUpdateInput,
  SavedJobCreateInput,
  SavedJobUncheckedCreateInput,
} from "../generated/prisma/models";
import { prisma } from "../prisma";

export const createJob = async (
  jobData: JobCreateInput | JobUncheckedCreateInput,
) => {
  return prisma.job.create({ data: jobData });
};

export const findJobByAndUpdate = async (
  query: any,
  updateData: JobUpdateInput | JobUncheckedUpdateInput,
) => {
  return prisma.job.update({
    where: query,
    data: updateData,
  });
};

export const getJobs = async (query?: any) => {
  return prisma.job.findMany({ where: query });
};

export const findJobBy = async (query: any) => {
  return prisma.job.findFirst({
    where: query,
    include: {
      user: { select: { user_id: true, full_name: true, location: true } },
    },
  });
};

export const deleteJobBy = async (query: any) => {
  return prisma.job.delete({ where: query });
};

export const createSavedJob = async (
  savedJobData: SavedJobCreateInput | SavedJobUncheckedCreateInput,
) => {
  return prisma.savedJob.create({ data: savedJobData });
};

export const deleteSavedJobBy = async (query: any) => {
  return prisma.savedJob.delete({ where: query });
};
