import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/tasks', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load tasks.');
    }
  }
);

// payload: { formData } where formData is a FormData instance (supports file attachment)
export const createTask = createAsyncThunk(
  'tasks/create',
  async (formData, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/tasks', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.task;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create task.');
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(`/tasks/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.task;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update task.');
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/tasks/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete task.');
    }
  }
);

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    status: 'idle',
    error: null,
  },
  reducers: {
    clearTaskError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.list.findIndex((t) => t.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter((t) => t.id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('tasks/'),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export const { clearTaskError } = taskSlice.actions;
export default taskSlice.reducer;
