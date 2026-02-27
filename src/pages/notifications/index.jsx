import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import Layout from '../../components/Layout';
import AuthGuard from '../../components/AuthGuard';
import Button from '../../components/ui/Button';
import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
} from '../../store/slices/notificationSlice';
import { Bell, Check, Trash2, Shield, Settings, CheckCircle, AlertTriangle, Info, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
    const dispatch = useDispatch();
    const { notifications, unreadCount, loading } = useSelector(state => state.notifications);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const handleMarkAsRead = (id) => dispatch(markNotificationAsRead(id));
    const handleMarkAllAsRead = () => dispatch(markAllNotificationsAsRead());
    const handleDeleteNotification = (id) => dispatch(deleteNotification(id));

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
            case 'error': return <AlertTriangle className="h-6 w-6 text-red-500" />;
            case 'info': return <Info className="h-6 w-6 text-blue-500" />;
            case 'message': return <MessageSquare className="h-6 w-6 text-purple-500" />;
            default: return <Bell className="h-6 w-6 text-muted-foreground" />;
        }
    };

    const getNotificationColor = (type) => {
        switch (type) {
            case 'success': return 'border-l-green-500';
            case 'warning': return 'border-l-yellow-500';
            case 'error': return 'border-l-red-500';
            case 'info': return 'border-l-blue-500';
            case 'message': return 'border-l-purple-500';
            default: return 'border-l-muted-foreground';
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center mb-2">
                            <Bell className="w-8 h-8 mr-3 text-primary" />
                            Notifications
                        </h1>
                        <p className="text-muted-foreground">View and manage all your recent alerts.</p>
                    </div>
                    {unreadCount > 0 && (
                        <Button onClick={handleMarkAllAsRead} variant="outline" className="shrink-0">
                            <Check className="w-4 h-4 mr-2" /> Mark All as Read
                        </Button>
                    )}
                </div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                            <p className="text-muted-foreground mt-4">Loading notifications...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-16 text-center">
                            <Bell className="h-16 w-16 text-muted/50 mx-auto mb-6" />
                            <h2 className="text-xl font-semibold text-foreground mb-2">You're all caught up!</h2>
                            <p className="text-muted-foreground">We'll let you know when something new happens.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`p-6 hover:bg-accent/50 transition-colors border-l-4 ${getNotificationColor(notif.type)} ${!notif.read ? 'bg-primary/5 dark:bg-primary/10' : ''
                                        }`}
                                >
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <h3 className={`text-base font-medium ${!notif.read ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                                                    {notif.title}
                                                </h3>
                                                <div className="flex items-center space-x-2 shrink-0">
                                                    {!notif.read && (
                                                        <Button variant="ghost" size="icon" title="Mark as read" onClick={() => handleMarkAsRead(notif.id)} className="h-8 w-8 text-primary hover:text-primary">
                                                            <Check className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDeleteNotification(notif.id)} className="h-8 w-8 hover:text-error hover:bg-error/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <p className="text-muted-foreground mt-1 mb-2">{notif.message}</p>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground/70 font-medium">
                                                    {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                                                </span>
                                                {notif.actionUrl && (
                                                    <a href={notif.actionUrl} className="text-primary hover:underline font-medium">View details &raquo;</a>
                                                )}
                                            </div>
                                        </div>
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

export default NotificationsPage;
