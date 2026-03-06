import React, { useState, useEffect } from 'react';
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
  Check,
  Search,
  Info
} from 'lucide-react';
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { toast } from 'sonner';

export default function MyDiet() {
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState([]);
  const [consumed, setConsumed] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    water: 0,
  });

  const waterGoal = 3.5;

  useEffect(() => {
    const fetchDietData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Diet Plan
        const planRes = await axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberDietPlans);
        let currentPlan = null;
        if (planRes.data && planRes.data.length > 0) {
          currentPlan = planRes.data[0];
          setDietPlan(currentPlan);
        }

        // 2. Fetch Daily Progress
        const progressRes = await axiosInterceptor.get(apiRoutes.Admin + apiRoutes.DailyProgress);
        const progress = progressRes.data;

        setConsumed(prev => ({
          ...prev,
          water: progress.water_consumed || 0
        }));

        if (currentPlan) {
          const completedMealNames = progress.completed_meals || [];
          const updatedMeals = currentPlan.meals.map((m, idx) => ({
            ...m,
            id: idx,
            consumed: completedMealNames.includes(m.name)
          }));
          setMeals(updatedMeals);
          calculateMacros(updatedMeals);
        }

      } catch (error) {
        console.error(error);
        toast.error("Failed to load diet data");
      } finally {
        setLoading(false);
      }
    };
    fetchDietData();
  }, []);

  const calculateMacros = (currentMeals) => {
    const total = currentMeals.reduce((acc, meal) => {
      if (meal.consumed) {
        acc.calories += (meal.calories || 0);
        acc.protein += (meal.protein || 0);
        acc.carbs += (meal.carbs || 0);
        acc.fat += (meal.fat || 0);
      }
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    setConsumed(prev => ({
      ...prev,
      ...total
    }));
  };

  if (loading) {
    return (
      <DashboardLayout role="member" currentPage="MyDiet" title="My Diet">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  /* ---------------- HANDLERS ---------------- */

  const markMealConsumed = async (mealId) => {
    const updatedMeals = meals.map((meal) => {
      if (meal.id === mealId && !meal.consumed) {
        return { ...meal, consumed: true };
      }
      return meal;
    });

    setMeals(updatedMeals);
    calculateMacros(updatedMeals);

    // Persist to backend
    try {
      const completedMealNames = updatedMeals
        .filter(m => m.consumed)
        .map(m => m.name);

      await axiosInterceptor.patch(apiRoutes.Admin + apiRoutes.DailyProgress, {
        completed_meals: completedMealNames
      });
    } catch (error) {
      console.error("Failed to save meal progress:", error);
    }
  };

  const addWater = async (amount) => {
    const newWater = Math.min(consumed.water + amount, waterGoal);
    setConsumed((c) => ({
      ...c,
      water: newWater,
    }));

    // Persist to backend
    try {
      await axiosInterceptor.patch(apiRoutes.Admin + apiRoutes.DailyProgress, {
        water_consumed: newWater
      });
    } catch (error) {
      console.error("Failed to save water progress:", error);
    }
  };

  /* ---------------- PROGRESS ---------------- */

  const caloriesProgress = dietPlan ? (consumed.calories / dietPlan.daily_calories) * 100 : 0;
  const proteinProgress = dietPlan ? (consumed.protein / dietPlan.protein_grams) * 100 : 0;
  const carbsProgress = dietPlan ? (consumed.carbs / dietPlan.carbs_grams) * 100 : 0;
  const fatProgress = dietPlan ? (consumed.fat / dietPlan.fat_grams) * 100 : 0;
  const waterProgress = (consumed.water / waterGoal) * 100;

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
          {dietPlan ? (
            <div>
              <h2 className="text-xl font-bold text-white">{dietPlan.name}</h2>
              <p className="text-sm text-slate-400">with {dietPlan.trainer_name}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-white">No Diet Plan</h2>
              <p className="text-sm text-slate-400">Consult your trainer for a plan</p>
            </div>
          )}
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
                {consumed.calories}/{dietPlan?.daily_calories || 0}
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
                {consumed.water}L/{waterGoal}L
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
                className={`p-4 rounded-xl ${meal.consumed
                  ? 'bg-emerald-500/10 border border-emerald-500/20'
                  : 'bg-slate-800/30'
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${meal.consumed ? 'bg-emerald-500/20' : 'bg-slate-700'
                      }`}>
                      <Utensils className={`w-5 h-5 ${meal.consumed ? 'text-emerald-400' : 'text-slate-400'
                        }`} />
                    </div>

                    <div>
                      <h4 className="text-white">{meal.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        {meal.description}
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
                      Mark Done
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            {meals.length === 0 && (
              <div className="p-12 text-center text-slate-500">
                No specific meals listed in this plan.
              </div>
            )}
          </div>
        </GlassCard>

        {dietPlan?.notes && (
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-violet-400" />
              <h3 className="text-lg font-semibold text-white">Trainer's Notes</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              {dietPlan.notes}
            </p>
          </GlassCard>
        )}

      </div>
    </DashboardLayout>
  );
}
