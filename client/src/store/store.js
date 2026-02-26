import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import adminReducer from "./admin";
import doctorReducer from "./doctor";

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    doctor: doctorReducer,
  },
});

export default store;
