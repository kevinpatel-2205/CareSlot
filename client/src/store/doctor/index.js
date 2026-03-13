import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios";
import { toast } from "react-toastify";

const initialState = {
  dashboard: null,
  upcomingAppointments: [],
  appointments: [],
  patients: [],
  patientDetails: null,
  availableSlots: [],
  profile: null,
  review: null,
  loading: false,
  currentPage: 1,
  totalPages: 1,
};

export const fetchDoctorDashboard = createAsyncThunk(
  "doctor/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/dashboard");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchUpcomingAppointments = createAsyncThunk(
  "doctor/fetchUpcoming",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/upcomingAppointments");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchAllAppointments = createAsyncThunk(
  "doctor/fetchAllAppointments",
  async ({ status, page }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/allAppointments", {
        params: { status, page, limit: 5 },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const changeAppointmentStatus = createAsyncThunk(
  "doctor/changeAppointmentStatus",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/doctor/changeStatus/${appointmentId}`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const cancelAppointment = createAsyncThunk(
  "doctor/cancelAppointment",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/doctor/cancel/${appointmentId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchDoctorPatients = createAsyncThunk(
  "doctor/fetchPatients",
  async (page = 1, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/patients", {
        params: { page, limit: 5 },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchPatientDetails = createAsyncThunk(
  "doctor/fetchPatientDetails",
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/doctor/patients/${patientId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchAvailableSlots = createAsyncThunk(
  "doctor/fetchSlots",
  async (page = 1, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/availableSlots", {
        params: { page, limit: 5 },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const addAvailableSlots = createAsyncThunk(
  "doctor/addSlots",
  async (slotData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/doctor/addAvailableSlots",
        slotData,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchDoctorProfile = createAsyncThunk(
  "doctor/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/profile");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const updateDoctorProfile = createAsyncThunk(
  "doctor/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put("/doctor/updateProfile", profileData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const deleteAvailableSlot = createAsyncThunk(
  "doctor/deleteSlot",
  async (date, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/doctor/slots/${date}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const exportDoctorExcel = createAsyncThunk(
  "doctor/exportExcel",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/doctor/export-excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "doctor-data.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to download excel",
      );
    }
  },
);

export const fetchDoctorReviews = createAsyncThunk(
  "doctor/fetchReviews",
  async (page = 1, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/reviews", {
        params: { page, limit: 5 },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const addPrescription = createAsyncThunk(
  "doctor/addPrescription",
  async ({ appointmentId, prescriptionData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        `/doctor/prescription/${appointmentId}`,
        prescriptionData,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const exportDoctorPDF = createAsyncThunk(
  "doctor/exportPDF",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/doctor/export-pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "doctor-data.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to download pdf",
      );
    }
  },
);

export const downloadAppointmentsPDF = createAsyncThunk(
  "doctor/downloadAppointmentsPDF",
  async ({ status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/appointments/export/pdf", {
        params: { status },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "appointments-report.pdf");

      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const downloadAppointmentsExcel = createAsyncThunk(
  "doctor/downloadAppointmentsExcel",
  async ({ status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/appointments/export/excel", {
        params: { status },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "appointments-report.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const downloadPatientsPDF = createAsyncThunk(
  "doctor/downloadPatientsPDF",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/patients/export/pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "patients-report.pdf");

      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const downloadPatientsExcel = createAsyncThunk(
  "doctor/downloadPatientExcel",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/patients/export/excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "patients-report.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const downloadReviewsPDF = createAsyncThunk(
  "doctor/downloadReviewsPDF",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/reviews/export/pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "reviews-report.pdf");

      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const downloadReviewsExcel = createAsyncThunk(
  "doctor/downloadReviewsExcel",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/reviews/export/excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "reviews-report.xlsx");

      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const addBulkAvailableSlots = createAsyncThunk(
  "doctor/addBulkSlots",
  async (slotData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/doctor/addBulkAvailableSlots",
        slotData,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchDoctorDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctorDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.data;
      })
      .addCase(fetchDoctorDashboard.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(fetchUpcomingAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUpcomingAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingAppointments = action.payload.data;
      })
      .addCase(fetchUpcomingAppointments.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(fetchAllAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllAppointments.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(changeAppointmentStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(changeAppointmentStatus.fulfilled, (state, action) => {
        state.loading = false;

        const { appointmentId, appointmentStatus } = action.payload;

        state.appointments = state.appointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: appointmentStatus }
            : appointment,
        );
        toast.success(action.payload.message);
      })
      .addCase(changeAppointmentStatus.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const appointmentId = action.payload.appointmentId;

        state.appointments = state.appointments.filter(
          (appointment) => appointment._id !== appointmentId,
        );
        toast.success(action.payload.message);
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(fetchDoctorPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctorPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload.data;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDoctorPatients.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(fetchPatientDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.patientDetails = action.payload.data;
      })
      .addCase(fetchPatientDetails.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload.data;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(addAvailableSlots.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload.data;
        toast.success(action.payload.message);
      })
      .addCase(addAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(addBulkAvailableSlots.pending, (state) => {
        state.loading = true;
      })
      .addCase(addBulkAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload.data;
        toast.success(action.payload.message);
      })
      .addCase(addBulkAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(fetchDoctorProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(fetchDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(action.payload.message);
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(exportDoctorExcel.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportDoctorExcel.fulfilled, (state) => {
        state.loading = false;
        toast.success("Excel downloaded successfully");
      })
      .addCase(exportDoctorExcel.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(exportDoctorPDF.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportDoctorPDF.fulfilled, (state) => {
        state.loading = false;
        toast.success("PDF downloaded successfully");
      })
      .addCase(exportDoctorPDF.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(deleteAvailableSlot.fulfilled, (state, action) => {
        state.availableSlots = action.payload.data;
        toast.success(action.payload.message);
      })
      .addCase(deleteAvailableSlot.rejected, (state, action) => {
        toast.error(action.payload);
      })

      .addCase(fetchDoctorReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctorReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.review = action.payload.data;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchDoctorReviews.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(addPrescription.pending, (state) => {
        state.loading = true;
      })
      .addCase(addPrescription.fulfilled, (state, action) => {
        state.loading = false;
        const appointmentId = action.payload.data.appointmentId;
        state.appointments = state.appointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, prescriptionAdded: true }
            : appointment,
        );
        toast.success(action.payload.message);
      })
      .addCase(addPrescription.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(downloadAppointmentsPDF.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadAppointmentsPDF.fulfilled, (state) => {
        state.loading = false;
        toast.success("PDF downloaded successfully");
      })
      .addCase(downloadAppointmentsPDF.rejected, (state, action) => {
        state.loading = false;
        if (action.error.message === "Rejected") {
          toast.error("No Data Found");
        } else {
          toast.error(action.payload);
        }
      })

      .addCase(downloadAppointmentsExcel.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadAppointmentsExcel.fulfilled, (state) => {
        state.loading = false;
        toast.success("Excel downloaded successfully");
      })
      .addCase(downloadAppointmentsExcel.rejected, (state, action) => {
        state.loading = false;
        if (action.error.message === "Rejected") {
          toast.error("No Data Found");
        } else {
          toast.error(action.payload);
        }
      })

      .addCase(downloadPatientsPDF.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadPatientsPDF.fulfilled, (state) => {
        state.loading = false;
        toast.success("PDF downloaded successfully");
      })
      .addCase(downloadPatientsPDF.rejected, (state, action) => {
        state.loading = false;
        if (action.error.message === "Rejected") {
          toast.error("No Data Found");
        } else {
          toast.error(action.payload);
        }
      })

      .addCase(downloadPatientsExcel.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadPatientsExcel.fulfilled, (state) => {
        state.loading = false;
        toast.success("Excel downloaded successfully");
      })
      .addCase(downloadPatientsExcel.rejected, (state, action) => {
        state.loading = false;
        if (action.error.message === "Rejected") {
          toast.error("No Data Found");
        } else {
          toast.error(action.payload);
        }
      })

      .addCase(downloadReviewsPDF.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadReviewsPDF.fulfilled, (state) => {
        state.loading = false;
        toast.success("PDF downloaded successfully");
      })
      .addCase(downloadReviewsPDF.rejected, (state, action) => {
        state.loading = false;
        if (action.error.message === "Rejected") {
          toast.error("No Data Found");
        } else {
          toast.error(action.payload);
        }
      })

      .addCase(downloadReviewsExcel.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadReviewsExcel.fulfilled, (state) => {
        state.loading = false;
        toast.success("Excel downloaded successfully");
      })
      .addCase(downloadReviewsExcel.rejected, (state, action) => {
        state.loading = false;
        if (action.error.message === "Rejected") {
          toast.error("No Data Found");
        } else {
          toast.error(action.payload);
        }
      });
  },
});

export default doctorSlice.reducer;
