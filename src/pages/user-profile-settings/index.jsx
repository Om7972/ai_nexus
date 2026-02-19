import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/AuthGuard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import {
  fetchUserProfile,
  updateUserProfile,
  updateUserPreferences,
  uploadProfileImage
} from '../../store/slices/userProfileSlice';
import {
  fetchSubscription,
  updatePaymentMethod,
  fetchBillingHistory
} from '../../store/slices/subscriptionSlice';
import {
  User,
  Settings,
  Shield,
  CreditCard,
  Bell,
  Palette,
  Globe,
  Lock,
  Camera,
  Save,
  X
} from 'lucide-react';

const UserProfileSettings = () => {
  const dispatch = useDispatch();
  const { profile, preferences, loading, error } = useSelector((state) => state.userProfile);
  const { currentPlan, billingHistory, paymentMethod } = useSelector((state) => state.subscription);

  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchSubscription());
    dispatch(fetchBillingHistory());
  }, [dispatch]);

  useEffect(() => {
    setFormData({
      ...profile,
      ...preferences
    });
  }, [profile, preferences]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      if (selectedImage) {
        await dispatch(uploadProfileImage(selectedImage)).unwrap();
      }

      const profileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        phone: formData.phone,
        occupation: formData.occupation,
        company: formData.company,
        skills: formData.skills || [],
        interests: formData.interests || []
      };

      const preferencesData = {
        theme: formData.theme,
        language: formData.language,
        timezone: formData.timezone,
        emailNotifications: formData.emailNotifications,
        pushNotifications: formData.pushNotifications,
        smsNotifications: formData.smsNotifications
      };

      await Promise.all([
        dispatch(updateUserProfile(profileData)).unwrap(),
        dispatch(updateUserPreferences(preferencesData)).unwrap()
      ]);

      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'subscription', label: 'Subscription', icon: CreditCard }
  ];

  const renderProfileTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
        <Button
          variant={isEditing ? "outline" : "default"}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <X className="w-4 h-4 mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Image */}
        <div className="lg:col-span-1">
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 mx-auto">
                {imagePreview || profile.avatar ? (
                  <img
                    src={imagePreview || profile.avatar}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              {isEditing && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">Click to change photo</p>
          </div>
        </div>

        {/* Profile Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={!isEditing}
            />
            <Input
              label="Last Name"
              value={formData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <Input
            label="Email"
            value={formData.email || ''}
            disabled
            className="bg-gray-50 dark:bg-gray-800"
          />

          <Input
            label="Bio"
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={!isEditing}
            multiline
            rows={3}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Location"
              value={formData.location || ''}
              onChange={(e) => handleInputChange('location', e.target.value)}
              disabled={!isEditing}
            />
            <Input
              label="Website"
              value={formData.website || ''}
              onChange={(e) => handleInputChange('website', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Phone"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
            />
            <Input
              label="Occupation"
              value={formData.occupation || ''}
              onChange={(e) => handleInputChange('occupation', e.target.value)}
              disabled={!isEditing}
            />
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  const renderPreferencesTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Preferences</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Palette className="w-5 h-5 mr-2" />
            Appearance
          </h3>

          <Select
            label="Theme"
            value={formData.theme || 'light'}
            onChange={(value) => handleInputChange('theme', value)}
            options={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'auto', label: 'System' }
            ]}
          />

          <Select
            label="Language"
            value={formData.language || 'en'}
            onChange={(value) => handleInputChange('language', value)}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Spanish' },
              { value: 'fr', label: 'French' },
              { value: 'de', label: 'German' }
            ]}
          />
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
          </h3>

          <Checkbox
            label="Email Notifications"
            checked={formData.emailNotifications || false}
            onChange={(checked) => handleInputChange('emailNotifications', checked)}
          />

          <Checkbox
            label="Push Notifications"
            checked={formData.pushNotifications || false}
            onChange={(checked) => handleInputChange('pushNotifications', checked)}
          />

          <Checkbox
            label="SMS Notifications"
            checked={formData.smsNotifications || false}
            onChange={(checked) => handleInputChange('smsNotifications', checked)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </motion.div>
  );

  const renderSecurityTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Settings</h2>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Change Password
          </h3>
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              type="password"
              placeholder="Enter new password"
            />
            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
            />
            <Button>
              <Lock className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Two-Factor Authentication
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Add an extra layer of security to your account.
          </p>
          <Button variant="outline">
            <Shield className="w-4 h-4 mr-2" />
            Enable 2FA
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const renderSubscriptionTab = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription & Billing</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Plan */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Current Plan
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Plan:</span>
              <span className="font-medium">{currentPlan.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Price:</span>
              <span className="font-medium">
                ${currentPlan.price}/{currentPlan.interval}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">Status:</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
          </div>
          <Button className="w-full mt-4" variant="outline">
            <CreditCard className="w-4 h-4 mr-2" />
            Manage Subscription
          </Button>
        </div>

        {/* Payment Method */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Payment Method
          </h3>
          {paymentMethod.id ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <span className="font-medium">
                  {paymentMethod.brand} •••• {paymentMethod.last4}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
              </p>
            </div>
          ) : (
            <p className="text-gray-500">No payment method on file</p>
          )}
          <Button className="w-full mt-4" variant="outline">
            Update Payment Method
          </Button>
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Billing History
        </h3>
        <div className="space-y-3">
          {billingHistory.slice(0, 5).map((invoice, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
              <div>
                <p className="font-medium">{invoice.description}</p>
                <p className="text-sm text-gray-500">{invoice.date}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">${invoice.amount}</p>
                <p className="text-sm text-green-600">{invoice.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <AuthGuard>
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Account Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage your profile, preferences, and subscription settings.
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && renderProfileTab()}
              {activeTab === 'preferences' && renderPreferencesTab()}
              {activeTab === 'security' && renderSecurityTab()}
              {activeTab === 'subscription' && renderSubscriptionTab()}
            </motion.div>
          </AnimatePresence>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
            >
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </motion.div>
          )}
        </div>
      </Layout>
    </AuthGuard>
  );
};

export default UserProfileSettings; 