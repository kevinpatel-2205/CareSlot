import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import adminReducer from "./admin";
import doctorReducer from "./doctor";
import patientReducer from "./patient";
import aiReducer from "./ai";

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    doctor: doctorReducer,
    patient: patientReducer,
    ai: aiReducer,
  },
});

export default store;
