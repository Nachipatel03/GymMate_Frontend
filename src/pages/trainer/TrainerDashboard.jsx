import React, { useState, useEffect } from 'react';
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

/* -------------------------------------------------------------------------- */
/*                              TEMP DATA (remove later)                      */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                              COMPONENT                                     */
/* -------------------------------------------------------------------------- */

export default function TrainerDashboard() {

  /* ---------------------------- STATE ----------------------------------- */

  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);

  /* ---------------------------- TEMP LOAD -------------------------------- */

  useEffect(() => {
    // 🔹 Replace these later with your axios APIs

    setUser({ full_name: "Trainer" });
    setMembers([]);
    setWorkoutPlans([]);
    setDietPlans([]);
    setTodayAttendance([]);
  }, []);

  /* ---------------------------- CALCULATIONS ----------------------------- */

  const assignedCount = members.length;
  const activeWorkouts = workoutPlans.filter(w => w.status === 'active').length;
  const activeDiets = dietPlans.filter(d => d.status === 'active').length;
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;

  /* ---------------------------- UI --------------------------------------- */

  return (
    <DashboardLayout role="trainer" currentPage="TrainerDashboard" title="Trainer Dashboard">
      <div className="space-y-6">

        {/* Welcome Banner */}
        <GlassCard className="p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white mb-2">
              Welcome back, {user?.full_name || 'Trainer'}! 💪
            </h2>
            <p className="text-slate-400">
              You have {todaysSessions.filter(s => s.status === 'pending').length} sessions scheduled for today.
            </p>
          </div>
        </GlassCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Members"
            value={assignedCount}
            icon={Users}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Today's Sessions"
            value={todaysSessions.length}
            icon={Calendar}
            gradient="from-cyan-500 to-blue-600"
          />
          <StatCard
            title="Active Workouts"
            value={activeWorkouts}
            icon={Dumbbell}
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            title="Present Today"
            value={`${presentToday}/${assignedCount}`}
            icon={ClipboardList}
            gradient="from-amber-500 to-orange-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Member Goals</h3>
            <DonutChart data={memberGoals} height={250} />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3>
            <AreaChartComponent
              data={weeklyProgressData}
              dataKey="progress"
              color="#8b5cf6"
              gradientId="progressGradient"
              height={250}
            />
          </GlassCard>
        </div>

      </div>
    </DashboardLayout>
  );
}
