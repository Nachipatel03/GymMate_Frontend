import React, { useState } from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2, ShieldCheck, Key } from "lucide-react";
import { toast } from "sonner";
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        old_password: "",
        new_password: "",
        confirm_password: "",
    });

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const role = user.role?.toLowerCase() || "member";

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.new_password !== formData.confirm_password) {
            return toast.error("New passwords do not match");
        }

        setLoading(true);
        try {
            await axiosInterceptor.post(apiRoutes.Auth + apiRoutes.ChangePassword, formData);
            toast.success("Password updated successfully");
            setFormData({ old_password: "", new_password: "", confirm_password: "" });
            
            // Optional: redirect to profile
            navigate(role === "admin" ? "/admin/profile" : "/profile");
        } catch (error) {
            const data = error.response?.data;
            if (data?.old_password) {
                toast.error(data.old_password[0]);
            } else {
                toast.error("Failed to update password. Please check your current password.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout role={role} title="Security" currentPage="Change Password">
            <div className="max-w-xl mx-auto py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <GlassCard className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400">
                                <Key className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">Reset Password</h2>
                                <p className="text-sm text-slate-400">Update your account credentials</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="old_password" className="text-slate-400">Current Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="old_password"
                                        type="password"
                                        value={formData.old_password}
                                        onChange={(e) => setFormData({ ...formData, old_password: e.target.value })}
                                        className="bg-slate-900/50 border-slate-700 pl-10 text-white focus:ring-violet-500"
                                        placeholder="Enter your current password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new_password" className="text-slate-400">New Password</Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="new_password"
                                        type="password"
                                        value={formData.new_password}
                                        onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                                        className="bg-slate-900/50 border-slate-700 pl-10 text-white focus:ring-violet-500"
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm_password" className="text-slate-400">Confirm New Password</Label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="confirm_password"
                                        type="password"
                                        value={formData.confirm_password}
                                        onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                                        className="bg-slate-900/50 border-slate-700 pl-10 text-white focus:ring-violet-500"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white h-12 rounded-xl font-bold transition-all shadow-lg shadow-violet-500/20 active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Updating Password...
                                        </>
                                    ) : (
                                        "Update Password"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </GlassCard>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
