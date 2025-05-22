/*
  Warnings:

  - Added the required column `bookingDate` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "bookingDate" TIMESTAMP(3) NOT NULL;
