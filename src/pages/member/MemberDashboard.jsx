import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatCard from '@/components/ui/StatCard';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import AreaChartComponent from '@/components/charts/AreaChartComponent';
import DonutChart from '@/components/charts/DonutChart';
import { 
  Calendar,
  Dumbbell,
  Apple,
  TrendingUp,
  Clock,
  Flame,
  Trophy
} from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';

// Dummy data
const bodyProgressData = [
  { name: 'Jan', weight: 85 },
  { name: 'Feb', weight: 83 },
  { name: 'Mar', weight: 81 },
  { name: 'Apr', weight: 79 },
  { name: 'May', weight: 77 },
  { name: 'Jun', weight: 75 },
];

const macroData = [
  { name: 'Protein', value: 150, color: '#8b5cf6' },
  { name: 'Carbs', value: 200, color: '#06b6d4' },
  { name: 'Fat', value: 70, color: '#f59e0b' },
];

const todayWorkout = {
  name: 'Upper Body Strength',
  exercises: [
    { name: 'Bench Press', sets: 4, reps: 10, completed: true },
    { name: 'Shoulder Press', sets: 3, reps: 12, completed: true },
    { name: 'Bent Over Rows', sets: 4, reps: 10, completed: false },
    { name: 'Bicep Curls', sets: 3, reps: 15, completed: false },
    { name: 'Tricep Dips', sets: 3, reps: 12, completed: false },
  ]
};

const upcomingSessions = [
  { id: 1, date: 'Today', time: '06:00 PM', type: 'Personal Training' },
  { id: 2, date: 'Tomorrow', time: '07:00 AM', type: 'Group Cardio' },
  { id: 3, date: 'Wed', time: '05:30 PM', type: 'HIIT Session' },
];

export default function MemberDashboard() {
  const memberName = 'Member'; // 🔁 Replace later with auth user data
  const membershipEnd = new Date('2024-12-31');
  const daysRemaining = differenceInDays(membershipEnd, new Date());

  const completedExercises = todayWorkout.exercises.filter(e => e.completed).length;
  const workoutProgress = (completedExercises / todayWorkout.exercises.length) * 100;

  return (
    <DashboardLayout role="member" currentPage="MemberDashboard" title="My Dashboard">
      <div className="space-y-6">

        {/* Welcome Card */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <GlassCard className="lg:col-span-2 p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {memberName.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Welcome, {memberName}! 🔥
                  </h2>
                  <p className="text-slate-400">Let's crush today's goals</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">15 Day Streak</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/20">
                  <Flame className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-violet-400">2,450 Cal Burned</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Membership */}
          <GlassCard className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-sm text-slate-400">Membership</h3>
              <StatusBadge status="premium" />
            </div>
            <div className="text-3xl font-bold text-white">{daysRemaining}</div>
            <p className="text-sm text-slate-400">Days remaining</p>
            <Progress value={(daysRemaining / 365) * 100} className="mt-4 h-2" />
          </GlassCard>
        </div>

        {/* Workout Progress */}
        <GlassCard>
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg text-white">{todayWorkout.name}</h3>
            <Progress value={workoutProgress} className="mt-4 h-2" />
          </div>

          <div className="p-4 space-y-2">
            {todayWorkout.exercises.map((exercise, i) => (
              <div key={i} className="flex justify-between p-4 rounded-xl bg-slate-800/40">
                <span className="text-white">{exercise.name}</span>
                {exercise.completed && <span className="text-emerald-400">✓</span>}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <AreaChartComponent
              data={bodyProgressData}
              dataKey="weight"
              color="#8b5cf6"
              height={250}
            />
          </GlassCard>

          <GlassCard className="p-6">
            <DonutChart data={macroData} height={200} />
          </GlassCard>
        </div>

      </div>
    </DashboardLayout>
  );
}
