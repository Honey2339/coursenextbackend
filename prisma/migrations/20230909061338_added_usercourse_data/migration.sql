/*
  Warnings:

  - Added the required column `description` to the `UserCourse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `UserCourse` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `UserCourse` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCourse" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL;
