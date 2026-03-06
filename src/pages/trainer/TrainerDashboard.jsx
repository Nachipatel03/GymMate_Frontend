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
  Clock,
  LogIn,
  LogOut,
  CheckCircle,
  UserCheck
} from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

/* -------------------------------------------------------------------------- */
/*                              COMPONENT                                     */
/* -------------------------------------------------------------------------- */

export default function TrainerDashboard() {

  /* ---------------------------- STATE ----------------------------------- */

  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [memberAttendance, setMemberAttendance] = useState([]);
  const [trainerAttendance, setTrainerAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------------------- TEMP LOAD -------------------------------- */

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trainersRes, memberAttRes, trainerAttRes] = await Promise.all([
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.Trainers),
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.TrainerMemberAttendance),
        axiosInterceptor.get(apiRoutes.Admin + apiRoutes.TrainerAttendance)
      ]);

      // Find current trainer from list (assuming one trainer per user)
      const currentTrainer = trainersRes.data[0];
      setUser(currentTrainer);
      setMemberAttendance(memberAttRes.data);
      setTrainerAttendance(trainerAttRes.data);

      // These would ideally come from a consolidated dashboard API
      // For now we'll set counts to 0 or placeholders if specific APIs aren't ready
      setMembers([]);
      setWorkoutPlans([]);
      setDietPlans([]);
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

  const todayTrainerRecord = trainerAttendance.find(r => isToday(parseISO(r.date)));
  const presentTodayCount = memberAttendance.filter(r => isToday(parseISO(r.date)) && r.status === 'present').length;

  /* ---------------------------- CALCULATIONS ----------------------------- */

  const assignedCount = members.length;
  const activeWorkouts = workoutPlans.filter(w => w.status === 'active').length;
  const activeDiets = dietPlans.filter(d => d.status === 'active').length;

  /* ---------------------------- UI --------------------------------------- */

  return (
    <DashboardLayout role="trainer" currentPage="TrainerDashboard" title="Trainer Dashboard">
      <div className="space-y-6">

        {/* Welcome Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <GlassCard className="lg:col-span-3 p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Welcome back, {user?.full_name || 'Trainer'}! 💪
                </h2>
                <p className="text-slate-400">
                  You have {activeWorkouts} active workout plans configured for your members today.
                </p>
              </div>
            </div>
          </GlassCard>

          {/* Trainer Attendance Card */}
          <GlassCard className={`p-6 flex flex-col justify-between transition-all ${todayTrainerRecord?.check_out ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-violet-500/30 bg-violet-500/5'
            }`}>
            <div className="flex justify-between items-start mb-2">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${todayTrainerRecord?.check_out ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                }`}>
                {todayTrainerRecord ? (todayTrainerRecord.check_out ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <Clock className="w-6 h-6 text-violet-400" />) : <UserCheck className="w-6 h-6 text-violet-400" />}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Attendance</p>
                <p className={`text-xs font-bold ${todayTrainerRecord?.check_out ? 'text-emerald-400' : 'text-violet-400'}`}>
                  {todayTrainerRecord ? (todayTrainerRecord.check_out ? 'DONE' : 'ACTIVE') : 'OFF'}
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                if (!todayTrainerRecord) handleTrainerAction('check-in');
                else if (!todayTrainerRecord.check_out) handleTrainerAction('check-out');
              }}
              disabled={todayTrainerRecord?.check_out}
              className={`w-full h-10 gap-2 rounded-xl text-sm font-bold transition-all shadow-lg ${todayTrainerRecord ? (todayTrainerRecord.check_out ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20') : 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/20'
                }`}
            >
              {todayTrainerRecord ? (todayTrainerRecord.check_out ? <CheckCircle className="w-4 h-4" /> : <LogOut className="w-4 h-4" />) : <LogIn className="w-4 h-4" />}
              {todayTrainerRecord ? (todayTrainerRecord.check_out ? 'Present' : 'Check Out') : 'Check In'}
            </Button>
          </GlassCard>
        </div>

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
            value={0}
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
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Weekly Engagement</h3>
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              Data fetching from API not yet implemented
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Member Goals Distribution</h3>
            <div className="h-[300px] flex items-center justify-center text-slate-500">
              Goals API not yet implemented
            </div>
          </GlassCard>
        </div>

        {/* Schedule & Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Sessions</h3>
            <div className="space-y-4">
              <div className="text-center py-6 text-slate-500 text-sm">No specific sessions defined. Check your assigned members for daily plans.</div>
            </div>
          </GlassCard>
        </div>

      </div>
    </DashboardLayout>
  );
}
