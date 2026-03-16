import { useState, useEffect, useCallback } from 'react';
import axiosInterceptor from '@/api/axiosInterceptor';
import apiRoutes from '@/services/ApiRoutes/ApiRoutes';
import { toast } from 'sonner';
import { isToday, parseISO } from 'date-fns';

export const useAttendance = (user) => {
    const [todayRecord, setTodayRecord] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchStatus = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            const role = user.role?.toLowerCase();
            let endpoint = "";

            if (role === 'member') {
                endpoint = apiRoutes.Admin + apiRoutes.MemberAttendance;
            } else if (role === 'trainer') {
                endpoint = apiRoutes.Admin + apiRoutes.TrainerAttendance;
            } else {
                setLoading(false);
                return;
            }

            const res = await axiosInterceptor.get(endpoint);
            const records = Array.isArray(res.data) ? res.data : (res.data.attendance || []);

            // Find today's record
            const today = records.find(r => {
                try {
                    return isToday(parseISO(r.date));
                } catch (e) {
                    return false;
                }
            });

            setTodayRecord(today || null);
        } catch (error) {
            console.error("Failed to fetch attendance status:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const handleAction = async (action) => {
        if (!user) return;

        try {
            const role = user.role?.toLowerCase();
            let endpoint = "";

            if (role === 'member') {
                endpoint = apiRoutes.Admin + apiRoutes.MemberAttendance;
            } else if (role === 'trainer') {
                endpoint = apiRoutes.Admin + apiRoutes.TrainerAttendance;
            } else {
                return;
            }

            const res = await axiosInterceptor.post(endpoint, { action });
            toast.success(res.data.message);
            await fetchStatus();

            // Dispatch a custom event so other components (like Attendance pages) can refresh
            window.dispatchEvent(new CustomEvent('attendanceUpdated'));

            return res.data;
        } catch (error) {
            const msg = error.response?.data?.message || "Attendance action failed";
            toast.error(msg);
            throw error;
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [fetchStatus]);

    const isOnBreak = todayRecord?.breaks?.some(b => !b.end_time) || false;

    return {
        todayRecord,
        loading,
        handleAction,
        refreshStatus: fetchStatus,
        isOnBreak
    };
};
