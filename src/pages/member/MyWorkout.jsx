import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dumbbell,
  Calendar,
  Clock,
  Play,
  CheckCircle2,
  ChevronRight,
  Flame
} from 'lucide-react';
import { format } from 'date-fns';
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { toast } from "sonner";

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MyWorkout() {
  const todayName = format(new Date(), 'EEEE');
  const [selectedDay, setSelectedDay] = useState(todayName);
  const [allPlans, setAllPlans] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchWorkoutPlan = async () => {
    try {
      const res = await axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberWorkoutPlans);
      if (res.data && res.data.length > 0) {
        setAllPlans(res.data);

        // Transform list of daily plans into day-based schedule
        const grouped = {};
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        days.forEach(day => grouped[day] = []);

        res.data.forEach(plan => {
          if (grouped[plan.day]) {
            grouped[plan.day] = (plan.exercises || []).map((ex, index) => ({
              ...ex,
              id: ex.id || `${plan.id}-${index}`,
              completed: false
            }));
          }
        });
        setSchedule(grouped);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load workout plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkoutPlan();
  }, []);

  const todayExercises = schedule[selectedDay] || [];
  const completedCount = todayExercises.filter(e => e.completed).length;
  const totalCount = todayExercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleExercise = (exerciseId) => {
    setSchedule(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(ex =>
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      )
    }));
  };

  if (loading) {
    return (
      <DashboardLayout role="member" currentPage="MyWorkout" title="My Workout">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const selectedPlan = allPlans.find(p => p.day === selectedDay);

  if (!allPlans.length) {
    return (
      <DashboardLayout role="member" currentPage="MyWorkout" title="My Workout">
        <GlassCard className="p-12 text-center">
          <Dumbbell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No Workout Plans Assigned</h2>
          <p className="text-slate-400">Ask your trainer to create a workout routine for you.</p>
        </GlassCard>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="member" currentPage="MyWorkout" title="My Workout">
      <div className="space-y-6">
        {/* Header Card */}
        <GlassCard className="p-6 relative overflow-hidden" delay={0}>
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-violet-500/20 to-purple-600/20 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {selectedPlan ? selectedPlan.name : "Rest Day"}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-400">
                    {selectedPlan ? `Status: ${selectedPlan.status}` : "Enjoy your rest!"}
                  </p>
                  {selectedPlan?.end_time && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-400 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>Finish by {selectedPlan.end_time}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-400">
              {selectedPlan && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {selectedPlan.start_date ? format(new Date(selectedPlan.start_date), 'MMM d') : 'N/A'} -
                    {selectedPlan.end_date ? format(new Date(selectedPlan.end_date), 'MMM d, yyyy') : 'Ongoing'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </GlassCard>

        {/* Day Selector */}
        <GlassCard className="p-4" delay={0.1}>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const isToday = day === todayName;
              const isSelected = day === selectedDay;
              return (
                <Button
                  key={day}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedDay(day)}
                  className={`flex-shrink-0 ${isSelected
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 border-0'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                >
                  {day.slice(0, 3)}
                  {isToday && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                </Button>
              );
            })}
          </div>
        </GlassCard>

        {/* Progress */}
        <GlassCard className="p-6" delay={0.2}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">{selectedDay}'s Progress</h3>
              <p className="text-sm text-slate-400">{completedCount} of {totalCount} exercises completed</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{Math.round(progress)}%</p>
            </div>
          </div>
          <Progress value={progress} className="h-3 bg-slate-700" />
        </GlassCard>

        {/* Exercises List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {todayExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GlassCard
                  className={`p-4 ${exercise.completed ? 'bg-emerald-500/5 border-emerald-500/20' : ''}`}
                  hover={!exercise.completed}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={exercise.completed}
                      onCheckedChange={() => toggleExercise(exercise.id)}
                      className="border-slate-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium ${exercise.completed ? 'text-emerald-400 line-through' : 'text-white'
                          }`}>
                          {exercise.name}
                        </h4>
                        {exercise.completed && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                      </div>
                      {exercise.sets > 0 && (
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-slate-400">
                            {exercise.sets} sets × {exercise.reps} reps
                          </span>
                          <span className="text-sm text-violet-400">{exercise.weight}</span>
                        </div>
                      )}
                    </div>
                    {!exercise.completed && exercise.sets > 0 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-violet-400 hover:text-violet-300"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Calories Burned */}
        <GlassCard className="p-6" delay={0.3}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-600/20">
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Estimated Calories</p>
                <p className="text-2xl font-bold text-white">450 kcal</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Duration</p>
              <div className="flex items-center gap-1 text-white">
                <Clock className="w-4 h-4" />
                <span className="font-medium">45 min</span>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
}
