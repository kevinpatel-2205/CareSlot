import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../lib/axios";
import { toast } from "react-toastify";

const initialState = {
  messages: [], // chat history
  loading: false,
};

export const sendMessageToAI = createAsyncThunk(
  "ai/sendMessage",
  async (message, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/ai/chat", { message });
      return {
        userMessage: message,
        aiMessage: res.data.reply,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "AI Error");
    }
  },
);

const aiSlice = createSlice({
  name: "ai",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      .addCase(sendMessageToAI.pending, (state, action) => {
        state.loading = true;

        state.messages.push({
          role: "user",
          text: action.meta.arg,
        });
      })

      .addCase(sendMessageToAI.fulfilled, (state, action) => {
        state.loading = false;

        state.messages.push({
          role: "ai",
          text: action.payload.aiMessage,
        });
      })

      .addCase(sendMessageToAI.rejected, (state, action) => {
        state.loading = false;
        toast.error(action.payload);
      });
  },
});

export default aiSlice.reducer;
