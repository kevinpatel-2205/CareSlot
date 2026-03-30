import Doctor from "../models/doctor.model.js";

export const getDoctors = async () => {
  try {
    const doctors = await Doctor.find({ isDeleted: false })
      .select("-availableSlots")
      .populate({
        path: "userId",
        match: { isDeleted: false, isActive: true },
        select: "name email phone",
      })
      .lean();

    const filteredDoctors = doctors.filter((doc) => doc.userId !== null);

    return filteredDoctors;
  } catch (error) {
    throw new Error("Error fetching doctors: " + error.message);
  }
};
