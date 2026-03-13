import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import BarChartComponent from "@/components/charts/BarChartComponent";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CalendarIcon,
  UserCheck,
  UserX,
  Users,
  Clock,
  Coffee,
} from "lucide-react";
import { format, parseISO } from "date-fns";
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*                               DYNAMIC DATA                                 */
/* -------------------------------------------------------------------------- */


export default function AttendanceOverview() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState({ member_attendance: [], trainer_attendance: [], stats: {} });
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axiosInterceptor.get(apiRoutes.Admin + apiRoutes.AdminAttendanceOverview, {
        params: { date: format(selectedDate, "yyyy-MM-dd") }
      });
      setData(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch attendance logs");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const stats = data.stats || {};
  const attendanceRate = stats.total_members > 0 ? Math.round((stats.present_members / stats.total_members) * 100) : 0;

  // Placeholder for weekly trend (would need a separate historical API for accuracy)
  const weeklyTrend = [
    { name: 'Mon', present: 12, absent: 4 },
    { name: 'Tue', present: 15, absent: 2 },
    { name: 'Wed', present: 10, absent: 6 },
    { name: 'Thu', present: 18, absent: 1 },
    { name: 'Fri', present: stats.present_members || 0, absent: stats.absent_members || 0 },
    { name: 'Sat', present: 8, absent: 3 },
    { name: 'Sun', present: 5, absent: 2 },
  ];


  const formattedDate = useMemo(
    () => format(selectedDate, "MMMM d, yyyy"),
    [selectedDate]
  );

  return (
    <DashboardLayout title="Attendance Overview">
      <div className="space-y-6">

        {/* Header with Date Picker */}
        <PageHeader
          title="Attendance"
          subtitle="Track member attendance"
          action={
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="bg-slate-800 border-slate-700 text-white"
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {formattedDate}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                />
              </PopoverContent>
            </Popover>
          }
        />

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Members"
            value={stats.total_members || 0}
            icon={Users}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Present Today"
            value={stats.present_members || 0}
            icon={UserCheck}
            trend="up"
            trendValue={`${attendanceRate}%`}
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            title="Absent Today"
            value={stats.absent_members || 0}
            icon={UserX}
            gradient="from-rose-500 to-red-600"
          />
          <StatCard
            title="Present Trainers"
            value={stats.present_trainers || 0}
            icon={Clock}
            gradient="from-amber-500 to-orange-600"
          />
        </div>

        {/* Charts and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Weekly Chart */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Weekly Overview
                </h3>
                <p className="text-sm text-slate-400">
                  Attendance trend this week
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-xs text-slate-400">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-xs text-slate-400">Absent</span>
                </div>
              </div>
            </div>

            <BarChartComponent
              data={weeklyTrend}
              dataKey="present"
              secondaryDataKey="absent"
              height={300}
            />
          </GlassCard>

          {/* Today's Attendance */}
          <GlassCard>
            <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {format(selectedDate, "EEEE, MMMM d")} Log
                </h3>
              </div>
              <div className="flex gap-2">
                <div className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Members: {stats.present_members}</div>
                <div className="text-[10px] bg-violet-500/10 text-violet-400 px-2 py-1 rounded">Trainers: {stats.present_trainers}</div>
              </div>
            </div>

            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-slate-500">Loading logs...</div>
              ) : [...data.member_attendance, ...data.trainer_attendance].length === 0 ? (
                <div className="p-8 text-center text-slate-500">No records found for this date</div>
              ) : (
                [...data.member_attendance, ...data.trainer_attendance].map((record, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.status === "present"
                          ? "bg-emerald-500/20"
                          : "bg-rose-500/20"
                          }`}
                      >
                        {record.status === "present" ? (
                          <UserCheck className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <UserX className="w-5 h-5 text-rose-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white flex items-center gap-2">
                          {record.member_name || record.trainer_name}
                          {record.trainer_name && (
                            <>
                              <span className="text-[10px] text-violet-400 bg-violet-400/10 px-1 rounded">Trainer</span>
                              {record.breaks?.some(b => !b.end_time) && (
                                <span className="text-[10px] text-amber-400 bg-amber-400/10 px-1 rounded flex items-center gap-1">
                                  <Coffee className="w-2 h-2" /> On Break
                                </span>
                              )}
                            </>
                          )}
                        </p>
                        {record.check_in && (
                          <p className="text-xs text-slate-500">
                            In: {record.check_in}
                            {record.check_out && ` • Out: ${record.check_out}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>

        {/* Peak Hours */}
        <GlassCard className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Peak Hours</h3>
            <p className="text-sm text-slate-400">
              Busiest times at the gym
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"].map(
              (time, idx) => {
                const heights = [45, 75, 55, 40, 35, 60, 90, 65];
                return (
                  <div key={time} className="text-center">
                    <div className="h-24 flex items-end justify-center mb-2">
                      <div
                        className="w-8 rounded-t-lg bg-gradient-to-t from-violet-500 to-purple-500"
                        style={{ height: `${heights[idx]}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{time}</span>
                  </div>
                );
              }
            )}
          </div>
        </GlassCard>

      </div>
    </DashboardLayout>
  );
}
