import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/Layout/DashboardLayout";
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
    Save,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { format, parseISO } from "date-fns";

/* -------------------- COMPONENT -------------------- */

export default function MyProgress() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [progressLogs, setProgressLogs] = useState([]);
    const [profile, setProfile] = useState(null);

    /* ✅ FORM STATE */
    const [form, setForm] = useState({
        weight: "",
        chest: "",
        waist: "",
        arms: "",
        thighs: "",
        notes: ""
    });

    const fetchProgress = async () => {
        try {
            const [logsRes, profileRes] = await Promise.all([
                axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberProgress),
                axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberProfile)
            ]);
            setProgressLogs(logsRes.data);
            setProfile(profileRes.data);
        } catch (error) {
            toast.error("Failed to load progress data");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchProgress();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async () => {
        if (!form.weight) {
            toast.error("Weight is required");
            return;
        }

        try {
            const payload = {
                weight: parseFloat(form.weight),
                notes: form.notes,
                measurements: {
                    chest: form.chest,
                    waist: form.waist,
                    arms: form.arms,
                    thighs: form.thighs
                }
            };
            await axiosInterceptor.post(apiRoutes.Admin + apiRoutes.MemberProgress, payload);
            toast.success("Progress updated!");
            setOpen(false);
            setForm({
                weight: "",
                chest: "",
                waist: "",
                arms: "",
                thighs: "",
                notes: ""
            });
            fetchProgress();
        } catch (error) {
            toast.error("Failed to save progress");
        }
    };

    // For the chart, we only want one point per day to keep the X-axis clean
    const chartData = (() => {
        const uniqueDays = {};
        progressLogs.forEach(log => {
            const dayKey = format(parseISO(log.date), 'yyyy-MM-dd');
            uniqueDays[dayKey] = {
                date: log.date,
                weight: log.weight
            };
        });

        return Object.values(uniqueDays)
            .map(p => ({
                name: format(parseISO(p.date), 'MMM d, yyyy'),
                weight: p.weight,
                rawDate: p.date
            }))
            .sort((a, b) => parseISO(a.rawDate).getTime() - parseISO(b.rawDate).getTime());
    })();

    const currentWeight = progressLogs.length > 0 ? progressLogs[progressLogs.length - 1].weight : (profile?.weight || 0);
    const startWeight = progressLogs.length > 0 ? progressLogs[0].weight : (profile?.weight || 0);
    const goalWeight = profile?.goal_weight || 70;

    const weightLost = (startWeight - currentWeight).toFixed(1);

    // Calculate progress based on whether the goal is to lose or gain weight
    const calculateProgress = () => {
        if (startWeight === goalWeight) return 100;

        const totalToChange = goalWeight - startWeight;
        const totalChanged = currentWeight - startWeight;

        // (totalChanged / totalToChange) * 100
        const percent = (totalChanged / totalToChange) * 100;
        return Math.min(100, Math.max(0, percent));
    };

    const progressPercent = calculateProgress();

    if (loading) {
        return (
            <DashboardLayout role="member" currentPage="MyProgress" title="My Progress">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

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
                    <StatCard title="Logs Count" value={progressLogs.length.toString()} icon={Dumbbell} />
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <GlassCard title="Weight Trend" className="p-6">
                        <div className="h-[300px]">
                            <AreaChartComponent data={chartData} dataKey="weight" />
                        </div>
                    </GlassCard>

                    <GlassCard title="Goal Progress" className="p-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-slate-400">Target Progress</p>
                                    <h4 className="text-2xl font-bold text-white">{progressPercent.toFixed(1)}%</h4>
                                </div>
                                <Trophy className="w-8 h-8 text-yellow-500" />
                            </div>
                            <Progress value={progressPercent} className="h-4 bg-slate-700" />
                            <p className="text-xs text-slate-400">
                                {weightLost}kg lost so far. Keep going!
                            </p>
                        </div>
                    </GlassCard>
                </div> {/* End of 2-column Grid */}

                {/* PROGRESS LOGS TABLE */}
                <GlassCard title="Progress History" className="p-6 overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="border-b border-slate-700 text-slate-400 text-sm">
                                <th className="pb-3 px-2 font-medium">Date</th>
                                <th className="pb-3 px-2 font-medium">Weight (kg)</th>
                                <th className="pb-3 px-2 font-medium">Chest (")</th>
                                <th className="pb-3 px-2 font-medium">Waist (")</th>
                                <th className="pb-3 px-2 font-medium">Arms (")</th>
                                <th className="pb-3 px-2 font-medium">Notes</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-200">
                            {progressLogs.length > 0 ? (
                                [...progressLogs].reverse().map((log) => (
                                    <tr key={log.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="py-4 px-2 text-sm text-violet-400 font-medium">
                                            {format(parseISO(log.date), 'MMM d, yyyy')}
                                        </td>
                                        <td className="py-4 px-2 text-sm font-semibold">{log.weight}</td>
                                        <td className="py-4 px-2 text-sm text-slate-400">{log.measurements?.chest || '-'}</td>
                                        <td className="py-4 px-2 text-sm text-slate-400">{log.measurements?.waist || '-'}</td>
                                        <td className="py-4 px-2 text-sm text-slate-400">{log.measurements?.arms || '-'}</td>
                                        <td className="py-4 px-2 text-sm text-slate-500 max-w-[200px] truncate" title={log.notes}>
                                            {log.notes || '-'}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-8 text-center text-slate-500 italic">
                                        No progress logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </GlassCard>
            </div> {/* End of space-y-6 */}

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
