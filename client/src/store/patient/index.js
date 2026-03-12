import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios";
import { toast } from "react-toastify";

const initialState = {
  dashboard: null,
  doctors: [],
  doctorDetails: null,
  appointments: [],
  profile: null,
  loading: false,
  currentPage: 1,
  totalPages: 1,
};

export const fetchPatientDashboard = createAsyncThunk(
  "patient/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/patient/dashboard");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchAllDoctors = createAsyncThunk(
  "patient/fetchDoctors",
  async (filters, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/patient/getAlldoctors", {
        params: filters || {},
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchDoctorDetails = createAsyncThunk(
  "patient/fetchDoctorDetails",
  async (doctorId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/patient/doctorDetails/${doctorId}`);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const bookAppointment = createAsyncThunk(
  "patient/bookAppointment",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/patient/bookAppointment",
        appointmentData,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchPatientAppointments = createAsyncThunk(
  "patient/fetchAppointments",
  async ({ status, page = 1 }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/patient/myAppointments", {
        params: {
          status,
          page,
          limit: 5,
        },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchPatientProfile = createAsyncThunk(
  "patient/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/patient/profile");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const updatePatientProfile = createAsyncThunk(
  "patient/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        "/patient/updateProfile",
        profileData,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const createRazorpayOrder = createAsyncThunk(
  "patient/createRazorpayOrder",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/patient/create-order", {
        appointmentId,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const verifyRazorpayPayment = createAsyncThunk(
  "patient/verifyRazorpayPayment",
  async (paymentData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/patient/verify-payment",
        paymentData,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const markRazorpayPaymentFailed = createAsyncThunk(
  "patient/markRazorpayPaymentFailed",
  async (paymentData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(
        "/patient/payment-failed",
        paymentData,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const createDoctorReview = createAsyncThunk(
  "patient/createDoctorReview",
  async (reviewData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/patient/reviews", reviewData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const downloadAppointmentsPDF = createAsyncThunk(
  "patient/downloadAppointmentsPDF",
  async ({ status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/patient/appointments/export/pdf", {
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
  "patient/downloadAppointmentsExcel",
  async ({ status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(
        "/patient/appointments/export/excel",
        {
          params: { status },
          responseType: "blob",
        },
      );

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

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(fetchPatientDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.data;
      })
      .addCase(fetchPatientDashboard.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(fetchAllDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.data;
      })
      .addCase(fetchAllDoctors.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(fetchDoctorDetails.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDoctorDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.doctorDetails = action.payload.data;
      })
      .addCase(fetchDoctorDetails.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(action.payload.message);
        if (action.payload.data) {
          state.appointments.unshift(action.payload.data);
        }
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(fetchPatientAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPatientAppointments.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(fetchPatientProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(fetchPatientProfile.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(updatePatientProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(action.payload.message);
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(createRazorpayOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createRazorpayOrder.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(createRazorpayOrder.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(verifyRazorpayPayment.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyRazorpayPayment.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(action.payload.message);
        const appointmentId = action.meta.arg.appointmentId;
        state.appointments = state.appointments.map((item) =>
          item.appointmentId === appointmentId
            ? {
                ...item,
                paymentStatus: "paid",
                paymentMethod: "razorpay",
                status: "confirmed",
              }
            : item,
        );
      })
      .addCase(verifyRazorpayPayment.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      });

    builder
      .addCase(markRazorpayPaymentFailed.pending, (state) => {
        state.loading = true;
      })
      .addCase(markRazorpayPaymentFailed.fulfilled, (state, action) => {
        state.loading = false;
        toast.error(action.payload.message);
        const appointmentId = action.meta.arg.appointmentId;
        state.appointments = state.appointments.map((item) =>
          item.appointmentId === appointmentId
            ? {
                ...item,
                paymentStatus: "failed",
                paymentMethod: "razorpay",
                status: "pending",
              }
            : item,
        );
      })
      .addCase(markRazorpayPaymentFailed.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(createDoctorReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDoctorReview.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(action.payload.message);
      })
      .addCase(createDoctorReview.rejected, (state, action) => {
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
        toast.error(action.payload);
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
        toast.error(action.payload);
      });
  },
});

export default patientSlice.reducer;
