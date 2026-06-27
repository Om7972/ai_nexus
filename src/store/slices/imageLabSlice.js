import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../utils/api';

export const generateImage = createAsyncThunk(
    'imageLab/generate',
    async (payload, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/ai/generate-image`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to generate image');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const processImage = createAsyncThunk(
    'imageLab/process',
    async (formData, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/ai/process-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData // Note: Content-Type is automatically set by fetch when passing FormData
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to process image');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchImageHistory = createAsyncThunk(
    'imageLab/fetchHistory',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/ai/image-history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) return rejectWithValue(data.message || 'Failed to fetch history');
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    history: [],
    isProcessing: false,
    error: null,
};

const imageLabSlice = createSlice({
    name: 'imageLab',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Generate Image
            .addCase(generateImage.pending, (state) => {
                state.isProcessing = true;
                state.error = null;
            })
            .addCase(generateImage.fulfilled, (state, action) => {
                state.isProcessing = false;
                state.history.unshift(action.payload);
            })
            .addCase(generateImage.rejected, (state, action) => {
                state.isProcessing = false;
                state.error = action.payload;
            })
            // Process Image
            .addCase(processImage.pending, (state) => {
                state.isProcessing = true;
                state.error = null;
            })
            .addCase(processImage.fulfilled, (state, action) => {
                state.isProcessing = false;
                state.history.unshift(action.payload);
            })
            .addCase(processImage.rejected, (state, action) => {
                state.isProcessing = false;
                state.error = action.payload;
            })
            // Fetch history
            .addCase(fetchImageHistory.pending, (state) => {
                state.error = null;
            })
            .addCase(fetchImageHistory.fulfilled, (state, action) => {
                state.history = action.payload;
            })
            .addCase(fetchImageHistory.rejected, (state, action) => {
                state.error = action.payload;
            });
    }
});

export const { clearError } = imageLabSlice.actions;
export default imageLabSlice.reducer;
