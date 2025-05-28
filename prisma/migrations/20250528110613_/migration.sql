-- DropIndex
DROP INDEX "Booking_roomId_bookingDate_state_idx";

-- CreateIndex
CREATE INDEX "Booking_roomId_bookingDate_state_customerPhone_customerEmai_idx" ON "Booking"("roomId", "bookingDate", "state", "customerPhone", "customerEmail");
