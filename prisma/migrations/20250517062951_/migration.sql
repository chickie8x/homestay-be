/*
  Warnings:

  - The values [AVAILABLE,SELECTED,BOOKED] on the enum `State` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "State_new" AS ENUM ('COMPLETED', 'IN_PROGRESS');
ALTER TABLE "Booking" ALTER COLUMN "state" DROP DEFAULT;
ALTER TABLE "Booking" ALTER COLUMN "state" TYPE "State_new" USING ("state"::text::"State_new");
ALTER TYPE "State" RENAME TO "State_old";
ALTER TYPE "State_new" RENAME TO "State";
DROP TYPE "State_old";
ALTER TABLE "Booking" ALTER COLUMN "state" SET DEFAULT 'IN_PROGRESS';
COMMIT;

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "state" SET DEFAULT 'IN_PROGRESS';

-- AlterTable
ALTER TABLE "TimeRange" ADD COLUMN     "overnight" BOOLEAN NOT NULL DEFAULT false;
