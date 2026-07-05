import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/notifications');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load notifications.');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.put('/notifications/read-all');
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update notifications.');
    }
  }
);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: { list: [], unreadCount: 0, status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
        state.status = 'succeeded';
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.list = state.list.map((n) => ({ ...n, isRead: true }));
        state.unreadCount = 0;
      });
  },
});

export default notificationSlice.reducer;
