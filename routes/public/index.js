import express from "express";
import {prisma, State} from "../../config/index.cjs";
import Payos from "@payos/node";
import { generateLockKeys, generateOrderCode } from "../../utils/index.js";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const payos = new Payos(process.env.PAYMENT_CLIENT_ID, process.env.PAYMENT_API_KEY, process.env.PAYMENT_CHECKSUM_KEY);

router.get("/ping", async (req, res) => {
    res.status(200).json({ message: "Pong" });
});

router.get("/rooms", async (req, res) => {
    try {
        const rooms = await prisma.room.findMany({
            select: {
                id: true,
                name: true,
                timeRanges: {
                    select: {
                        id: true,
                        start: true,
                        end: true,
                        price: true,
                        overnight: true
                    },
                    orderBy: {
                        start: "asc"
                    }
                }
            },
            orderBy: {
                updatedAt: "asc"
            }
        });
        res.status(200).json({ message: "Phòng fetched successfully", rooms });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã có lỗi xảy ra" });
    }
});

router.get("/bookings", async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0)
    try {
        const bookings = await prisma.booking.findMany({
            select: {
                id: true,
                bookingDate: true,
                state: true,
                timeRange: {
                    select: {
                        id: true,
                    }
                }
            },
            where:{
                bookingDate: {
                    gte: today,
                },
                state: {
                    in: [State.PAID, State.PENDING]
                }
            }
        })
        res.status(200).json({ message: "Booking fetched successfully", bookings });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã có lỗi xảy ra" });
    }
});

router.get("/bookings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await prisma.booking.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                bookingDate: true,
                checkin: true,
                checkout: true,
                totalCost: true,
                customerName: true,
                customerEmail: true,
                customerPhone: true,
                numberOfPeople: true,
                room: {
                    select: {
                        name: true,
                    }
                }
            }
        });
        res.status(200).json({ message: "Booking fetched successfully", booking });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã có lỗi xảy ra" });
    }
});

router.post('/bookings/create', async (req, res) => {
    try {
      const {
        checkin,
        checkout,
        timeRange,
        roomId,
        bookingDate,
        customerName,
        customerEmail,
        customerPhone,
        totalCost,
        cccdFront,
        cccdBack,
        numberOfPeople,
      } = req.body;
  
      const timeRangeIds = JSON.parse(timeRange).map((timeRange) => ({
        id: timeRange.id,
      }));
      const timeRangeIdList = timeRangeIds.map((tr) => tr.id);
  
      const bookingDateObj = new Date(bookingDate);
      const startOfDay = new Date(bookingDateObj.setHours(0, 0, 0, 0));
      const endOfDay = new Date(bookingDateObj.setHours(23, 59, 59, 999));
  
      const result = await prisma.$transaction(async (tx) => {
        const lockKey = generateLockKeys(roomId, bookingDate, timeRangeIdList);
        console.log(lockKey);
        const lockResult = await tx.$queryRaw`
          SELECT pg_try_advisory_xact_lock(${lockKey}) AS acquired;
        `;
        if (!lockResult[0].acquired) {
          throw new Error('Resource is currently locked, please try again');
        }
        // Kiểm tra booking trùng
        const conflictingBooking = await tx.booking.findFirst({
          where: {
            roomId,
            bookingDate: {
              gte: startOfDay,
              lte: endOfDay,
            },
            state: { in: [State.PENDING, State.PAID] },
            timeRange: {
              some: {
                id: { in: timeRangeIdList },
              },
            },
          },
        });
        if (conflictingBooking) {
          throw new Error('Trùng lịch đặt phòng, hãy chọn khung thời gian khác');
        }
  
        // Tạo booking
        const newBooking = await tx.booking.create({
          data: {
            checkin,
            checkout,
            timeRange: {
              connect: timeRangeIds,
            },
            roomId,
            customerName,
            customerEmail,
            customerPhone,
            totalCost,
            cccdFront,
            cccdBack,
            numberOfPeople,
            bookingDate: bookingDateObj,
          },
        });
        return { booking: newBooking};
      });
  
      res.status(200).json({
        message: 'Booking created successfully',
        booking: result.booking,
      });
    } catch (error) {
      console.error('Error creating booking:', error.message);
      res.status(400).json({ message: error.message || 'Đã có lỗi xảy ra' });
    } finally {
      await prisma.$disconnect();
    }
  });

