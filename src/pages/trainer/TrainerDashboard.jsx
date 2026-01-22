import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import AreaChartComponent from '@/components/charts/AreaChartComponent';
import DonutChart from '@/components/charts/DonutChart';
import {
  Users,
  Calendar,
  ClipboardList,
  TrendingUp,
  Dumbbell,
  Apple,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

/* ---------------- Dummy Data ---------------- */

const weeklyProgressData = [
  { name: 'Mon', progress: 65 },
  { name: 'Tue', progress: 72 },
  { name: 'Wed', progress: 68 },
  { name: 'Thu', progress: 80 },
  { name: 'Fri', progress: 75 },
  { name: 'Sat', progress: 82 },
  { name: 'Sun', progress: 78 },
];

const memberGoals = [
  { name: 'Weight Loss', value: 40, color: '#ef4444' },
  { name: 'Muscle Gain', value: 35, color: '#8b5cf6' },
  { name: 'Endurance', value: 15, color: '#06b6d4' },
  { name: 'Maintenance', value: 10, color: '#10b981' },
];

const todaysSessions = [
  { id: 1, member: 'John Smith', time: '09:00 AM', type: 'Strength Training', status: 'completed' },
  { id: 2, member: 'Sarah Wilson', time: '10:30 AM', type: 'Cardio Session', status: 'completed' },
  { id: 3, member: 'Mike Johnson', time: '02:00 PM', type: 'HIIT Workout', status: 'pending' },
  { id: 4, member: 'Emma Davis', time: '04:00 PM', type: 'Yoga & Flexibility', status: 'pending' },
];

export default function TrainerDashboard() {
  /* ---------------- Local State ---------------- */
  const [user] = useState({ full_name: 'Trainer' });

  /* ---------------- Static Counts ---------------- */
  const assignedCount = 24;
  const activeWorkouts = 18;
  const activeDiets = 16;
  const presentToday = 18;

  return (
    <DashboardLayout role="trainer" currentPage="TrainerDashboard" title="Trainer Dashboard">
      <div className="space-y-6">

        {/* Welcome Banner */}
        <GlassCard className="p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {user.full_name}! 💪
            </h2>
            <p className="text-slate-400">
              You have {todaysSessions.filter(s => s.status === 'pending').length} sessions scheduled for today.
            </p>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Assigned Members" value={assignedCount} icon={Users} gradient="from-violet-500 to-purple-600" />
          <StatCard title="Today's Sessions" value={todaysSessions.length} icon={Calendar} gradient="from-cyan-500 to-blue-600" />
          <StatCard title="Active Workouts" value={activeWorkouts} icon={Dumbbell} gradient="from-emerald-500 to-green-600" />
          <StatCard title="Present Today" value={`${presentToday}/${assignedCount}`} icon={ClipboardList} gradient="from-amber-500 to-orange-600" />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Today's Sessions */}
          <GlassCard className="lg:col-span-2">
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-lg font-semibold text-white">Today's Sessions</h3>
              <p className="text-sm text-slate-400">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </p>
            </div>

            <div className="p-4 space-y-3">
              {todaysSessions.map(session => (
                <div
                  key={session.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-medium">
                      {session.member.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white">{session.member}</p>
                      <p className="text-sm text-slate-400">{session.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock className="w-4 h-4" />
                      {session.time}
                    </div>
                    <StatusBadge status={session.status} />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Member Goals */}
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Member Goals</h3>
            <p className="text-sm text-slate-400 mb-4">Distribution by fitness goal</p>
            <DonutChart data={memberGoals} height={250} />
          </GlassCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Member Progress</h3>
            <AreaChartComponent
              data={weeklyProgressData}
              dataKey="progress"
              color="#8b5cf6"
              gradientId="progressGradient"
              height={250}
            />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Quick Overview</h3>
            <div className="space-y-4">
              <OverviewItem icon={Dumbbell} label="Active Workout Plans" value={activeWorkouts} />
              <OverviewItem icon={Apple} label="Active Diet Plans" value={activeDiets} />
              <OverviewItem icon={Users} label="Members Reached Goals" value="12" />
              <OverviewItem icon={TrendingUp} label="Avg. Attendance Rate" value="87%" />
            </div>
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

/* ---------------- Helper Component ---------------- */
function OverviewItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-slate-400" />
        <span className="text-slate-300">{label}</span>
      </div>
      <span className="text-xl font-bold text-white">{value}</span>
    </div>
  );
}
