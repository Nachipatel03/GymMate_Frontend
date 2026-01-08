import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
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

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const myWorkoutPlan = {
  name: 'Full Body Transformation',
  trainer: 'Coach Mike',
  startDate: '2024-01-01',
  endDate: '2024-03-31',
  schedule: {
    Monday: [
      { id: 1, name: 'Bench Press', sets: 4, reps: 10, weight: '135 lbs', completed: true },
      { id: 2, name: 'Incline Dumbbell Press', sets: 3, reps: 12, weight: '50 lbs', completed: true },
      { id: 3, name: 'Shoulder Press', sets: 3, reps: 12, weight: '40 lbs', completed: false },
      { id: 4, name: 'Lateral Raises', sets: 3, reps: 15, weight: '20 lbs', completed: false },
    ],
    Tuesday: [
      { id: 5, name: 'Squats', sets: 4, reps: 10, weight: '185 lbs', completed: false },
      { id: 6, name: 'Leg Press', sets: 4, reps: 12, weight: '300 lbs', completed: false },
      { id: 7, name: 'Leg Curls', sets: 3, reps: 12, weight: '80 lbs', completed: false },
      { id: 8, name: 'Calf Raises', sets: 4, reps: 15, weight: '120 lbs', completed: false },
    ],
    Wednesday: [
      { id: 9, name: 'Pull-ups', sets: 4, reps: 8, weight: 'Bodyweight', completed: false },
      { id: 10, name: 'Bent Over Rows', sets: 4, reps: 10, weight: '135 lbs', completed: false },
      { id: 11, name: 'Bicep Curls', sets: 3, reps: 12, weight: '35 lbs', completed: false },
    ],
    Thursday: [
      { id: 12, name: 'Rest Day', sets: 0, reps: 0, weight: '-', completed: false },
    ],
    Friday: [
      { id: 13, name: 'Deadlifts', sets: 4, reps: 8, weight: '225 lbs', completed: false },
      { id: 14, name: 'Romanian Deadlifts', sets: 3, reps: 12, weight: '135 lbs', completed: false },
      { id: 15, name: 'Core Circuit', sets: 3, reps: 20, weight: 'Bodyweight', completed: false },
    ],
    Saturday: [
      { id: 16, name: 'HIIT Cardio', sets: 1, reps: 30, weight: 'mins', completed: false },
    ],
    Sunday: [
      { id: 17, name: 'Rest Day', sets: 0, reps: 0, weight: '-', completed: false },
    ],
  }
};

export default function MyWorkout() {
  const todayName = format(new Date(), 'EEEE');
  const [selectedDay, setSelectedDay] = useState(todayName);
  const [exercises, setExercises] = useState(myWorkoutPlan.schedule);

  const todayExercises = exercises[selectedDay] || [];
  const completedCount = todayExercises.filter(e => e.completed).length;
  const totalCount = todayExercises.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const toggleExercise = (exerciseId) => {
    setExercises(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(ex => 
        ex.id === exerciseId ? { ...ex, completed: !ex.completed } : ex
      )
    }));
  };

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
                <h2 className="text-xl font-bold text-white">{myWorkoutPlan.name}</h2>
                <p className="text-sm text-slate-400">with {myWorkoutPlan.trainer}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(myWorkoutPlan.startDate), 'MMM d')} - {format(new Date(myWorkoutPlan.endDate), 'MMM d, yyyy')}</span>
              </div>
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
                  className={`flex-shrink-0 ${
                    isSelected 
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
          <AnimatePresence mode="wait">
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
                        <h4 className={`font-medium ${
                          exercise.completed ? 'text-emerald-400 line-through' : 'text-white'
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