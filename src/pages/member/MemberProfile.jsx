import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    User,
    Phone,
    Mail,
    Target,
    Ruler,
    Scale,
    Save,
    Loader2,
    Camera,
    CreditCard,
    Calendar,
    Clock
} from "lucide-react";
import { toast } from "sonner";
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function MemberProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        phone: "",
        goal: "",
        height: "",
        weight: "",
        goal_weight: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberProfile);
                setProfile({
                    ...res.data,
                    height: res.data.height || "",
                    weight: res.data.weight || "",
                    goal_weight: res.data.goal_weight || "",
                });
            } catch (error) {
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axiosInterceptor.patch(
                apiRoutes.Admin + apiRoutes.MemberProfile,
                profile
            );
            setProfile(res.data);
            toast.success("Profile updated successfully");

            // Update local storage user if name changed
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({
                ...storedUser,
                username: res.data.full_name
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="member" title="My Profile" currentPage="Profile">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="member" title="My Profile" currentPage="Profile">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Profile Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                >
                    <GlassCard className="p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32" />

                        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-violet-500/20">
                                    {profile.full_name?.charAt(0) || "U"}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="text-center md:text-left">
                                <h2 className="text-3xl font-bold text-white mb-2">{profile.full_name}</h2>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{profile.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                        <Target className="w-4 h-4 text-violet-400" />
                                        <span className="text-sm capitalize">{profile.goal?.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>


                {/* Edit Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <form onSubmit={handleSubmit}>
                        <GlassCard className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Basic Info */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-violet-400" />
                                        Personal Information
                                    </h3>

                                    <div className="space-y-2">
                                        <Label htmlFor="full_name" className="text-slate-400">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input
                                                id="full_name"
                                                value={profile.full_name}
                                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                                className="bg-slate-900/50 border-slate-700 pl-10 text-white focus:ring-violet-500"
                                                placeholder="Your full name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-slate-400">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input
                                                id="phone"
                                                value={profile.phone}
                                                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                                className="bg-slate-900/50 border-slate-700 pl-10 text-white focus:ring-violet-500"
                                                placeholder="+1 234 567 890"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="goal" className="text-slate-400">Fitness Goal</Label>
                                        <div className="relative">
                                            <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <select
                                                id="goal"
                                                value={profile.goal}
                                                onChange={(e) => setProfile({ ...profile, goal: e.target.value })}
                                                className="w-full bg-slate-900/50 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-white focus:ring-violet-500 focus:outline-none appearance-none"
                                            >
                                                <option value="weight_loss">Weight Loss</option>
                                                <option value="muscle_gain">Muscle Gain</option>
                                                <option value="maintenance">Maintenance</option>
                                                <option value="endurance">Endurance</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Body Metrics */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                        <Scale className="w-5 h-5 text-violet-400" />
                                        Body Metrics
                                    </h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="height" className="text-slate-400">Height (cm)</Label>
                                            <div className="relative">
                                                <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <Input
                                                    id="height"
                                                    type="number"
                                                    step="0.1"
                                                    value={profile.height}
                                                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                                                    className="bg-slate-900/50 border-slate-700 pl-10 text-white focus:ring-violet-500"
                                                    placeholder="175"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="weight" className="text-slate-400">Weight (kg)</Label>
                                            <div className="relative">
                                                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <Input
                                                    id="weight"
                                                    type="number"
                                                    step="0.1"
                                                    value={profile.weight}
                                                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                                                    className="bg-slate-900/50 border-slate-700 pl-10 text-white focus:ring-violet-500"
                                                    placeholder="70"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="goal_weight" className="text-slate-400">Target Weight (kg)</Label>
                                            <div className="relative">
                                                <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                                <Input
                                                    id="goal_weight"
                                                    type="number"
                                                    step="0.1"
                                                    value={profile.goal_weight}
                                                    onChange={(e) => setProfile({ ...profile, goal_weight: e.target.value })}
                                                    className="bg-slate-900/50 border-slate-700 pl-10 text-white focus:ring-violet-500"
                                                    placeholder="65"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm">
                                        Keep your height and weight updated for more accurate workout and diet recommendations.
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-700/50">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white px-8 h-12 rounded-xl transition-all duration-300 shadow-lg shadow-violet-500/20 active:scale-95"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Saving Changes...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4 mr-2" />
                                            Save Profile
                                        </>
                                    )}
                                </Button>
                            </div>
                        </GlassCard>
                    </form>
                </motion.div>

            </div>
        </DashboardLayout>
    );
}
