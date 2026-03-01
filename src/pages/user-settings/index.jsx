import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/AuthGuard';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { Checkbox } from '../../components/ui/Checkbox';
import { fetchUserProfile, updateUserPreferences } from '../../store/slices/userProfileSlice';
import { Palette, Bell, Save } from 'lucide-react';

import { useTheme, useToast } from '../../context/ThemeContext';

const UserSettings = () => {
    const dispatch = useDispatch();
    const { preferences, loading, error } = useSelector((state) => state.userProfile);
    const { setTheme } = useTheme();
    const toast = useToast().toast;
    const [formData, setFormData] = useState({});

    useEffect(() => {
        dispatch(fetchUserProfile());
    }, [dispatch]);

    useEffect(() => {
        if (preferences) setFormData(preferences);
    }, [preferences]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            const preferencesData = {
                theme: formData.theme,
                language: formData.language,
                timezone: formData.timezone,
                emailNotifications: formData.emailNotifications,
                pushNotifications: formData.pushNotifications,
                smsNotifications: formData.smsNotifications
            };
            await dispatch(updateUserPreferences(preferencesData)).unwrap();

            // Sync context immediately on successful save
            if (formData.theme) {
                setTheme(formData.theme);
            }
            toast.success('Preferences saved successfully!');
        } catch (error) {
            console.error('Failed to save preferences:', error);
            toast.error('Failed to save preferences.');
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
                    <p className="text-muted-foreground">Manage your preferences and app settings.</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 bg-card rounded-xl p-6 shadow-sm border border-border">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground flex items-center">
                                <Palette className="w-5 h-5 mr-2 text-primary" />
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

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-foreground flex items-center">
                                <Bell className="w-5 h-5 mr-2 text-primary" />
                                Notifications
                            </h3>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={formData.emailNotifications || false}
                                    onCheckedChange={(checked) => handleInputChange('emailNotifications', checked)}
                                    id="email-notif"
                                />
                                <label htmlFor="email-notif" className="text-sm">Email Notifications</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={formData.pushNotifications || false}
                                    onCheckedChange={(checked) => handleInputChange('pushNotifications', checked)}
                                    id="push-notif"
                                />
                                <label htmlFor="push-notif" className="text-sm">Push Notifications</label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    checked={formData.smsNotifications || false}
                                    onCheckedChange={(checked) => handleInputChange('smsNotifications', checked)}
                                    id="sms-notif"
                                />
                                <label htmlFor="sms-notif" className="text-sm">SMS Notifications</label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-border mt-6">
                        <Button onClick={handleSave} loading={loading}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Preferences
                        </Button>
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

export default UserSettings;
