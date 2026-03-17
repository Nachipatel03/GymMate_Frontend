import React from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
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
  Trophy,
  LogIn,
  LogOut,
  CheckCircle,
  UserCheck,
  Info,
  Scale
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { toast } from 'sonner';

// Dashboard Component
export default function MemberDashboard() {
  const [workoutPlan, setWorkoutPlan] = React.useState(null);
  const [allPlans, setAllPlans] = React.useState([]);
  const [dietPlan, setDietPlan] = React.useState(null);
  const [todayExercises, setTodayExercises] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [todayAttendance, setTodayAttendance] = React.useState(null);

  const [progressData, setProgressData] = React.useState([]);
  const [profile, setProfile] = React.useState(null);

  const membershipEnd = profile?.active_membership?.end_date ? parseISO(profile.active_membership.end_date) : null;
  const daysRemaining = membershipEnd ? differenceInDays(membershipEnd, new Date()) : 0;
  const memberName = profile?.full_name || 'Member';

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [planRes, attRes, dietRes, profileRes, progressRes] = await Promise.all([
          axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberWorkoutPlans),
          axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberAttendance),
          axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberDietPlans),
          axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberProfile),
          axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberProgress)
        ]);

        setProfile(profileRes.data);
        if (progressRes.data) {
          const uniqueDays = {}; // Use an object to store unique days, overwriting if a later entry for the same day exists

          progressRes.data.forEach(p => {
            const dayKey = format(parseISO(p.date), 'yyyy-MM-dd');
            uniqueDays[dayKey] = {
              date: p.date, // Keep raw date for sorting
              weight: p.weight
            };
          });

          // Final sorting to be absolutely sure it's chronological for the chart
          const sortedData = Object.values(uniqueDays)
            .map(p => ({
              name: format(parseISO(p.date), 'MMM d, yyyy'),
              weight: p.weight,
              rawDate: p.date
            }))
            .sort((a, b) => parseISO(a.rawDate).getTime() - parseISO(b.rawDate).getTime());

          setProgressData(sortedData);
        }

        if (planRes.data && planRes.data.length > 0) {
          setAllPlans(planRes.data);
          const todayName = format(new Date(), 'EEEE');
          const planToday = planRes.data.find(p => p.day === todayName);

          if (planToday) {
            setWorkoutPlan(planToday);
            setTodayExercises(planToday.exercises || []);
          } else {
            setWorkoutPlan(null);
            setTodayExercises([]);
          }
        }

        const todayRecord = attRes.data.find(r => format(parseISO(r.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
        setTodayAttendance(todayRecord);

        if (dietRes.data && dietRes.data.length > 0) {
          setDietPlan(dietRes.data[0]); // Show the first active plan
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const handleAttendanceAction = async (action) => {
    try {
      const res = await axiosInterceptor.post(apiRoutes.Admin + apiRoutes.MemberAttendance, { action });
      toast.success(res.data.message);
      // Refresh only attendance
      const attRes = await axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberAttendance);
      const todayRecord = attRes.data.find(r => format(parseISO(r.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'));
      setTodayAttendance(todayRecord);
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  // Calculate accurate membership progress
  const calculateMembershipPercent = () => {
    if (!profile?.active_membership?.start_date || !profile?.active_membership?.end_date) return 0;
    const start = parseISO(profile.active_membership.start_date);
    const end = parseISO(profile.active_membership.end_date);
    const today = new Date();

    if (today < start) return 0;
    if (today > end) return 100;

    const totalDays = differenceInDays(end, start);
    const elapsedDays = differenceInDays(today, start);

    return totalDays > 0 ? (elapsedDays / totalDays) * 100 : 100;
  };

  // Calculate attendance streak
  const [attendanceStreak, setAttendanceStreak] = React.useState(0);

  React.useEffect(() => {
    if (profile?.attendance_streak !== undefined) {
      setAttendanceStreak(profile.attendance_streak || 0);
    }
  }, [profile]);

  const handleToggleExercise = async (exerciseIdx) => {
    if (!workoutPlan) return;
    try {
      await axiosInterceptor.post(apiRoutes.Admin + apiRoutes.MemberWorkoutPlans, {
        plan_id: workoutPlan.id,
        exercise_index: exerciseIdx
      });

      setTodayExercises(prev => prev.map((ex, i) =>
        i === exerciseIdx ? { ...ex, completed: !ex.completed } : ex
      ));

      toast.success("Exercise updated");
    } catch (error) {
      toast.error("Failed to update exercise");
    }
  };

  const completedCount = todayExercises.filter(e => e.completed).length;
  const workoutProgress = todayExercises.length > 0 ? (completedCount / todayExercises.length) * 100 : 0;

  const membershipProgress = calculateMembershipPercent();

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
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-400">Let's crush today's goals</p>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <p className="text-xs font-medium text-violet-400">
                      Trainer: {profile?.assigned_trainer_name || 'Not Assigned'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/20">
                  <Trophy className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">{attendanceStreak} Day Streak</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/20">
                  <Scale className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-violet-400">{progressData.length} Logs Saved</span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* New Prominent Attendance Card */}
          <GlassCard className={`p-6 flex flex-col justify-between transition-all ${todayAttendance?.check_out ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-violet-500/30 bg-violet-500/5'
            }`}>
            <div className="flex justify-between items-start mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${todayAttendance?.check_out ? 'bg-emerald-500/20' : 'bg-violet-500/20'
                }`}>
                {todayAttendance ? (todayAttendance.check_out ? <CheckCircle className="w-6 h-6 text-emerald-400" /> : <Clock className="w-6 h-6 text-violet-400" />) : <UserCheck className="w-6 h-6 text-violet-400" />}
              </div>
              <StatusBadge status={todayAttendance ? (todayAttendance.check_out ? 'present' : 'pending') : 'absent'} />
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-white leading-tight">
                {todayAttendance ? (todayAttendance.check_out ? 'Workout Done!' : 'Checked In') : 'Session Ready'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {todayAttendance ? (todayAttendance.check_out ? 'Great job today' : 'Ongoing session') : 'Start tracking now'}
              </p>
            </div>

            <Button
              onClick={() => {
                if (!todayAttendance) handleAttendanceAction('check-in');
                else if (!todayAttendance.check_out) handleAttendanceAction('check-out');
              }}
              disabled={todayAttendance?.check_out}
              className={`w-full h-10 gap-2 rounded-xl text-sm font-bold transition-all ${todayAttendance ? (todayAttendance.check_out ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20') : 'bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20'
                }`}
            >
              {todayAttendance ? (todayAttendance.check_out ? <CheckCircle className="w-4 h-4" /> : <LogOut className="w-4 h-4" />) : <LogIn className="w-4 h-4" />}
              {todayAttendance ? (todayAttendance.check_out ? 'Finished' : 'Check Out') : 'Check In'}
            </Button>
          </GlassCard>

          {/* Membership */}
          <GlassCard className="p-6">
            <div className="flex justify-between mb-4">
              <h3 className="text-sm text-slate-400">Membership</h3>
              <StatusBadge status={profile?.active_membership?.status || 'inactive'} />
            </div>
            {profile?.active_membership ? (
              <>
                <div className="text-3xl font-bold text-white">{daysRemaining > 0 ? daysRemaining : 0}</div>
                <p className="text-sm text-slate-400">Days remaining</p>
                <Progress value={membershipProgress} className="mt-4 h-2" />
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-amber-400 font-bold mb-2">No Active Plan</p>
                <p className="text-xs text-slate-500 mb-3">Subscribe to a plan to start your journey.</p>
                <Button
                  onClick={() => window.location.href = '/memberplans'}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 text-xs py-1 h-8 px-4"
                >
                  View Plans
                </Button>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Workout Progress */}
        <GlassCard>
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg text-white">
              {workoutPlan ? workoutPlan.name : (allPlans.length > 0 ? "Rest Day" : "No Workout Plan Assigned")}
            </h3>
            {workoutPlan && <Progress value={workoutProgress} className="mt-4 h-2 transition-all duration-500" />}
          </div>

          <div className="p-4 space-y-2">
            {todayExercises.length > 0 ? (
              todayExercises.map((exercise, i) => (
                <div
                  key={i}
                  onClick={() => handleToggleExercise(i)}
                  className={`flex justify-between p-4 rounded-xl cursor-pointer transition-all border ${exercise.completed
                    ? 'bg-emerald-500/10 border-emerald-500/20'
                    : 'bg-slate-800/40 border-transparent hover:border-slate-600'
                    }`}
                >
                  <div className="flex flex-col">
                    <span className={`font-medium ${exercise.completed ? 'text-emerald-400 line-through' : 'text-white'}`}>
                      {exercise.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      {exercise.sets} sets × {exercise.reps} reps
                    </span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${exercise.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600'
                    }`}>
                    {exercise.completed && <CheckCircle className="w-4 h-4 text-white" />}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                {workoutPlan ? "No exercises scheduled for today." : "Consult your trainer for a plan."}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Body Progress</h3>
            {progressData.length > 0 ? (
              <div className="h-[250px]">
                <AreaChartComponent data={progressData} dataKey="weight" />
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-slate-500">
                No progress data available yet. Start logging your weight!
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Daily Nutrition</h3>
            {dietPlan ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Flame className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{dietPlan.daily_calories}</p>
                      <p className="text-xs text-slate-400">Daily Calories (by {dietPlan.trainer_name})</p>
                    </div>
                  </div>
                  <StatusBadge status={dietPlan.status} />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-center">
                    <p className="text-lg font-bold text-violet-400">{dietPlan.protein_grams}g</p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Protein</p>
                  </div>
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                    <p className="text-lg font-bold text-cyan-400">{dietPlan.carbs_grams}g</p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Carbs</p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                    <p className="text-lg font-bold text-amber-400">{dietPlan.fat_grams}g</p>
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Fat</p>
                  </div>
                </div>

                {dietPlan.meals && dietPlan.meals.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <p className="text-sm font-semibold text-white px-1">Meal Schedule</p>
                    {dietPlan.meals.map((meal, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <p className="text-sm font-medium text-emerald-400">{meal.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{meal.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {dietPlan.notes && (
                  <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 flex gap-2">
                    <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-400">{dietPlan.notes}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <Apple className="w-6 h-6 text-slate-600" />
                </div>
                <p className="text-sm text-slate-500">No diet plan assigned yet.<br />Contact your trainer for nutrition advice.</p>
              </div>
            )}
          </GlassCard>
        </div>

      </div>
    </DashboardLayout>
  );
}
