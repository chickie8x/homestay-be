-- CreateIndex
CREATE INDEX "Booking_roomId_bookingDate_state_idx" ON "Booking"("roomId", "bookingDate", "state");
