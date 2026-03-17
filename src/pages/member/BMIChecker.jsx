import React, { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BMIChecker() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmiResult, setBmiResult] = useState(null);

  const calculateBMI = (e) => {
    e.preventDefault();
    if (height && weight) {
      // Calculate BMI: weight (kg) / (height (m) * height (m))
      const heightInMeters = parseFloat(height) / 100;
      const bmi = parseFloat(weight) / (heightInMeters * heightInMeters);
      
      let category = "";
      let color = "";
      let advice = "";

      if (bmi < 18.5) {
        category = "Underweight";
        color = "text-blue-400";
        advice = "You are considered underweight. Consult with your trainer for a bulking diet and muscle building plan.";
      } else if (bmi >= 18.5 && bmi < 24.9) {
        category = "Normal Weight";
        color = "text-emerald-400";
        advice = "Great job! You have a healthy body weight. Maintain your routine to stay fit.";
      } else if (bmi >= 25 && bmi < 29.9) {
        category = "Overweight";
        color = "text-amber-400";
        advice = "You are slightly overweight. Time to focus on a balanced diet and consistent cardio.";
      } else {
        category = "Obese";
        color = "text-rose-400";
        advice = "Your BMI falls in the obesity range. We highly recommend working closely with your trainer on a strict plan.";
      }

      setBmiResult({
        value: bmi.toFixed(1),
        category,
        color,
        advice,
      });
    }
  };

  const resetCalculator = () => {
    setHeight("");
    setWeight("");
    setBmiResult(null);
  };

  return (
    <DashboardLayout role="member" title="BMI Checker" currentPage="BMIChecker">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          {/* Header */}
          <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">BMI Checker</h2>
              <p className="text-sm text-slate-400 mt-1">
                Calculate your Body Mass Index to stay on track.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Calculator Card */}
            <GlassCard className="p-6 md:p-8 bg-[#0f172a]/80 shadow-2xl border-slate-800">
              <h3 className="text-xl font-semibold text-white mb-6">Enter Details</h3>
              
              <form onSubmit={calculateBMI} className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium ml-1">Height (cm)</Label>
                  <Input
                    type="number"
                    min="50"
                    max="300"
                    required
                    placeholder="e.g. 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white h-12 text-lg focus:ring-indigo-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300 font-medium ml-1">Weight (kg)</Label>
                  <Input
                    type="number"
                    min="20"
                    max="400"
                    required
                    placeholder="e.g. 70"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="bg-slate-900/50 border-slate-700 text-white h-12 text-lg focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    Calculate BMI
                  </Button>
                  {bmiResult && (
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={resetCalculator}
                      className="h-12 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                    >
                      Reset
                    </Button>
                  )}
                </div>
              </form>
            </GlassCard>

            {/* Results Display */}
            <div className="flex flex-col h-full">
              <AnimatePresence mode="wait">
                {bmiResult ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95, x: 20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95, x: -20 }}
                    className="flex-1"
                  >
                    <GlassCard className="p-8 h-full flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-800/50 to-[#0f172a]/80 border-slate-700 relative overflow-hidden">
                      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                      
                      <p className="text-slate-400 mb-2 font-medium uppercase tracking-widest text-sm">Your Result</p>
                      
                      <div className="my-6">
                        <span className="text-7xl font-black text-white drop-shadow-md tracking-tighter">
                          {bmiResult.value}
                        </span>
                      </div>

                      <div className={`px-5 py-2 rounded-full bg-slate-900/50 border border-slate-700/50 mb-6 font-bold text-lg ${bmiResult.color}`}>
                        {bmiResult.category}
                      </div>

                      <div className="max-w-xs">
                        <p className="text-slate-300 leading-relaxed text-[15px]">
                          {bmiResult.advice}
                        </p>
                      </div>
                    </GlassCard>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1"
                  >
                    <div className="h-full rounded-2xl border-2 border-dashed border-slate-800/60 bg-slate-900/20 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                      <Info className="w-12 h-12 mb-4 opacity-30" />
                      <p className="text-slate-400 max-w-[200px]">
                        Enter your height and weight and click calculate to see your BMI result.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </motion.div>
      </div>
    </DashboardLayout>
  );
}