router.post("/payment/create-payment-link", async (req, res) => {
    try {
        const { amount, bookingId } = req.body;
        const orderCode = generateOrderCode();
        const order = {
            bookingId,
            amount,
            orderCode: String(orderCode),
        }
        const result = await prisma.$transaction(async (tx) => {
          const booking = await tx.booking.findUnique({
            where: {
              id: bookingId,
            },
          });
          if (!booking) {
            throw new Error('Booking not found');
          }
          const checkOrder = await tx.order.findUnique({
            where: {
              bookingId,
            },
          });
          if (checkOrder) {
            throw new Error('Order already exists');
          }
          const newOrder = await tx.order.create({
            data: order,
          });
          const paymentLink = await payos.createPaymentLink({
            amount,
            description: 'Đặt phòng',
            orderCode,
            returnUrl: `http://localhost:5173/payment/success?bookingId=${bookingId}`,
            cancelUrl: `http://localhost:5173/payment/cancel?bookingId=${bookingId}`,
          });
          console.log(paymentLink);
          return { paymentLink };
        });
        res.status(200).json({ message: "Payment link created successfully", paymentLink: result.paymentLink });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã có lỗi xảy ra" });
    }
});

router.post("/bookings/cancel", async (req, res) => {
  try {
      const { bookingId, orderCode } = req.body;

      // Validate input
      if (!bookingId || !orderCode) {
          return res.status(400).json({ message: "Thông tin không hợp lệ" });
      }

      // Fetch booking and order in a single transaction
      const [booking, order] = await prisma.$transaction([
          prisma.booking.findUniqueOrThrow({
              where: { id: bookingId },
          }),
          prisma.order.findUniqueOrThrow({
              where: { bookingId },
          }),
      ]);

      // Validate order code
      if (order.orderCode !== orderCode) {
          return res.status(400).json({ message: "Mã đơn hàng không hợp lệ" });
      }

      // Check if booking is already cancelled
      if (booking.state === State.CANCELLED) {
          return res.status(400).json({ message: "Booking không hợp lệ" });
      }

      // Update booking and order in a single transaction
      const [updatedBooking, updatedOrder] = await prisma.$transaction([
          prisma.booking.update({
              where: { id: bookingId },
              data: { state: State.CANCELLED },
          }),
          prisma.order.update({
              where: { bookingId: bookingId },
              data: { state: State.CANCELLED },
          }),
      ]);

      return res.status(200).json({
          message: "Đã hủy đặt phòng",
      });
  } catch (error) {
      console.error("Lỗi khi hủy đặt phòng:", error);
      const status = error instanceof prisma.PrismaClientKnownRequestError && error.code === 'P2025' ? 404 : 500;
      const message = status === 404 ? "Booking hoặc order không tồn tại" : "Đã có lỗi xảy ra";
      return res.status(status).json({ message });
  }
});

router.post('/payment/webhook', async (req, res) => {
    try {
      const webhookData = payos.verifyPaymentWebhookData(req.body);
      console.log(webhookData);
      if(webhookData.orderCode === 123 && webhookData.amount === 3000) {
        console.log('Webhook success');
        res.status(200).json({ status: "success" });
        return;
      }
      let webhookState;
      if(webhookData.code === '00') {
        webhookState = State.PAID;
      }
      else {
        webhookState = State.CANCELLED;
      }
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { orderCode: String(webhookData.orderCode) },
          data: { state: webhookState },
        });
        await tx.booking.update({
          where: { id: order.bookingId },
          data: { state: webhookState },
        });
      });
      res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({ status: 'error', message: error.message });
    }
});


export default router;