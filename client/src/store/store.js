import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import adminReducer from "./admin";
import doctorReducer from "./doctor";
import patientReducer from "./patient";

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    doctor: doctorReducer,
    patient: patientReducer,
  },
});

export default store;
