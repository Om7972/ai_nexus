import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchAnalyticsOverview = createAsyncThunk(
    'analytics/fetchOverview',
    async (dateRange, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (dateRange?.startDate) queryParams.append('startDate', dateRange.startDate);
            if (dateRange?.endDate) queryParams.append('endDate', dateRange.endDate);

            const res = await fetch(`/api/v1/analytics/overview?${queryParams.toString()}`);
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch overview');
            return data.data; // { totalRequests, tokensUsed, activeProjects, imageGenerations }
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

export const fetchAnalyticsUsage = createAsyncThunk(
    'analytics/fetchUsage',
    async (dateRange, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams();
            if (dateRange?.startDate) queryParams.append('startDate', dateRange.startDate);
            if (dateRange?.endDate) queryParams.append('endDate', dateRange.endDate);

            const res = await fetch(`/api/v1/analytics/usage?${queryParams.toString()}`);
            const data = await res.json();
            if (!res.ok) return rejectWithValue(data.message || 'Failed to fetch usage data');
            return data.data; // { lineChartData, pieChartData, barChartData }
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const initialState = {
    overview: {
        totalRequests: 0,
        tokensUsed: 0,
        activeProjects: 0,
        imageGenerations: 0,
    },
    charts: {
        lineChartData: [],
        pieChartData: [],
        barChartData: []
    },
    loading: false,
    error: null,
};

const analyticsSlice = createSlice({
    name: 'analytics',
    initialState,
    reducers: {
        clearAnalyticsError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAnalyticsOverview.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAnalyticsOverview.fulfilled, (state, action) => {
                state.loading = false;
                state.overview = action.payload;
                state.error = null;
            })
            .addCase(fetchAnalyticsOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchAnalyticsUsage.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAnalyticsUsage.fulfilled, (state, action) => {
                state.loading = false;
                state.charts = action.payload;
                state.error = null;
            })
            .addCase(fetchAnalyticsUsage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    }
});

export const { clearAnalyticsError } = analyticsSlice.actions;
export default analyticsSlice.reducer;
