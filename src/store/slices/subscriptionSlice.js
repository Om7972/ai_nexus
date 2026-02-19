import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchSubscription = createAsyncThunk(
  'subscription/fetchSubscription',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get('/api/subscription', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subscription');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscription/createSubscription',
  async (subscriptionData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.post('/api/subscription', subscriptionData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscription/updateSubscription',
  async (subscriptionData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put('/api/subscription', subscriptionData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subscription');
    }
  }
);

export const cancelSubscription = createAsyncThunk(
  'subscription/cancelSubscription',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.delete('/api/subscription', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel subscription');
    }
  }
);

export const fetchBillingHistory = createAsyncThunk(
  'subscription/fetchBillingHistory',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.get('/api/subscription/billing-history', {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch billing history');
    }
  }
);

export const updatePaymentMethod = createAsyncThunk(
  'subscription/updatePaymentMethod',
  async (paymentData, { rejectWithValue, getState }) => {
    try {
      const { auth } = getState();
      const response = await axios.put('/api/subscription/payment-method', paymentData, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update payment method');
    }
  }
);

const initialState = {
  currentPlan: {
    id: null,
    name: 'Free',
    type: 'free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      'Basic AI Analysis',
      '5 projects per month',
      'Standard support'
    ],
    limits: {
      projects: 5,
      apiCalls: 100,
      storage: '100MB',
      teamMembers: 1
    }
  },
  availablePlans: [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: [
        'Basic AI Analysis',
        '5 projects per month',
        'Standard support'
      ],
      limits: {
        projects: 5,
        apiCalls: 100,
        storage: '100MB',
        teamMembers: 1
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      currency: 'USD',
      interval: 'month',
      features: [
        'Advanced AI Analysis',
        'Unlimited projects',
        'Priority support',
        'Custom models',
        'Team collaboration'
      ],
      limits: {
        projects: -1,
        apiCalls: 1000,
        storage: '10GB',
        teamMembers: 5
      }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      currency: 'USD',
      interval: 'month',
      features: [
        'All Pro features',
        'Custom integrations',
        'Dedicated support',
        'Advanced analytics',
        'White-label options'
      ],
      limits: {
        projects: -1,
        apiCalls: -1,
        storage: '100GB',
        teamMembers: -1
      }
    }
  ],
  billingHistory: [],
  paymentMethod: {
    id: null,
    type: '',
    last4: '',
    brand: '',
    expiryMonth: '',
    expiryYear: ''
  },
  subscriptionStatus: 'active',
  nextBillingDate: null,
  loading: false,
  error: null
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPlan: (state, action) => {
      state.currentPlan = action.payload;
    },
    updateSubscriptionStatus: (state, action) => {
      state.subscriptionStatus = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Subscription
      .addCase(fetchSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload.currentPlan;
        state.subscriptionStatus = action.payload.status;
        state.nextBillingDate = action.payload.nextBillingDate;
        state.paymentMethod = action.payload.paymentMethod;
      })
      .addCase(fetchSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Subscription
      .addCase(createSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload.currentPlan;
        state.subscriptionStatus = action.payload.status;
        state.nextBillingDate = action.payload.nextBillingDate;
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Subscription
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPlan = action.payload.currentPlan;
        state.nextBillingDate = action.payload.nextBillingDate;
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Subscription
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptionStatus = 'cancelled';
        state.currentPlan = action.payload.currentPlan;
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Billing History
      .addCase(fetchBillingHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillingHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.billingHistory = action.payload;
      })
      .addCase(fetchBillingHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Payment Method
      .addCase(updatePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethod = action.payload;
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentPlan, updateSubscriptionStatus } = subscriptionSlice.actions;
export default subscriptionSlice.reducer; 