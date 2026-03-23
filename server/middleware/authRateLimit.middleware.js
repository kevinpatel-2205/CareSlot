import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 3,
  message: {
    success: false,
    message:
      "Too many attempts. Please try again after 1 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});