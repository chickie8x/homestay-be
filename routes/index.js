import express from "express";
import authRoutes from "./auth/index.js";
import adminRoutes from "./admin/index.js";
import publicRoutes from "./public/index.js";
import cors from "cors";

const router = express.Router();

router.use(cors());
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/public", publicRoutes);

export default router;
