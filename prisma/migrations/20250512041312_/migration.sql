/*
  Warnings:

  - You are about to drop the column `checkInId` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `checkOutId` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `timeRangeId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_checkInId_fkey";

-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_checkOutId_fkey";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "checkInId",
DROP COLUMN "checkOutId",
ADD COLUMN     "timeRangeId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_timeRangeId_fkey" FOREIGN KEY ("timeRangeId") REFERENCES "TimeRange"("id") ON DELETE CASCADE ON UPDATE CASCADE;
