import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../../api/axiosClient';

export const fetchEmployees = createAsyncThunk(
  'employees/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.get('/employees', { params });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load employees.');
    }
  }
);

export const createEmployee = createAsyncThunk(
  'employees/create',
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.post('/employees', payload);
      return data.employee;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create employee.');
    }
  }
);

export const updateEmployee = createAsyncThunk(
  'employees/update',
  async ({ id, payload }, { rejectWithValue }) => {
    try {
      const { data } = await axiosClient.put(`/employees/${id}`, payload);
      return data.employee;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update employee.');
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  'employees/delete',
  async (id, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/employees/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete employee.');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employees',
  initialState: {
    list: [],
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
    status: 'idle',
    error: null,
  },
  reducers: {
    clearEmployeeError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.list = action.payload.employees;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.list.unshift(action.payload);
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.list.findIndex((e) => e.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.list = state.list.filter((e) => e.id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.endsWith('/rejected') && action.type.startsWith('employees/'),
        (state, action) => {
          state.error = action.payload;
        }
      );
  },
});

export const { clearEmployeeError } = employeeSlice.actions;
export default employeeSlice.reducer;
