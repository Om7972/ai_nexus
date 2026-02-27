import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/AuthGuard';
import Button from '../../components/ui/Button';
import { fetchSubscription } from '../../store/slices/subscriptionSlice';
import { CreditCard, Crown, Zap } from 'lucide-react';

const SubscriptionManagement = () => {
    const dispatch = useDispatch();
    const { currentPlan, paymentMethod } = useSelector((state) => state.subscription);

    useEffect(() => {
        dispatch(fetchSubscription());
    }, [dispatch]);

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Subscription</h1>
                    <p className="text-muted-foreground">Manage your subscription and upgrade options.</p>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <Crown className="w-5 h-5 text-yellow-500 mr-2" />
                            Current Plan
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-border">
                                <span className="text-muted-foreground">Plan:</span>
                                <span className="font-semibold text-lg">{currentPlan.name}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-border">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-medium">${currentPlan.price}/{currentPlan.interval}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status:</span>
                                <span className="font-medium text-green-500 flex items-center">
                                    <Zap className="w-4 h-4 mr-1" /> Active
                                </span>
                            </div>
                        </div>
                        <Button className="w-full mt-6" variant="outline">
                            <CreditCard className="w-4 h-4 mr-2" /> Manage Plan
                        </Button>
                    </div>

                    <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                            <CreditCard className="w-5 h-5 text-primary mr-2" />
                            Payment Method
                        </h3>
                        {paymentMethod?.id ? (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3 bg-accent p-3 rounded-lg">
                                    <CreditCard className="w-6 h-6 text-muted-foreground" />
                                    <span className="font-medium flex-1">
                                        {paymentMethod.brand} •••• {paymentMethod.last4}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground text-center">
                                    Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                                </p>
                            </div>
                        ) : (
                            <p className="text-muted-foreground text-center py-4 bg-accent/50 rounded-lg">
                                No payment method on file
                            </p>
                        )}
                        <Button className="w-full mt-6" variant="outline">Update Payment Method</Button>
                    </div>
                </motion.div>
            </div>
        </Layout>
    );
};

export default SubscriptionManagement;
