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
  loading: false,
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
  async (status, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/allAppointments", {
        params: status ? { status } : {},
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
      const res = await axiosInstance.patch(
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
      const res = await axiosInstance.patch(
        `/doctor/cancelAppointment/${appointmentId}`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchDoctorPatients = createAsyncThunk(
  "doctor/fetchPatients",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/patients");
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
      const res = await axiosInstance.get(
        `/doctor/patientDetails/${patientId}`,
      );
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const fetchAvailableSlots = createAsyncThunk(
  "doctor/fetchSlots",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/doctor/availableSlots");
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
      });
  },
});

export default doctorSlice.reducer;
