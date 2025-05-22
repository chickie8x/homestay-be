/*
  Warnings:

  - Added the required column `cccdBack` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cccdFront` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numberOfPeople` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "cccdBack" TEXT NOT NULL,
ADD COLUMN     "cccdFront" TEXT NOT NULL,
ADD COLUMN     "numberOfPeople" INTEGER NOT NULL;
