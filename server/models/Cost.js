import mongoose from 'mongoose';

const costSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  monthlyBudget: {
    type: Number,
    default: 50.0 // $50.00 USD
  },
  dailyBudget: {
    type: Number,
    default: 5.0 // $5.00 USD
  },
  dailySpend: {
    type: Number,
    default: 0.0
  },
  monthlySpend: {
    type: Number,
    default: 0.0
  },
  lastResetDaily: {
    type: Date,
    default: Date.now
  },
  lastResetMonthly: {
    type: Date,
    default: Date.now
  },
  alertThresholds: {
    type: [Number],
    default: [50, 80, 100] // percentage triggers (e.g. 50%, 80%, 100% budget reached)
  },
  alertsSent: [{
    type: {
      type: String, // 'daily' or 'monthly'
      enum: ['daily', 'monthly']
    },
    threshold: Number, // threshold percentage (e.g. 80)
    amount: Number, // budget spend at time of trigger
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  emailNotifications: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

costSchema.index({ user: 1 });

const Cost = mongoose.model('Cost', costSchema);

export default Cost;
