import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import AreaChartComponent from '@/components/charts/AreaChartComponent';
import { 
  Calendar,
  UserCheck,
  Trophy,
  TrendingUp,
  Clock,
  Flame
} from 'lucide-react';
import { format, subDays } from 'date-fns';

const attendanceHistory = [
  { date: subDays(new Date(), 0), status: 'present', checkIn: '06:30 AM', checkOut: '08:15 AM', duration: '1h 45m' },
  { date: subDays(new Date(), 1), status: 'present', checkIn: '07:00 AM', checkOut: '09:00 AM', duration: '2h' },
  { date: subDays(new Date(), 2), status: 'absent', checkIn: null, checkOut: null, duration: null },
  { date: subDays(new Date(), 3), status: 'present', checkIn: '05:45 AM', checkOut: '07:30 AM', duration: '1h 45m' },
  { date: subDays(new Date(), 4), status: 'present', checkIn: '06:00 AM', checkOut: '08:00 AM', duration: '2h' },
  { date: subDays(new Date(), 5), status: 'present', checkIn: '06:15 AM', checkOut: '07:45 AM', duration: '1h 30m' },
  { date: subDays(new Date(), 6), status: 'absent', checkIn: null, checkOut: null, duration: null },
];

const weeklyData = [
  { name: 'Week 1', attendance: 5 },
  { name: 'Week 2', attendance: 6 },
  { name: 'Week 3', attendance: 4 },
  { name: 'Week 4', attendance: 7 },
];

export default function MyAttendance() {
  const totalDays = attendanceHistory.length;
  const presentDays = attendanceHistory.filter(d => d.status === 'present').length;
  const attendanceRate = Math.round((presentDays / totalDays) * 100);
  const currentStreak = 3;

  return (
    <DashboardLayout role="member" currentPage="MyAttendance" title="My Attendance">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="This Month"
            value={`${presentDays}/${totalDays}`}
            icon={Calendar}
            gradient="from-violet-500 to-purple-600"
            delay={0}
          />
          <StatCard
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            icon={UserCheck}
            trend="up"
            trendValue="+5%"
            gradient="from-emerald-500 to-green-600"
            delay={0.1}
          />
          <StatCard
            title="Current Streak"
            value={`${currentStreak} days`}
            icon={Flame}
            gradient="from-orange-500 to-red-600"
            delay={0.2}
          />
          <StatCard
            title="Best Streak"
            value="15 days"
            icon={Trophy}
            gradient="from-amber-500 to-yellow-600"
            delay={0.3}
          />
        </div>

        {/* Chart and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Trend */}
          <GlassCard className="p-6" delay={0.2}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Weekly Trend</h3>
                <p className="text-sm text-slate-400">Your attendance over weeks</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">Improving</span>
              </div>
            </div>
            <AreaChartComponent 
              data={weeklyData} 
              dataKey="attendance"
              color="#8b5cf6"
              gradientId="attendanceGradient"
              height={250}
            />
          </GlassCard>

          {/* This Week Grid */}
          <GlassCard className="p-6" delay={0.3}>
            <h3 className="text-lg font-semibold text-white mb-6">This Week</h3>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const attended = [true, true, false, true, true, true, false][idx];
                return (
                  <div key={day} className="text-center">
                    <span className="text-xs text-slate-500 block mb-2">{day}</span>
                    <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center ${
                      attended 
                        ? 'bg-emerald-500/20 border border-emerald-500/30' 
                        : 'bg-slate-800'
                    }`}>
                      {attended ? (
                        <UserCheck className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <span className="text-slate-600">-</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Recent History */}
        <GlassCard delay={0.4}>
          <div className="p-6 border-b border-slate-700/50">
            <h3 className="text-lg font-semibold text-white">Recent History</h3>
            <p className="text-sm text-slate-400">Last 7 days</p>
          </div>
          <div className="p-4 space-y-2">
            {attendanceHistory.map((record, index) => (
              <div 
                key={index}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  record.status === 'present' 
                    ? 'bg-slate-800/30' 
                    : 'bg-rose-500/5 border border-rose-500/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    record.status === 'present' 
                      ? 'bg-emerald-500/20' 
                      : 'bg-rose-500/20'
                  }`}>
                    <span className={`text-lg font-bold ${
                      record.status === 'present' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {format(record.date, 'd')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {format(record.date, 'EEEE, MMMM d')}
                    </p>
                    {record.checkIn && (
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>In: {record.checkIn}</span>
                        <span>•</span>
                        <span>Out: {record.checkOut}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{record.duration}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <StatusBadge status={record.status} />
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}