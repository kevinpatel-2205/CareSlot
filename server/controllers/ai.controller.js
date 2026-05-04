import {
  generateAdminResponse,
  generateDoctorResponse,
  generateGuestResponse,
  generatePatientResponse,
} from "../utils/aiModeration.js";
import {
  getAdminAppointmentData,
  getAdminDoctorData,
  getAdminPatientData,
  getAdminReviewData,
  getDoctorData,
  getGuestData,
  getPatientAllDoctors,
  getPatientAppointments,
  getPatientData,
  getPatientNearDoctors,
} from "../services/ai.services.js";
import redisClient from "../config/redis.js";
import {
  findAdminFunction,
  findPatientFunction,
} from "../utils/findAiFunctions.js";

export const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;

    switch (req.user.role) {
      case "guest":
        const guestCacheKey = "homePage";
        const guestCachedData = await redisClient.get(guestCacheKey);
        let guestData;
        if (guestCachedData) {
          guestData = JSON.parse(guestCachedData);
        } else {
          guestData = await getGuestData();
          await redisClient.set(guestCacheKey, JSON.stringify(guestData), {
            EX: 3600 * 24,
          });
        }
        const guestReply = await generateGuestResponse(message, guestData);
        res.status(200).json({
          success: true,
          reply: {
            type: guestReply.type,
            message: guestReply.message,
          },
        });
        break;
      case "patient":
        const patientFunctionName = JSON.parse(
          await findPatientFunction(message),
        );

        let patientData;
        let patientCacheKey;
        let patientCachedData;

        if (patientFunctionName.functionName === "getPatientData") {
          patientCacheKey = `patientAIData:${req.user._id}:getPatientData`;
          patientCachedData = await redisClient.get(patientCacheKey);
          if (patientCachedData) {
            patientData = JSON.parse(patientCachedData);
          } else {
            patientData = await getPatientData(req.user._id);
            await redisClient.set(
              patientCacheKey,
              JSON.stringify(patientData),
              {
                EX: 3600 * 24,
              },
            );
          }
        } else if (
          patientFunctionName.functionName === "getPatientAllDoctors"
        ) {
          patientCacheKey = `patientAIData:${req.user._id}:getPatientAllDoctors`;
          patientCachedData = await redisClient.get(patientCacheKey);
          if (patientCachedData) {
            patientData = JSON.parse(patientCachedData);
          } else {
            patientData = await getPatientAllDoctors(req.user._id);
            await redisClient.set(
              patientCacheKey,
              JSON.stringify(patientData),
              {
                EX: 3600 * 24,
              },
            );
          }
        } else if (
          patientFunctionName.functionName === "getPatientAppointments"
        ) {
          patientCacheKey = `patientAIData:${req.user._id}:getPatientAppointments`;
          patientCachedData = await redisClient.get(patientCacheKey);
          if (patientCachedData) {
            patientData = JSON.parse(patientCachedData);
          } else {
            patientData = await getPatientAppointments(req.user._id);
            await redisClient.set(
              patientCacheKey,
              JSON.stringify(patientData),
              {
                EX: 3600 * 24,
              },
            );
          }
        } else if (
          patientFunctionName.functionName === "getPatientNearDoctors"
        ) {
          patientCacheKey = `patientAIData:${req.user._id}:getPatientNearDoctors`;
          patientCachedData = await redisClient.get(patientCacheKey);
          if (patientCachedData) {
            patientData = JSON.parse(patientCachedData);
          } else {
            patientData = await getPatientNearDoctors(req.user._id);
            await redisClient.set(
              patientCacheKey,
              JSON.stringify(patientData),
              {
                EX: 3600 * 24,
              },
            );
          }
        } else {
          return res.status(200).json({
            success: false,
            reply: {
              type: "text",
              message: "Give proper message So i can assist you better.",
            },
          });
        }

        const patientReply = await generatePatientResponse(
          message,
          patientData,
        );

        res.status(200).json({
          success: true,
          reply: {
            type: patientReply.type,
            message: patientReply.message,
          },
        });
        break;
      case "doctor":
        const doctorCacheKey = `doctorAIData:${req.user._id}`;
        const doctorCachedData = await redisClient.get(doctorCacheKey);
        let doctorData;
        if (doctorCachedData) {
          doctorData = JSON.parse(doctorCachedData);
        } else {
          doctorData = await getDoctorData(req.user._id);
          await redisClient.set(doctorCacheKey, JSON.stringify(doctorData), {
            EX: 3600 * 24,
          });
        }

        const doctorReply = await generateDoctorResponse(message, doctorData);
        res.status(200).json({
          success: true,
          reply: {
            type: doctorReply.type,
            message: doctorReply.message,
          },
        });
        break;
      case "admin":
        const funName = JSON.parse(await findAdminFunction(message));

        let adminData;
        let adminCacheKey;
        let adminCachedData;
        if (funName.functionName === "getAdminDoctorData") {
          adminCacheKey = "adminAIData:doctors";
          adminCachedData = await redisClient.get(adminCacheKey);
          if (adminCachedData) {
            adminData = JSON.parse(adminCachedData);
          } else {
            adminData = await getAdminDoctorData();
            await redisClient.set(adminCacheKey, JSON.stringify(adminData), {
              EX: 3600 * 24,
            });
          }
        } else if (funName.functionName === "getAdminPatientData") {
          adminCacheKey = "adminAIData:patients";
          adminCachedData = await redisClient.get(adminCacheKey);
          if (adminCachedData) {
            adminData = JSON.parse(adminCachedData);
          } else {
            adminData = await getAdminPatientData();
            await redisClient.set(adminCacheKey, JSON.stringify(adminData), {
              EX: 3600 * 24,
            });
          }
        } else if (funName.functionName === "getAdminAppointmentData") {
          adminCacheKey = "adminAIData:appointments";
          adminCachedData = await redisClient.get(adminCacheKey);
          if (adminCachedData) {
            adminData = JSON.parse(adminCachedData);
          } else {
            adminData = await getAdminAppointmentData();
            await redisClient.set(adminCacheKey, JSON.stringify(adminData), {
              EX: 3600 * 24,
            });
          }
        } else if (funName.functionName === "getAdminReviewData") {
          adminCacheKey = "adminAIData:reviews";
          adminCachedData = await redisClient.get(adminCacheKey);
          if (adminCachedData) {
            adminData = JSON.parse(adminCachedData);
          } else {
            adminData = await getAdminReviewData();
            await redisClient.set(adminCacheKey, JSON.stringify(adminData), {
              EX: 3600 * 24,
            });
          }
        } else {
          return res.status(200).json({
            success: false,
            message: "Give proper message So i can assist you better.",
          });
        }

        const adminReply = await generateAdminResponse(message, adminData);

        return res.status(200).json({
          success: true,
          reply: {
            type: adminReply.type,
            message: adminReply.message,
          },
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
