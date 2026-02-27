import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/AuthGuard';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { HelpCircle, Mail, MessageSquare, BookOpen } from 'lucide-react';

const HelpSupport = () => {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-bold text-foreground mb-4">How can we help?</h1>
                    <div className="max-w-md mx-auto">
                        <Input placeholder="Search documentation, articles..." />
                    </div>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center hover:shadow-md transition-shadow">
                        <BookOpen className="w-10 h-10 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Documentation</h3>
                        <p className="text-sm text-muted-foreground mb-4">Read our detailed guides and API references.</p>
                        <Button variant="outline" className="w-full">Read Docs</Button>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center hover:shadow-md transition-shadow">
                        <MessageSquare className="w-10 h-10 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Community Forum</h3>
                        <p className="text-sm text-muted-foreground mb-4">Join the discussion with other users.</p>
                        <Button variant="outline" className="w-full">Join Community</Button>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-sm border border-border text-center hover:shadow-md transition-shadow">
                        <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">Contact Support</h3>
                        <p className="text-sm text-muted-foreground mb-4">Get in touch with our support team directly.</p>
                        <Button variant="outline" className="w-full">Email Us</Button>
                    </div>
                </motion.div>

                <div className="mt-12 bg-accent rounded-xl p-8 border border-border">
                    <h2 className="text-2xl font-bold text-foreground mb-6">Frequently Asked Questions</h2>
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-semibold text-foreground">How do I upgrade my plan?</h4>
                            <p className="text-muted-foreground mt-1">You can upgrade your plan at any time from the Subscription management page in your account settings.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground">Are there any limits on API usage?</h4>
                            <p className="text-muted-foreground mt-1">Yes, depending on your plan. Check the Pricing page for detailed limits and overage costs.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default HelpSupport;
