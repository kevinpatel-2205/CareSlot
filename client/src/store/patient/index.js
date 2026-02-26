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
  async (status, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/patient/myAppointments", {
        params: status ? { status } : {},
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
      });
  },
});

export default patientSlice.reducer;
