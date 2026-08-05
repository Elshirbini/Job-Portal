-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('individual', 'company');

-- CreateEnum
CREATE TYPE "AttendanceType" AS ENUM ('remote', 'hybrid', 'onSite');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('fullTime', 'partTime', 'freelance', 'internship');

-- CreateEnum
CREATE TYPE "Privacy" AS ENUM ('public', 'friends', 'private');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('completed', 'processing', 'failed');

-- CreateTable
CREATE TABLE "User" (
    "user_id" UUID NOT NULL,
    "google_id" TEXT,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT,
    "location" TEXT,
    "imageKey" TEXT,
    "imageUrl" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "type" "UserType" NOT NULL DEFAULT 'individual',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "codeValidation" TEXT,
    "codeValidationExpire" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Job" (
    "job_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT[],
    "keyResponsibilities" TEXT[],
    "qualifications" TEXT[],
    "benefits" TEXT[],
    "attendanceType" "AttendanceType" NOT NULL,
    "employmentType" "EmploymentType" NOT NULL,
    "numOfSaves" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("job_id")
);

-- CreateTable
CREATE TABLE "SavedJob" (
    "saved_job_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedJob_pkey" PRIMARY KEY ("saved_job_id")
);

-- CreateTable
CREATE TABLE "JobImage" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "imageKey" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "privacy" "Privacy" NOT NULL DEFAULT 'public',
    "text" TEXT NOT NULL,
    "videoKey" TEXT,
    "videoUrl" TEXT,
    "docKey" TEXT,
    "docUrl" TEXT,
    "status" "Status" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("post_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_google_id_key" ON "User"("google_id");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "SavedJob_user_id_job_id_key" ON "SavedJob"("user_id", "job_id");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedJob" ADD CONSTRAINT "SavedJob_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("job_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobImage" ADD CONSTRAINT "JobImage_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "Post"("post_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
