/*
  Warnings:

  - You are about to drop the `Price` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `price` to the `TimeRange` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Price" DROP CONSTRAINT "Price_timeRangeId_fkey";

-- AlterTable
ALTER TABLE "Room" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "TimeRange" ADD COLUMN     "price" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Price";
