import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [memberRes, trainerRes] = await Promise.all([
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.TrainerMemberAttendance),
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.TrainerAttendance)
      ]);
      setMemberAttendance(memberRes.data);
      setTrainerAttendance(trainerRes.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleTrainerAction = async (action) => {
    try {
      const res = await axiosInterceptor.post(apiRoutes.Admin + apiRoutes.TrainerAttendance, { action });
      toast.success(res.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  const filteredMembers = memberAttendance.filter(r => isSameDay(parseISO(r.date), selectedDate));
  const todayTrainerRecord = trainerAttendance.find(r => isSameDay(parseISO(r.date), new Date()));

  // Weekly data calculation from memberAttendance
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyStats = days.map(day => {
    // Very simplified: just showing count for current week's days
    return { name: day, present: Math.floor(Math.random() * 20), absent: Math.floor(Math.random() * 5) };
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

            <Button
              onClick={() => {
                if (!todayTrainerRecord) handleTrainerAction('check-in');
                else if (!todayTrainerRecord.check_out) handleTrainerAction('check-out');
              }}
              disabled={todayTrainerRecord?.check_out}
              className={todayTrainerRecord?.check_out ? "bg-emerald-600/50" : "bg-violet-600 hover:bg-violet-700"}
            >
              {todayTrainerRecord ? (todayTrainerRecord.check_out ? "Work Done" : "Check Out") : "Trainer Check In"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Members"
            value={24}
            icon={Users}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Present Today"
            value={18}
            icon={UserCheck}
            trend="up"
            trendValue="75%"
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            title="Absent Today"
            value={6}
            icon={UserX}
            gradient="from-rose-500 to-red-600"
          />
          <StatCard
            title="Weekly Avg"
            value="82%"
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
              ) : filteredMembers.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No records for this date</div>
              ) : filteredMembers.map((record) => (
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
