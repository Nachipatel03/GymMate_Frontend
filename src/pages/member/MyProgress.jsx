import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import StatCard from "@/components/ui/StatCard";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import {
    TrendingUp,
    TrendingDown,
    Target,
    Scale,
    Ruler,
    Dumbbell,
    Trophy,
    Save
} from "lucide-react";

/* -------------------- DATA -------------------- */

const weightData = [
    { name: "Jan", weight: 85 },
    { name: "Feb", weight: 83 },
    { name: "Mar", weight: 81 },
    { name: "Apr", weight: 79 },
    { name: "May", weight: 78 },
    { name: "Jun", weight: 76 },
];

const strengthData = [
    { name: "Jan", strength: 100 },
    { name: "Feb", strength: 120 },
    { name: "Mar", strength: 135 },
    { name: "Apr", strength: 150 },
    { name: "May", strength: 165 },
    { name: "Jun", strength: 180 },
];

const bodyMeasurements = [
    { name: "Chest", current: 42, start: 40, unit: "in" },
    { name: "Waist", current: 32, start: 36, unit: "in" },
    { name: "Arms", current: 15, start: 13.5, unit: "in" },
    { name: "Thighs", current: 24, start: 22, unit: "in" },
];

const achievements = [
    { id: 1, name: "10 Day Streak", icon: "🔥", earned: true, date: "Jan 15" },
    { id: 2, name: "First 5K Run", icon: "🏃", earned: true, date: "Feb 10" },
    { id: 3, name: "100 Workouts", icon: "💪", earned: true, date: "Mar 5" },
    { id: 4, name: "10 lbs Lost", icon: "⚖️", earned: true, date: "Apr 20" },
];

/* -------------------- COMPONENT -------------------- */

export default function MyProgress() {
    const [open, setOpen] = useState(false);

    /* ✅ FORM STATE */
    const [form, setForm] = useState({
        weight: "",
        chest: "",
        waist: "",
        arms: "",
        thighs: "",
        notes: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        console.log("Form Data:", form);
        // TODO: API call here
        setOpen(false);
        setForm({
            weight: "",
            chest: "",
            waist: "",
            arms: "",
            thighs: "",
            notes: ""
        });
    };

    const startWeight = 85;
    const currentWeight = 76;
    const goalWeight = 72;

    const weightLost = startWeight - currentWeight;
    const weightToGo = currentWeight - goalWeight;
    const progressPercent =
        ((startWeight - currentWeight) / (startWeight - goalWeight)) * 100;

    return (
        <DashboardLayout role="member" currentPage="MyProgress" title="My Progress">
            <div className="space-y-6">

                {/* HEADER */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">My Progress</h2>
                        <p className="text-sm text-slate-400">
                            Track your fitness improvements over time
                        </p>
                    </div>
                    <Button
                        onClick={() => setOpen(true)}
                        className="bg-gradient-to-r from-violet-500 to-purple-600"
                    >
                        Add Today’s Progress
                    </Button>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Weight Lost" value={`${weightLost} kg`} icon={Scale} />
                    <StatCard title="Current Weight" value={`${currentWeight} kg`} icon={TrendingDown} />
                    <StatCard title="Goal Weight" value={`${goalWeight} kg`} icon={Target} />
                    <StatCard title="Workouts Done" value="127" icon={Dumbbell} />
                </div>

                {/* GOAL */}
                <GlassCard className="p-6">
                    <Progress value={progressPercent} className="h-4 bg-slate-700" />
                </GlassCard>
            </div>

            {/* MODAL */}
            <AnimatePresence>
                {open && (
                    <motion.div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-md"
                            onClick={() => setOpen(false)}
                        />

                        <motion.div className="relative z-10 w-full max-w-3xl">
                            <GlassCard className="p-6 space-y-6">
                                <h2 className="text-xl font-semibold text-white">
                                    Update Today’s Progress
                                </h2>


                                {/* Weight */}
                                <div>
                                    <label className="text-sm text-slate-300 flex items-center gap-2 mb-1">
                                        <Scale className="w-4 h-4 text-emerald-400" />
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={form.weight}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                        placeholder="e.g. 76"
                                    />
                                </div>

                                {/* Measurements */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {["chest", "waist", "arms", "thighs"].map((field) => (
                                        <div key={field}>
                                            <label className="text-sm text-slate-300 flex items-center gap-2 mb-1">
                                                <Ruler className="w-4 h-4 text-cyan-400" />
                                                {field.charAt(0).toUpperCase() + field.slice(1)} (inch)
                                            </label>
                                            <input
                                                type="number"
                                                name={field}
                                                value={form[field]}
                                                onChange={handleChange}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="text-sm text-slate-300 mb-1 block">
                                        Notes (optional)
                                    </label>
                                    <textarea
                                        name="notes"
                                        value={form.notes}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                        placeholder="How did you feel today?"
                                    />
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSubmit}>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Progress
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
}
