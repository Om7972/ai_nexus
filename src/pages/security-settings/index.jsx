import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/AuthGuard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Shield, Lock, Smartphone } from 'lucide-react';

const SecuritySettings = () => {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Security</h1>
                    <p className="text-muted-foreground">Manage your account security and privacy settings.</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <Lock className="w-5 h-5 text-primary mr-2" />
                            Change Password
                        </h3>
                        <div className="space-y-4 max-w-lg">
                            <Input label="Current Password" type="password" placeholder="Enter current password" />
                            <Input label="New Password" type="password" placeholder="Enter new password" />
                            <Input label="Confirm New Password" type="password" placeholder="Confirm new password" />
                            <Button className="mt-4">Update Password</Button>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <Shield className="w-5 h-5 text-green-500 mr-2" />
                            Two-Factor Authentication (2FA)
                        </h3>
                        <p className="text-muted-foreground mb-4 max-w-2xl">
                            Add an extra layer of security to your account. When enabled, you'll be prompted for a secure code each time you sign in.
                        </p>
                        <div className="flex items-center space-x-4 bg-accent p-4 rounded-lg border border-border inline-flex w-full sm:w-auto">
                            <Smartphone className="w-8 h-8 text-primary" />
                            <div className="flex-1 pr-4">
                                <span className="font-medium text-foreground block">Authenticator App</span>
                                <span className="text-sm text-muted-foreground">Recommended for maximum security</span>
                            </div>
                            <Button variant="outline">Enable 2FA</Button>
                        </div>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-sm border border-error/50">
                        <h3 className="text-lg font-semibold text-error mb-4 flex items-center">Delete Account</h3>
                        <p className="text-muted-foreground mb-4 max-w-2xl">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <Button variant="destructive">Delete Account</Button>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default SecuritySettings;
