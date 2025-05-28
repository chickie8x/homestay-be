import crypto from "crypto";

export const generateLockKeys = (roomId, bookingDate, timeRangeIds) => {
    const sortedTimeRangeIds = [...timeRangeIds].sort();
  const dateStr = new Date(bookingDate).toISOString().split('T')[0];
  const lockKey = `${roomId}:${dateStr}:${sortedTimeRangeIds.join(',')}`;
  const lockKeyHash = [...lockKey].reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
  }, 0);
  return lockKeyHash;
}

export const generateOrderCode = () => {
    const orderCode = Number(String(Date.now()).slice(-10)) + Math.floor(Math.random() * 100);
    return orderCode;
}
