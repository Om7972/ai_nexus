import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['Free User', 'Pro User', 'Admin'],
    default: 'Free User'
  },
  tokenLimitMonthly: {
    type: Number,
    default: 50000 // 50K tokens for Free
  },
  requestLimitDaily: {
    type: Number,
    default: 100 // 100 requests for Free
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
});

subscriptionSchema.index({ user: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
