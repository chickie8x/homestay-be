/*
  Warnings:

  - Added the required column `checkin` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `checkout` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_timeRangeId_fkey";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "checkin" TEXT NOT NULL,
ADD COLUMN     "checkout" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_BookingToTimeRange" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BookingToTimeRange_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BookingToTimeRange_B_index" ON "_BookingToTimeRange"("B");

-- AddForeignKey
ALTER TABLE "_BookingToTimeRange" ADD CONSTRAINT "_BookingToTimeRange_A_fkey" FOREIGN KEY ("A") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BookingToTimeRange" ADD CONSTRAINT "_BookingToTimeRange_B_fkey" FOREIGN KEY ("B") REFERENCES "TimeRange"("id") ON DELETE CASCADE ON UPDATE CASCADE;
