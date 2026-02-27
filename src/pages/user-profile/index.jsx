import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/AuthGuard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {
  fetchUserProfile,
  updateUserProfile,
  uploadProfileImage
} from '../../store/slices/userProfileSlice';
import { User, Settings, Camera, Save, X } from 'lucide-react';

const UserProfile = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector((state) => state.userProfile);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    dispatch(fetchUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) setFormData(profile);
  }, [profile]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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

      await dispatch(updateUserProfile(profileData)).unwrap();
      setIsEditing(false);
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Failed to save changes:', error);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">View and edit your profile information.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Profile Information</h2>
            <Button variant={isEditing ? "outline" : "default"} onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? <X className="w-4 h-4 mr-2" /> : <Settings className="w-4 h-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-muted mx-auto border border-border">
                    {imagePreview || profile?.avatar ? (
                      <img src={imagePreview || profile.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:brightness-110 transition-colors shadow-m">
                      <Camera className="w-4 h-4" />
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </label>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">Click to change photo</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="First Name" value={formData.firstName || ''} onChange={(e) => handleInputChange('firstName', e.target.value)} disabled={!isEditing} />
                <Input label="Last Name" value={formData.lastName || ''} onChange={(e) => handleInputChange('lastName', e.target.value)} disabled={!isEditing} />
              </div>

              <Input label="Email" value={formData.email || ''} disabled className="bg-accent" />

              <Input label="Bio" value={formData.bio || ''} onChange={(e) => handleInputChange('bio', e.target.value)} disabled={!isEditing} multiline rows={3} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Location" value={formData.location || ''} onChange={(e) => handleInputChange('location', e.target.value)} disabled={!isEditing} />
                <Input label="Website" value={formData.website || ''} onChange={(e) => handleInputChange('website', e.target.value)} disabled={!isEditing} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Phone" value={formData.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={!isEditing} />
                <Input label="Occupation" value={formData.occupation || ''} onChange={(e) => handleInputChange('occupation', e.target.value)} disabled={!isEditing} />
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button onClick={handleSave} loading={loading}>
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <p className="text-error">{error}</p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default UserProfile;