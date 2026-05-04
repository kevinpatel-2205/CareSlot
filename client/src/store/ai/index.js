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
        aiMessage: {
          type: res.data.reply.type,
          message: res.data.reply.message,
        },
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
          type: action.payload.aiMessage.type,
          text: action.payload.aiMessage.message,
        });
      })

      .addCase(sendMessageToAI.rejected, (state, action) => {
        state.loading = false;
        state.messages.pop();
        toast.error(action.payload);
      });
  },
});

export default aiSlice.reducer;
