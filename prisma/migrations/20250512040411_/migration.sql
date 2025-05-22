/*
  Warnings:

  - You are about to drop the column `checkIn` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `checkOut` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `checkInId` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkOutId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "checkIn",
DROP COLUMN "checkOut",
ADD COLUMN     "checkInId" TEXT NOT NULL,
ADD COLUMN     "checkOutId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_checkInId_fkey" FOREIGN KEY ("checkInId") REFERENCES "TimeRange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_checkOutId_fkey" FOREIGN KEY ("checkOutId") REFERENCES "TimeRange"("id") ON DELETE CASCADE ON UPDATE CASCADE;
