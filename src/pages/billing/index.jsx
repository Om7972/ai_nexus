import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/AuthGuard';
import Button from '../../components/ui/Button';
import { fetchBillingHistory } from '../../store/slices/subscriptionSlice';
import { CreditCard, Download, FileText } from 'lucide-react';

const Billing = () => {
    const dispatch = useDispatch();
    const { billingHistory } = useSelector((state) => state.subscription);

    useEffect(() => {
        dispatch(fetchBillingHistory());
    }, [dispatch]);

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Billing History</h1>
                        <p className="text-muted-foreground">View your past invoices and billing statements.</p>
                    </div>
                    <Button variant="outline">
                        <Download className="w-4 h-4 mr-2" /> Download All
                    </Button>
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl shadow-sm border border-border p-6 overflow-hidden">
                    {billingHistory.length === 0 ? (
                        <div className="text-center py-10">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No billing history found.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {billingHistory.map((invoice, index) => (
                                <div key={index} className="flex justify-between items-center py-4 border-b border-border last:border-b-0">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-accent rounded-lg text-primary">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-foreground">{invoice.description}</p>
                                            <p className="text-sm text-muted-foreground">{invoice.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center space-x-4">
                                        <div>
                                            <p className="font-medium text-foreground">${invoice.amount}</p>
                                            <p className="text-sm text-green-500">{invoice.status}</p>
                                        </div>
                                        <Button variant="ghost" size="icon" title="Download Invoice">
                                            <Download className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </Layout>
    );
};

export default Billing;
