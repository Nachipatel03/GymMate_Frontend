import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Loader2, Key, ShieldCheck, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/ui/GlassCard";
import { toast, Toaster } from "sonner";
import axios from "axios";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";

export default function ResetPasswordConfirm() {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        password: "",
        confirm_password: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirm_password) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);
        try {
            await axios.post(apiRoutes.baseUrl + apiRoutes.Auth + apiRoutes.PasswordResetConfirm, {
                ...formData,
                uid,
                token
            });
            setIsSuccess(true);
            toast.success("Password reset successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid or expired reset link.");
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
                <Toaster position="top-right" richColors theme="dark" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                >
                    <GlassCard className="p-8 text-center">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Password Reset!</h2>
                        <p className="text-slate-400 mb-8">
                            Your password has been changed successfully. You can now log in with your new credentials.
                        </p>
                        <Link 
                            to="/login" 
                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20"
                        >
                            Continue to Login
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </GlassCard>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <Toaster position="top-right" richColors theme="dark" />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">
                        Gym<span className="text-violet-500">Mate</span>
                    </h1>
                    <p className="text-slate-400">Set your new password</p>
                </div>

                <GlassCard className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400">
                            <Key className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">New Password</h2>
                            <p className="text-xs text-slate-400 uppercase tracking-widest">Secure your account</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-slate-400">New Password</Label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="bg-slate-900 border-slate-800 pl-10 text-white focus:ring-violet-500 h-12"
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
                                    className="bg-slate-900 border-slate-800 pl-10 text-white focus:ring-violet-500 h-12"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-violet-600/20 active:scale-[0.98] transition-all"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Resetting Password...
                                </>
                            ) : (
                                "Update Password"
                            )}
                        </Button>
                    </form>
                </GlassCard>
            </motion.div>
        </div>
    );
}
