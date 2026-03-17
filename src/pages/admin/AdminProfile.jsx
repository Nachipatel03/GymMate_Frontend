import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Save, Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { motion } from "framer-motion";

export default function AdminProfile() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState({
        full_name: "",
        email: "",
        phone: "",
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosInterceptor.get(apiRoutes.Auth + apiRoutes.AdminProfile);
                setProfile({
                    full_name: res.data.full_name || "",
                    email: res.data.email || "",
                    phone: res.data.phone || "",
                });
            } catch (error) {
                toast.error("Failed to load admin profile");
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
                apiRoutes.Auth + apiRoutes.AdminProfile,
                { username: profile.full_name, email: profile.email, phone: profile.phone }
            );
            setProfile({
                full_name: res.data.full_name || "",
                email: res.data.email || "",
                phone: res.data.phone || "",
            });
            toast.success("Profile updated successfully");

            // Update local storage user if name changed to reflect in Navbar immediately
            const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
            localStorage.setItem("user", JSON.stringify({
                ...storedUser,
                username: res.data.full_name,
                email: res.data.email
            }));
            // Dispatch a custom event to notify Navbar of user change
            window.dispatchEvent(new Event('userProfileUpdated'));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update admin profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="admin" title="Admin Profile" currentPage="Profile">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin" title="Admin Profile" currentPage="Profile">
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
                                    {profile.full_name?.charAt(0) || "A"}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-400 hover:text-white transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                                    <h2 className="text-3xl font-bold text-white">{profile.full_name}</h2>
                                    <span className="bg-violet-500/20 text-violet-400 text-xs px-2 py-1 rounded border border-violet-500/30 uppercase tracking-widest font-semibold">Admin</span>
                                </div>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
                                        <Mail className="w-4 h-4" />
                                        <span className="text-sm">{profile.email}</span>
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
                                        <Label htmlFor="full_name" className="text-slate-400">Username / Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input
                                                id="full_name"
                                                value={profile.full_name}
                                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                                className="bg-slate-900/50 border-slate-700 pl-10 text-white focus:ring-violet-500"
                                                placeholder="Admin Name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-slate-400">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={profile.email}
                                                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                                className="bg-slate-900/50 border-slate-700 pl-10 text-white focus:ring-violet-500"
                                                placeholder="admin@example.com"
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
                                </div>
                                <div className="space-y-6 hidden md:block">
                                    {/* Empty column for layout balance */}
                                </div>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-slate-700/50">
                                <Button
                                    type="submit"
                                    disabled={saving || !profile.full_name || !profile.email}
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
