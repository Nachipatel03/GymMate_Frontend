import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    Bell,
    Check,
    Trash2,
    Info,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const notificationIcons = {
    info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    success: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    warning: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    error: { icon: XCircle, color: 'text-rose-400', bg: 'bg-rose-500/20' }
};

import axios from "axios";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";

const dummyNotifications = [
    {
        id: 1,
        title: 'New Member Joined',
        message: 'John Smith has joined your gym',
        type: 'success',
        is_read: false,
        created_date: new Date().toISOString()
    },
    {
        id: 2,
        title: 'Payment Received',
        message: 'Payment of ₹150 received from Sarah Wilson',
        type: 'success',
        is_read: false,
        created_date: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 3,
        title: 'Membership Expiring Soon',
        message: "Mike Johnson's membership expires in 3 days",
        type: 'warning',
        is_read: true,
        created_date: new Date(Date.now() - 86400000).toISOString()
    }
];

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);


    const fetchNotifications = async () => {
        try {
            const res = await axios.get(
                apiRoutes.baseUrl + apiRoutes.Auth + apiRoutes.Notifications,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            setNotifications(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);


    const unreadCount = notifications.filter(n => !n.is_read).length;

    const markAsRead = async (id) => {
        try {
            await axios.patch(
                apiRoutes.baseUrl + apiRoutes.Auth + apiRoutes.NotificationRead(id),
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            setNotifications(prev =>
                prev.map(n =>
                    n.id === id ? { ...n, is_read: true } : n
                )
            );

        } catch (error) {
            console.error(error);
        }
    };


    const deleteNotification = async (id) => {
        try {
            await axios.delete(
                apiRoutes.baseUrl + apiRoutes.Auth + apiRoutes.NotificationDelete(id),
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            setNotifications(prev =>
                prev.filter(n => n.id !== id)
            );
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };



    const markAllAsRead = async () => {
        try {
            await axios.patch(
                apiRoutes.baseUrl + apiRoutes.Auth + apiRoutes.NotificationMarkAllRead,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
        } catch (error) {
            console.error("Failed to mark all as read", error);
        }
    };

    return (
        <DashboardLayout
            role="admin"
            currentPage="Notifications"
            title="Notifications"
        >
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Notifications</h2>
                        <p className="text-slate-400">
                            {unreadCount > 0
                                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                                : 'All caught up!'}
                        </p>
                    </div>

                    {unreadCount > 0 && (
                        <Button
                            onClick={markAllAsRead}
                            className="bg-gradient-to-r from-violet-500 to-purple-600"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Mark All as Read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {notifications.length === 0 ? (
                        <GlassCard className="p-12">
                            <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 mb-4">
                                    <Bell className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-lg font-medium text-white mb-2">No notifications</h3>
                                <p className="text-slate-400">You're all caught up!</p>
                            </div>
                        </GlassCard>
                    ) : (
                        notifications.map((notification, index) => {
                            const iconConfig =
                                notification.title.toLowerCase().includes("expired")
                                    ? notificationIcons.error
                                    : notification.title.toLowerCase().includes("expiring")
                                        ? notificationIcons.warning
                                        : notificationIcons.success;
                            const Icon = iconConfig.icon;

                            return (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <GlassCard className={`${notification.is_read ? 'opacity-60' : ''}`}>
                                        <div className="p-4 flex items-start gap-4">

                                            {/* Icon */}
                                            <div className={`p-3 rounded-xl ${iconConfig.bg}`}>
                                                <Icon className={`w-5 h-5 ${iconConfig.color}`} />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-4 mb-1">
                                                    <h3 className="text-base font-semibold text-white">
                                                        {notification.title}
                                                        {!notification.is_read && (
                                                            <span className="ml-2 inline-block w-2 h-2 bg-violet-500 rounded-full"></span>
                                                        )}
                                                    </h3>

                                                    <span className="text-xs text-slate-500">
                                                        {notification.created_at && !isNaN(new Date(notification.created_at).getTime())
                                                            ? format(new Date(notification.created_at), 'MMM d, h:mm a')
                                                            : 'Just now'}
                                                    </span>
                                                </div>

                                                <p className="text-sm text-slate-400 mb-3">
                                                    {notification.message}
                                                </p>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    {!notification.is_read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-slate-400 hover:text-violet-400 h-8 px-3"
                                                        >
                                                            <Check className="w-3 h-3 mr-1" />
                                                            Mark as read
                                                        </Button>
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="text-slate-400 hover:text-rose-400 h-8 px-3 ml-auto"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>

                                        </div>
                                    </GlassCard>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
