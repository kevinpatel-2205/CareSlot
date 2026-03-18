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
  reviews: [],
  currentPage: 1,
  totalPages: 1,
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
  async (page = 1, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/allDoctors", {
        params: { page, limit: 5 },
      });
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
      return res.data;
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
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getAllPatients = createAsyncThunk(
  "admin/getAllPatients",
  async (page = 1, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/admin/allPatients", {
        params: {
          page,
          limit: 5,
        },
      });

      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deletePatient = createAsyncThunk(
  "admin/deletePatient",
  async (patientId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(
        `/admin/deletePatient/${patientId}`,
      );
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const getAllAppointments = createAsyncThunk(
  "admin/getAppointments",
  async ({ status, page = 1 }, { rejectWithValue }) => {
    try {
      const query = status ? `?status=${status}` : "";
      const res = await axiosInstance.get("/admin/allAppointments", {
        params: {
          status,
          page,
          limit: 10,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const exportAdminExcel = createAsyncThunk(
  "admin/exportExcel",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/export-excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "admin-data.xlsx");
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

export const getPendingReviews = createAsyncThunk(
  "admin/getPendingReviews",
  async (page = 1, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/pendingReviews", {
        params: {
          page,
          limit: 5,
        },
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const approveReview = createAsyncThunk(
  "admin/approveReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/admin/reviews/${reviewId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const deleteReview = createAsyncThunk(
  "admin/deleteReview",
  async (reviewId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.delete(`/admin/reviews/${reviewId}`);
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const updateDoctorCommission = createAsyncThunk(
  "admin/updateDoctorCommission",
  async ({ doctorId, commission }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/admin/commission/${doctorId}`, {
        commission,
      });
      return res.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  },
);

export const exportAdminPDF = createAsyncThunk(
  "admin/exportPDF",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/export-pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "admin-data.pdf");
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

export const downloadDoctorsPDF = createAsyncThunk(
  "doctor/downloadDoctorPDF",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/doctors/export/pdf", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "doctors-report.pdf");

      document.body.appendChild(link);
      link.click();
      link.remove();

      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  },
);

export const downloadDoctorsExcel = createAsyncThunk(
  "doctor/downloadDoctorExcel",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/doctors/export/excel", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute("download", "doctors-report.xlsx");

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
  "patient/downloadPatientsPDF",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/patients/export/pdf", {
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
  "patient/downloadPatientsExcel",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/patients/export/excel", {
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

export const downloadAppointmentsPDF = createAsyncThunk(
  "admin/downloadAppointmentsPDF",
  async ({ status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/appointments/export/pdf", {
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
  "admin/downloadAppointmentsExcel",
  async ({ status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/appointments/export/excel", {
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

export const downloadReviewsPDF = createAsyncThunk(
  "review/downloadReviewsPDF",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/reviews/export/pdf", {
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
  "review/downloadReviewsExcel",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/admin/reviews/export/excel", {
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
        toast.error(action.payload);
      })

      .addCase(getAllDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.data;
        state.totalDoctors = action.payload.total;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getAllDoctors.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
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
        toast.error(action.payload);
      })

      .addCase(toggleDoctorStatus.fulfilled, (state, action) => {
        state.actionLoading = false;
        const doctor = state.doctors.find(
          (d) => d.doctorId === action.payload.doctorId,
        );
        if (doctor) {
          doctor.isActive = action.payload.isActive;
        }
        toast.success(action.payload.message);
      })
      .addCase(toggleDoctorStatus.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload.message);
      })

      .addCase(deleteDoctor.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = state.doctors.filter(
          (d) => d.doctorId !== action.payload.doctorId,
        );
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
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getAllPatients.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(deletePatient.fulfilled, (state, action) => {
        state.loading = false;
        state.patients = state.patients.filter(
          (p) => p.patientId !== action.payload.patientId,
        );
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
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalAppointments = action.payload.total;
      })
      .addCase(getAllAppointments.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(exportAdminExcel.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportAdminExcel.fulfilled, (state) => {
        state.loading = false;
        toast.success("Excel downloaded successfully");
      })
      .addCase(exportAdminExcel.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(exportAdminPDF.pending, (state) => {
        state.loading = true;
      })
      .addCase(exportAdminPDF.fulfilled, (state) => {
        state.loading = false;
        toast.success("PDF downloaded successfully");
      })
      .addCase(exportAdminPDF.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(getPendingReviews.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPendingReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data;
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(getPendingReviews.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(approveReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveReview.fulfilled, (state, action) => {
        state.loading = false;

        state.reviews = state.reviews.filter(
          (r) => r._id !== action.payload.reviewId,
        );

        toast.success(action.payload.message);
      })
      .addCase(approveReview.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;

        state.reviews = state.reviews.filter(
          (r) => r._id !== action.payload.reviewId,
        );

        toast.success(action.payload.message);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(updateDoctorCommission.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateDoctorCommission.fulfilled, (state, action) => {
        state.loading = false;

        const doctor = state.doctors.find(
          (d) => d.doctorId === action.payload.doctorId,
        );

        if (doctor) {
          doctor.aCommission = action.payload.commission;
        }

        toast.success(action.payload.message);
      })
      .addCase(updateDoctorCommission.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      })

      .addCase(downloadDoctorsPDF.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadDoctorsPDF.fulfilled, (state) => {
        state.loading = false;
        toast.success("PDF downloaded successfully");
      })
      .addCase(downloadDoctorsPDF.rejected, (state, action) => {
        state.loading = false;
        if (action.error.message === "Rejected") {
          toast.error("No Data Found");
        } else {
          toast.error(action.payload);
        }
      })

      .addCase(downloadDoctorsExcel.pending, (state) => {
        state.loading = true;
      })
      .addCase(downloadDoctorsExcel.fulfilled, (state) => {
        state.loading = false;
        toast.success("Excel downloaded successfully");
      })
      .addCase(downloadDoctorsExcel.rejected, (state, action) => {
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

export default adminSlice.reducer;
