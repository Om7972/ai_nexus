import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../utils/api';

export const generateAiText = createAsyncThunk(
    'textStudio/generateText',
    async (payload, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/ai/generate-text`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to generate text');
            }
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchGenerationHistory = createAsyncThunk(
    'textStudio/fetchHistory',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/ai/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) {
                return rejectWithValue(data.message || 'Failed to fetch history');
            }
            return data.data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    history: [],
    isGenerating: false,
    isLoadingHistory: false,
    error: null,
};

const textStudioSlice = createSlice({
    name: 'textStudio',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Generate text
            .addCase(generateAiText.pending, (state) => {
                state.isGenerating = true;
                state.error = null;
            })
            .addCase(generateAiText.fulfilled, (state, action) => {
                state.isGenerating = false;
                // Optionally prepend new generation to history
                state.history.unshift(action.payload);
            })
            .addCase(generateAiText.rejected, (state, action) => {
                state.isGenerating = false;
                state.error = action.payload;
            })
            // Fetch history
            .addCase(fetchGenerationHistory.pending, (state) => {
                state.isLoadingHistory = true;
                state.error = null;
            })
            .addCase(fetchGenerationHistory.fulfilled, (state, action) => {
                state.isLoadingHistory = false;
                state.history = action.payload;
            })
            .addCase(fetchGenerationHistory.rejected, (state, action) => {
                state.isLoadingHistory = false;
                state.error = action.payload;
            });
    }
});

export const { clearError } = textStudioSlice.actions;
export default textStudioSlice.reducer;
