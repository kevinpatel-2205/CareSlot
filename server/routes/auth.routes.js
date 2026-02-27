import express from "express";
import {
  registerUser,
  loginUser,
  getMe,
  logoutUser,
  updateProfileImage,
  updatePassword,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import upload from "../middleware/multer.middleware.js";
import { authLimiter } from "../middleware/authRateLimit.middleware.js";

const router = express.Router();

router.post("/register", authLimiter, registerUser);
router.post("/login", authLimiter, loginUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe);
router.put(
  "/profile-image",
  protect,
  upload.single("image"),
  updateProfileImage,
);
router.put("/update-password", protect, updatePassword);

export default router;
