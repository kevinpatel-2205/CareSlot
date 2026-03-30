import express from "express";

import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { JWT_SECRET } from "../utils/env.js";

import { chatWithAI } from "../controllers/ai.controller.js";

const router = express.Router();

router.post(
  "/chat",
  async (req, res, next) => {
    try {
      const token = req.cookies.token;

      req.user = req.user || {};

      if (!token) {
        req.user.role = "guest";
        return next();
      }

      const decoded = jwt.verify(token, JWT_SECRET);

      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      req.user = user;

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  },
  chatWithAI,
);

export default router;
