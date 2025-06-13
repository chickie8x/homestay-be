import express from "express";
import {prisma} from "../../config/index.cjs";
import argon2 from "argon2";
import jwt from "jsonwebtoken";

const router = express.Router();
router.use(express.json());
router.use(express.urlencoded({ extended: true }));


//register user
router.post("/register", async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Email or password is required" });
    }
    const { email, name, password } = req.body;

  //check if user already exists
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (user) {
    return res.status(400).json({ message: "User already exists" });
  }
  //create new user
  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      password: await argon2.hash(password),
    },
  });

  //generate token , expires in 1 month
  const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
    expiresIn: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({ message: "User created successfully", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Đã có lỗi xảy ra" });
  }
});



//login user
router.post("/login", async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Email or password is required" });
    }
    const { email, password } = req.body;

    //check if user exists
    const user = await prisma.user.findUnique({
      where: {
      email,
    },
  });
  if (!user) {
    return res.status(400).json({ message: "User không tồn tại" });
  }
  //verify password
  const isPasswordCorrect = await argon2.verify(user.password, password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Mật khẩu không đúng" });
  }

  //generate token , expires in 1 month
  const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET, {
    expiresIn: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ message: "Đăng nhập thành công", token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message || "Đã có lỗi xảy ra" });
  }
});

export default router;
