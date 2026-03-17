import React, { useState } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import BarChartComponent from '@/components/charts/BarChartComponent';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  CalendarIcon,
  UserCheck,
  UserX,
  Users,
  TrendingUp
} from 'lucide-react';
import { format, isSameDay, parseISO } from 'date-fns';
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { toast } from 'sonner';

export default function TrainerAttendance() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [memberAttendance, setMemberAttendance] = useState([]);
  const [trainerAttendance, setTrainerAttendance] = useState([]);
  const [stats, setStats] = useState({
    total_members: 0,
    present_today: 0,
    absent_today: 0,
    attendance_rate: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const dateStr = format(selectedDate, 'yyyy-MM-dd');

      const [memberRes, trainerRes] = await Promise.all([
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.TrainerMemberAttendance + `?date=${dateStr}`),
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.TrainerAttendance)
      ]);

      setMemberAttendance(memberRes.data.attendance || []);
      setStats(memberRes.data.stats || {
        total_members: 0,
        present_today: 0,
        absent_today: 0,
        attendance_rate: 0
      });
      setTrainerAttendance(trainerRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();

    // Listen for global attendance updates
    const handleUpdate = () => fetchData();
    window.addEventListener('attendanceUpdated', handleUpdate);
    return () => window.removeEventListener('attendanceUpdated', handleUpdate);
  }, [selectedDate]);

  const todayTrainerRecord = trainerAttendance.find(r => isSameDay(parseISO(r.date), new Date()));

  // Weekly data calculation - for now we use the today's rate for the current day and mock others
  // In a real app, this would be another API call for historical daily stats
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const currentDayName = format(selectedDate, 'EEE');
  const weeklyStats = days.map(day => {
    if (day === currentDayName) {
      return { name: day, present: stats.present_today, absent: stats.absent_today };
    }
    return { name: day, present: 0, absent: 0 };
  });


  return (
    <DashboardLayout role="trainer" currentPage="TrainerAttendance" title="Member Attendance">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Attendance</h2>
            <p className="text-slate-400">Track your members' attendance</p>
          </div>

          <div className="flex items-center gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-slate-800/50 border-slate-700 text-white">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(selectedDate, 'MMMM d, yyyy')}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="bg-slate-900"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Members"
            value={stats.total_members}
            icon={Users}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Present Today"
            value={stats.present_today}
            icon={UserCheck}
            trend={stats.attendance_rate > 50 ? "up" : "down"}
            trendValue={`${stats.attendance_rate.toFixed(1)}%`}
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            title="Absent Today"
            value={stats.absent_today}
            icon={UserX}
            gradient="from-rose-500 to-red-600"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats.attendance_rate.toFixed(0)}%`}
            icon={TrendingUp}
            gradient="from-cyan-500 to-blue-600"
          />
        </div>

        {/* Chart + List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Weekly Chart */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Weekly Overview
            </h3>

            <BarChartComponent
              data={weeklyStats}
              dataKey="present"
              secondaryDataKey="absent"
              height={280}
            />
          </GlassCard>

          {/* Today's Attendance List */}
          <GlassCard>
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-lg font-semibold text-white">
                Today's Attendance
              </h3>
              <p className="text-sm text-slate-400">
                {format(selectedDate, 'EEEE, MMMM d')}
              </p>
            </div>

            <div className="p-4 space-y-2">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading records...</div>
              ) : memberAttendance.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No records for this date</div>
              ) : memberAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.status === 'present'
                      ? 'bg-emerald-500/20'
                      : 'bg-rose-500/20'
                      }`}>
                      {record.status === 'present'
                        ? <UserCheck className="w-5 h-5 text-emerald-400" />
                        : <UserX className="w-5 h-5 text-rose-400" />
                      }
                    </div>

                    <div>
                      <p className="font-medium text-white">{record.member_name}</p>
                      {record.check_in && (
                        <p className="text-xs text-slate-500">
                          In: {record.check_in} {record.check_out && `• Out: ${record.check_out}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <StatusBadge status={record.status} />
                </div>
              ))}
            </div>
          </GlassCard>

        </div>
      </div>
    </DashboardLayout>
  );
}
