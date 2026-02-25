import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios";
import { toast } from "react-toastify";

const initialState = {
  dashboard: null,
  doctors: [],
  patients: [],
  appointments: [],
  totalDoctors: 0,
  totalPatients: 0,
  totalAppointments: 0,
  loading: false,
};

export const getAdminDashboard = createAsyncThunk(
  "admin/dashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/dashboard");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getAllDoctors = createAsyncThunk(
  "admin/getDoctors",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/allDoctors");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const createDoctor = createAsyncThunk(
  "admin/createDoctor",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/admin/createDoctor", formData);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const toggleDoctorStatus = createAsyncThunk(
  "admin/toggleDoctorStatus",
  async ({ doctorId, isActive }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(
        `/admin/toggleDoctorStatus/${doctorId}`,
        {
          isActive,
        },
      );
      return { doctorId, isActive };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteDoctor = createAsyncThunk(
  "admin/deleteDoctor",
  async (doctorId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/admin/deleteDoctor/${doctorId}`);
      return doctorId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getAllPatients = createAsyncThunk(
  "admin/getPatients",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/allPatients");
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deletePatient = createAsyncThunk(
  "admin/deletePatient",
  async (patientId, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/admin/deletePatient/${patientId}`);
      return patientId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getAllAppointments = createAsyncThunk(
  "admin/getAppointments",
  async (status, { rejectWithValue }) => {
    try {
      const query = status ? `?status=${status}` : "";
      const res = await axiosInstance.get(`/admin/allAppointments${query}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(getAdminDashboard.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.data;
      })
      .addCase(getAdminDashboard.rejected, (state, action) => {
        state.loading = false;
      })

      .addCase(getAllDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.total;
        state.totalDoctors = action.payload.data;
      })
      .addCase(getAllDoctors.rejected, (state, action) => {
        state.loading = false;
      })

      .addCase(createDoctor.pending, (state) => {
        state.loading = true;
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.loading = false;
        toast.success(action.payload.message);
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload.message);
      })

      .addCase(toggleDoctorStatus.fulfilled, (state, action) => {
        state.actionLoading = false;

        const doctor = state.doctors.find(
          (d) => d._id === action.payload.doctorId,
        );

        if (doctor) {
          doctor.isActive = action.payload.isActive;
        }

        toast.success(action.payload?.message);
      })
      .addCase(toggleDoctorStatus.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload.message);
      })

      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.loading = false;

        state.doctors = state.doctors.filter((d) => d._id !== action.payload);

        toast.success(action.payload.message);
      })
      .addCase(deleteDoctor.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload.message);
      })

      .addCase(getAllPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPatients.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = action.payload.data;
        state.totalPatients = action.payload.total;
      })
      .addCase(getAllPatients.rejected, (state, action) => {
        state.loading = false;
      })

      .addCase(deletePatient.fulfilled, (state, action) => {
        state.loading = false;

        state.patients = state.patients.filter((p) => p._id !== action.payload);

        toast.success(action.payload.message);
      })
      .addCase(deletePatient.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload.message);
      })

      .addCase(getAllAppointments.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.data;
        state.totalAppointments = action.payload.total;
      })
      .addCase(getAllAppointments.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export default adminSlice.reducer;
