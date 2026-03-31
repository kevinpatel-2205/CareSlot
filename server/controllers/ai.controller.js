import { generateGuestResponse } from "../utils/aiModeration.js";
import { getDoctors } from "../services/ai.services.js";
// import redisClient from "../config/redis.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    switch (req.user.role) {
      case "guest":
        // const cacheKey = "homePage";
        // const cachedData = await redisClient.get(cacheKey);
        let data;
        // if (cachedData) {
        //   data = JSON.parse(cachedData);
        // } else {
          data = await getDoctors();
          await redisClient.setex(cacheKey, 3600 * 24, JSON.stringify(data));
        // }
        // const reply = await generateGuestResponse(message, data);
        return res.status(200).json({
          success: true,
          reply: reply,
        });
        break;
      case "patient":
        res.status(200).json({
          success: true,
          reply: `Patient Chat Bot is under development.`,
        });
        break;
      case "doctor":
        return res.status(200).json({
          success: true,
          reply: `Doctor Chat Bot is under development.`,
        });
        break;
      case "admin":
        return res.status(200).json({
          success: true,
          reply: "Admin Chat Bot is under development.",
        });
        break;
      default:
        res.status(400).json({
          success: false,
          message: "Invalid user role",
        });
    }
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      success: false,
      message: "AI server error",
    });
  }
};
