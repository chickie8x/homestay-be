import express from "express";
import prisma from "../../config/index.cjs";
import Payos from "@payos/node";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const payos = new Payos(process.env.PAYMENT_CLIENT_ID, process.env.PAYMENT_API_KEY, process.env.PAYMENT_CHECKSUM_KEY);

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
    try {
        const bookings = await prisma.booking.findMany({
            select: {
                id: true,
                bookingDate: true,
                timeRange: {
                    select: {
                        id: true,
                    }
                }
            }
        })
        res.status(200).json({ message: "Booking fetched successfully", bookings });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã có lỗi xảy ra" });
    }
});

router.post("/bookings/create", async (req, res) => {
    try {
        const { checkin, checkout, timeRange, roomId, bookingDate, customerName, customerEmail, customerPhone, totalCost, cccdFront, cccdBack, numberOfPeople } = req.body;
        const timeRangeIds = JSON.parse(timeRange).map((timeRange) => {
            return { id: timeRange.id }
        })
        const booking = await prisma.booking.create({
            data: {
                checkin,
                checkout,
                timeRange: {
                    connect: timeRangeIds
                },
                roomId,
                customerName,
                customerEmail,
                customerPhone,
                totalCost,
                cccdFront,
                cccdBack,
                numberOfPeople,
                bookingDate,
            },
        });
        res.status(200).json({ message: "Booking created successfully", booking });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Đã có lỗi xảy ra" });
    }
});

export default router;