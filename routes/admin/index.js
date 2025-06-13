import express from "express";
import { verifyToken } from "../../middleware/auth.js";
import {prisma} from "../../config/index.cjs";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// rooms section
router.post("/cms/room/create", verifyToken, async (req, res) => {
  try {
    const { name, description, capacity, timeRanges, amenities, images } = req.body;
    if(!name) {
      return res.status(400).json({ message: "Tên phòng không được để trống" });
    }
    
    const newRoom = await prisma.room.create({
      data: {
        name,
        description,
        capacity: capacity || 2,
        amenities: amenities || [],
        images: images || [],
        timeRanges: {
          create: timeRanges.map(timeRange => ({
            start: timeRange.start,
            end: timeRange.end,
            price: timeRange.price
          }))
        }
      }
    });
    res.status(200).json({ message: "Tạo phòng thành công", room: newRoom });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
});

router.get("/cms/room", verifyToken, async (req, res) => {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        timeRanges: true
      },
      orderBy: {
        updatedAt: "desc"
      }
    });
    res.status(200).json({ message: "Phòng fetched successfully", rooms });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
});

router.delete("/cms/room/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const room = await prisma.room.delete({ where: { id } });
    res.status(200).json({ message: "Đã xoá phòng" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Đã có lỗi xảy ra" });
  }
});

router.put("/cms/room/:id", verifyToken, async (req, res) => {
    const { id } = req.params;
    const { name, description, capacity, timeRanges, amenities, images } = req.body;
    const room = await prisma.room.update({
      where: { id },
      data: {
        name,
        description,
        capacity: capacity || 2,
        amenities: amenities || [],
        images: images || [],
      },
      include: {
        timeRanges: {
          create: timeRanges.map(timeRange => ({
            start: timeRange.start,
            end: timeRange.end,
            price: timeRange.price,
            overnight: timeRange.start > timeRange.end
          }))
        }
      }
    });
    res.status(200).json({ message: "Cập nhật phòng thành công", room });
});






export default router;
