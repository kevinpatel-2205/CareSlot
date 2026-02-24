import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth";
import adminReducer from "./admin";

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
});

export default store;
