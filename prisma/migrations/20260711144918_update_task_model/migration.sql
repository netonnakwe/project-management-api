/*
  Warnings:

  - You are about to drop the column `completed` on the `Task` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE');

-- CreateEnum
CREATE TYPE "public"."TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- AlterTable
ALTER TABLE "public"."Task" DROP COLUMN "completed",
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "description" TEXT,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "isArchived" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "priority" "public"."TaskPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "status" "public"."TaskStatus" NOT NULL DEFAULT 'TODO';
