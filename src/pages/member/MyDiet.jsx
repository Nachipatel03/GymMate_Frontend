import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import DonutChart from '@/components/charts/DonutChart';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import {
  Apple,
  Clock,
  Droplets,
  Flame,
  Coffee,
  Sun,
  Moon,
  Utensils,
  Check
} from 'lucide-react';

/* ---------------- DIET PLAN ---------------- */

const myDietPlan = {
  name: 'Muscle Building Nutrition',
  trainer: 'Coach Mike',
  dailyGoals: {
    calories: 2800,
    protein: 180,
    carbs: 320,
    fat: 80,
    water: 3.5,
  },
  meals: [
    {
      id: 1,
      name: 'Breakfast',
      time: '07:00 AM',
      icon: Coffee,
      calories: 600,
      macros: { protein: 30, carbs: 70, fat: 15 },
      consumed: false,
      foods: ['Oatmeal', 'Eggs', 'Banana'],
    },
    {
      id: 2,
      name: 'Morning Snack',
      time: '10:00 AM',
      icon: Apple,
      calories: 250,
      macros: { protein: 25, carbs: 20, fat: 10 },
      consumed: false,
      foods: ['Protein Shake', 'Almonds'],
    },
    {
      id: 3,
      name: 'Lunch',
      time: '01:00 PM',
      icon: Sun,
      calories: 800,
      macros: { protein: 45, carbs: 90, fat: 20 },
      consumed: false,
      foods: ['Chicken', 'Rice', 'Vegetables'],
    },
    {
      id: 4,
      name: 'Dinner',
      time: '07:00 PM',
      icon: Moon,
      calories: 750,
      macros: { protein: 50, carbs: 60, fat: 25 },
      consumed: false,
      foods: ['Salmon', 'Sweet Potato', 'Broccoli'],
    },
    {
      id: 5,
      name: 'Evening Snack',
      time: '09:00 PM',
      icon: Utensils,
      calories: 200,
      macros: { protein: 30, carbs: 10, fat: 8 },
      consumed: false,
      foods: ['Casein Protein', 'Peanut Butter'],
    },
  ],
};

/* ---------------- COMPONENT ---------------- */

export default function MyDiet() {
  const { dailyGoals } = myDietPlan;

  const [meals, setMeals] = useState(myDietPlan.meals);
  const [consumed, setConsumed] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
  });

  /* ---------------- HANDLERS ---------------- */

  const markMealConsumed = (mealId) => {
    setMeals((prev) =>
      prev.map((meal) => {
        if (meal.id === mealId && !meal.consumed) {
          setConsumed((c) => ({
            calories: c.calories + meal.calories,
            protein: c.protein + meal.macros.protein,
            carbs: c.carbs + meal.macros.carbs,
            fat: c.fat + meal.macros.fat,
            water: c.water,
          }));
          return { ...meal, consumed: true };
        }
        return meal;
      })
    );
  };

  const addWater = (amount) => {
    setConsumed((c) => ({
      ...c,
      water: Math.min(c.water + amount, dailyGoals.water),
    }));
  };

  /* ---------------- PROGRESS ---------------- */

  const caloriesProgress = (consumed.calories / dailyGoals.calories) * 100;
  const proteinProgress = (consumed.protein / dailyGoals.protein) * 100;
  const carbsProgress = (consumed.carbs / dailyGoals.carbs) * 100;
  const fatProgress = (consumed.fat / dailyGoals.fat) * 100;
  const waterProgress = (consumed.water / dailyGoals.water) * 100;

  const macroData = [
    { name: 'Protein', value: consumed.protein, color: '#8b5cf6' },
    { name: 'Carbs', value: consumed.carbs, color: '#06b6d4' },
    { name: 'Fat', value: consumed.fat, color: '#f59e0b' },
  ];

  /* ---------------- UI ---------------- */

  return (
    <DashboardLayout role="member" currentPage="MyDiet" title="My Diet">
      <div className="space-y-6">

        {/* Header */}
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600">
            <Apple className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{myDietPlan.name}</h2>
            <p className="text-sm text-slate-400">with {myDietPlan.trainer}</p>
          </div>
        </GlassCard>

        {/* Calories & Water */}
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-slate-300">Calories</span>
              </div>
              <span className="text-slate-400">
                {consumed.calories}/{dailyGoals.calories}
              </span>
            </div>
            <Progress value={caloriesProgress} />
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-2">
                <Droplets className="w-5 h-5 text-cyan-400" />
                <span className="text-slate-300">Water</span>
              </div>
              <span className="text-slate-400">
                {consumed.water}L/{dailyGoals.water}L
              </span>
            </div>
            <Progress value={waterProgress} />
            <div className="flex gap-2 mt-3">
              {[0.25, 0.5, 1].map((w) => (
                <button
                  key={w}
                  onClick={() => addWater(w)}
                  className="px-3 py-1 text-xs rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30"
                >
                  +{w}L
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Macros */}
        <div className="grid lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Macros</h3>
            <DonutChart data={macroData} height={200} />
          </GlassCard>

          <GlassCard className="p-6 space-y-4">
            <div>
              <span className="text-violet-400">Protein</span>
              <Progress value={proteinProgress} />
            </div>
            <div>
              <span className="text-cyan-400">Carbs</span>
              <Progress value={carbsProgress} />
            </div>
            <div>
              <span className="text-amber-400">Fat</span>
              <Progress value={fatProgress} />
            </div>
          </GlassCard>
        </div>

        {/* Meals */}
        <GlassCard>
          <div className="p-6 border-b border-slate-700">
            <h3 className="text-lg text-white">Today's Meals</h3>
          </div>

          <div className="p-4 space-y-3">
            {meals.map((meal, index) => (
              <motion.div
                key={meal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl ${
                  meal.consumed
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-slate-800/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${
                      meal.consumed ? 'bg-emerald-500/20' : 'bg-slate-700'
                    }`}>
                      <meal.icon className={`w-5 h-5 ${
                        meal.consumed ? 'text-emerald-400' : 'text-slate-400'
                      }`} />
                    </div>

                    <div>
                      <h4 className="text-white">{meal.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-3 h-3" />
                        {meal.time} • {meal.calories} cal
                      </div>
                    </div>
                  </div>

                  {meal.consumed ? (
                    <div className="flex items-center gap-1 text-emerald-400">
                      <Check className="w-4 h-4" />
                      Done
                    </div>
                  ) : (
                    <button
                      onClick={() => markMealConsumed(meal.id)}
                      className="text-sm text-violet-400 hover:text-violet-300"
                    >
                      Mark eaten
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>

      </div>
    </DashboardLayout>
  );
}
