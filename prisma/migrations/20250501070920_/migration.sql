-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_timeRangeId_fkey";

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_timeRangeId_fkey" FOREIGN KEY ("timeRangeId") REFERENCES "TimeRange"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;
