import React, { useState, useEffect, useMemo } from 'react';
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
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  UserCheck,
  Target,
  Flame,
  Activity
} from 'lucide-react';
import { format, isToday, parseISO, subDays } from 'date-fns';
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/* -------------------------------------------------------------------------- */
/*                              COMPONENT                                     */
/* -------------------------------------------------------------------------- */

const goalColors = {
  weight_loss: '#f43f5e',
  muscle_gain: '#8b5cf6',
  endurance: '#06b6d4',
  maintenance: '#10b981',
};

export default function TrainerDashboard() {

  /* ---------------------------- STATE ----------------------------------- */

  const [trainerProfile, setTrainerProfile] = useState(null);
  const [members, setMembers] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [memberAttendance, setMemberAttendance] = useState([]);
  const [trainerAttendance, setTrainerAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------- FETCH -------------------------------- */

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, workoutRes, dietRes, memberAttRes, trainerAttRes] = await Promise.all([
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.Members),
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.WorkoutPlans),
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.TrainerDietPlans),
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.TrainerMemberAttendance),
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.TrainerAttendance),
      ]);

      const memberData = Array.isArray(membersRes.data) ? membersRes.data : membersRes.data.results || [];
      setMembers(memberData);
      setWorkoutPlans(workoutRes.data || []);
      setDietPlans(dietRes.data || []);
      setMemberAttendance(memberAttRes.data || []);
      setTrainerAttendance(trainerAttRes.data || []);

      // Try to get trainer profile from localStorage, or use first member's trainer info
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try { setTrainerProfile(JSON.parse(storedUser)); } catch { }
      }

    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  /* ---------------------------- CALCULATIONS ----------------------------- */

  const todayTrainerRecord = trainerAttendance.find(r => {
    try { return isToday(parseISO(r.date)); } catch { return false; }
  });

  const presentTodayCount = memberAttendance.filter(r => {
    try { return isToday(parseISO(r.date)) && r.status === 'present'; } catch { return false; }
  }).length;

  const activeWorkouts = workoutPlans.filter(w => w.status === 'active').length;
  const activeDiets = dietPlans.filter(d => d.status === 'active').length;

  // Today's workout plans (members who have plans today)
  const todayDay = format(new Date(), 'EEEE'); // e.g., "Friday"
  const todayWorkouts = workoutPlans.filter(p => p.day === todayDay);

  // Member Attendance Trend — last 7 days
  const attendanceTrend = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const present = memberAttendance.filter(r => r.date === dateStr && r.status === 'present').length;
      return { name: format(d, 'EEE'), present, date: dateStr };
    });
    return days;
  }, [memberAttendance]);

  // Member goal distribution for DonutChart
  const goalDistribution = useMemo(() => {
    const counts = {};
    members.forEach(m => {
      const g = m.goal || 'not_set';
      counts[g] = (counts[g] || 0) + 1;
    });
    return Object.entries(counts).map(([key, value]) => ({
      name: key.replace('_', ' '),
      value,
      color: goalColors[key] || '#64748b',
    }));
  }, [members]);

  // Members present vs absent today
  const totalMembersToday = memberAttendance.filter(r => {
    try { return isToday(parseISO(r.date)); } catch { return false; }
  }).length;
  const absentTodayCount = totalMembersToday - presentTodayCount;

  /* ---------------------------- UI --------------------------------------- */

  return (
    <DashboardLayout role="trainer" currentPage="TrainerDashboard" title="Trainer Dashboard">
      <div className="space-y-6">

        {/* Welcome + Attendance Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <GlassCard className="lg:col-span-3 p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  Welcome back, {trainerProfile?.full_name || trainerProfile?.name || 'Trainer'}! 💪
                </h2>
                <p className="text-slate-400 text-sm">
                  Today is <span className="text-violet-400 font-semibold">{todayDay}</span>.
                  You have <span className="text-white font-semibold">{todayWorkouts.length}</span> workout sessions planned and{' '}
                  <span className="text-emerald-400 font-semibold">{presentTodayCount}</span> members present.
                </p>
              </div>
              <div className="flex gap-3 shrink-0">
                <div className="text-center px-4 py-3 bg-violet-500/10 rounded-xl border border-violet-500/20">
                  <p className="text-2xl font-bold text-violet-400">{members.length}</p>
                  <p className="text-xs text-slate-400">Members</p>
                </div>
                <div className="text-center px-4 py-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <p className="text-2xl font-bold text-emerald-400">{activeWorkouts}</p>
                  <p className="text-xs text-slate-400">Active Plans</p>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Trainer Attendance Card */}
          <GlassCard className={`p-6 flex flex-col justify-between transition-all ${todayTrainerRecord?.check_out ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-violet-500/30 bg-violet-500/5'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${todayTrainerRecord?.check_out ? 'bg-emerald-500/20' : 'bg-violet-500/20'}`}>
                {todayTrainerRecord
                  ? (todayTrainerRecord.check_out ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <Clock className="w-6 h-6 text-violet-400" />)
                  : <UserCheck className="w-6 h-6 text-violet-400" />}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">My Attendance</p>
                <p className={`text-xs font-bold ${todayTrainerRecord?.check_out ? 'text-emerald-400' : 'text-violet-400'}`}>
                  {todayTrainerRecord ? (todayTrainerRecord.check_out ? 'DONE' : 'ACTIVE') : 'NOT CHECKED IN'}
                </p>
              </div>
            </div>

            {todayTrainerRecord && (
              <div className="mb-3 space-y-1 text-xs text-slate-400">
                {todayTrainerRecord.check_in && (
                  <p>🟢 In: <span className="text-white font-medium">{todayTrainerRecord.check_in}</span></p>
                )}
                {todayTrainerRecord.check_out && (
                  <p>🔴 Out: <span className="text-white font-medium">{todayTrainerRecord.check_out}</span></p>
                )}
              </div>
            )}

            <Button
              onClick={() => {
                if (!todayTrainerRecord) handleTrainerAction('check-in');
                else if (!todayTrainerRecord.check_out) handleTrainerAction('check-out');
              }}
              disabled={todayTrainerRecord?.check_out}
              className={`w-full h-10 gap-2 rounded-xl text-sm font-bold transition-all shadow-lg ${todayTrainerRecord
                ? (todayTrainerRecord.check_out
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 cursor-default'
                  : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20')
                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20'}`}
            >
              {todayTrainerRecord
                ? (todayTrainerRecord.check_out ? <CheckCircle className="w-4 h-4" /> : <LogOut className="w-4 h-4" />)
                : <LogIn className="w-4 h-4" />}
              {todayTrainerRecord
                ? (todayTrainerRecord.check_out ? 'Present ✓' : 'Check Out')
                : 'Check In'}
            </Button>
          </GlassCard>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Assigned Members"
            value={members.length}
            icon={Users}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Today's Sessions"
            value={todayWorkouts.length}
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
            value={presentTodayCount}
            icon={ClipboardList}
            gradient="from-amber-500 to-orange-600"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member Attendance Trend */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Member Attendance</h3>
                <p className="text-xs text-slate-500">Last 7 days</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />
                <span className="text-slate-400">Present</span>
              </div>
            </div>
            {memberAttendance.length > 0 ? (
              <AreaChartComponent
                data={attendanceTrend}
                dataKey="present"
                xAxisKey="name"
                color="#8b5cf6"
                height={240}
                gradientId="attendanceGrad"
              />
            ) : (
              <div className="h-[240px] flex items-center justify-center text-slate-500 text-sm">
                No attendance data yet
              </div>
            )}
          </GlassCard>

          {/* Goal Distribution */}
          <GlassCard className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white">Member Goals</h3>
              <p className="text-xs text-slate-500">Distribution across all assigned members</p>
            </div>
            {goalDistribution.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <DonutChart data={goalDistribution} height={220} />
                </div>
                <div className="space-y-3 min-w-[130px]">
                  {goalDistribution.map(item => (
                    <div key={item.name} className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div>
                        <p className="text-xs text-white capitalize font-medium">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.value} member{item.value !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">
                No members assigned yet
              </div>
            )}
          </GlassCard>
        </div>

        {/* Today's Sessions + Active Members */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Today's Workout Sessions */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Today's Sessions</h3>
                <p className="text-xs text-slate-500 capitalize">{todayDay} workout plans</p>
              </div>
              <span className="text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-2 py-1 rounded-full font-semibold">
                {todayWorkouts.length} Plans
              </span>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {todayWorkouts.length > 0 ? todayWorkouts.map(plan => (
                <div key={plan.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-violet-500/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                    <Dumbbell className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{plan.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="text-violet-400">{plan.member_name}</span>
                      {plan.end_time && <> · <Clock className="w-3 h-3" /> {plan.end_time}</>}
                    </p>
                  </div>
                  <StatusBadge status={plan.status} />
                </div>
              )) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  No workout sessions for {todayDay}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Today's Member Attendance */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Member Attendance Today</h3>
                <p className="text-xs text-slate-500">{format(new Date(), 'MMMM d, yyyy')}</p>
              </div>
              <div className="flex gap-2 text-xs">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full font-semibold">
                  {presentTodayCount} Present
                </span>
              </div>
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-1">
              {members.length > 0 ? members.map(member => {
                const todayRecord = memberAttendance.find(r => {
                  try { return r.member === member.id && isToday(parseISO(r.date)); }
                  catch { return false; }
                });
                return (
                  <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {member.full_name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{member.full_name}</p>
                      <p className="text-xs text-slate-500 capitalize">{member.goal?.replace('_', ' ') || 'No goal'}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${todayRecord?.status === 'present'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-slate-700/50 text-slate-500 border-slate-700/30'
                      }`}>
                      {todayRecord?.status === 'present' ? '✓ Present' : 'Absent'}
                    </span>
                  </div>
                );
              }) : (
                <div className="text-center py-10 text-slate-500 text-sm">
                  <Users className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  No members assigned yet
                </div>
              )}
            </div>
          </GlassCard>

        </div>

        {/* Diet Plans Summary */}
        {dietPlans.length > 0 && (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Active Diet Plans</h3>
                <p className="text-xs text-slate-500">Nutrition plans across your members</p>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded-full font-semibold">
                {activeDiets} Active
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dietPlans.filter(d => d.status === 'active').slice(0, 6).map(plan => (
                <div key={plan.id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30 hover:border-emerald-500/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <Apple className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{plan.name}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <span className="text-emerald-400">{plan.member_name}</span>
                      <span className="text-slate-600">·</span>
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span>{plan.daily_calories} cal</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

      </div>
    </DashboardLayout>
  );
}
