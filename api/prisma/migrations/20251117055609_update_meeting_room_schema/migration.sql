/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `meeting_rooms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `meeting_rooms` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `equipment` on the `meeting_rooms` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `images` on the `meeting_rooms` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "meeting_rooms" ADD COLUMN     "bookingRules" JSONB,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "floor" TEXT,
ADD COLUMN     "maxDuration" INTEGER,
ADD COLUMN     "minDuration" INTEGER,
ADD COLUMN     "needApproval" BOOLEAN NOT NULL DEFAULT false,
DROP COLUMN "equipment",
ADD COLUMN     "equipment" JSONB NOT NULL,
DROP COLUMN "images",
ADD COLUMN     "images" JSONB NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "meeting_rooms_code_key" ON "meeting_rooms"("code");

-- CreateIndex
CREATE INDEX "meeting_rooms_status_idx" ON "meeting_rooms"("status");

-- CreateIndex
CREATE INDEX "meeting_rooms_capacity_idx" ON "meeting_rooms"("capacity");
