import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import GlassCard from "@/components/ui/GlassCard";
import { toast, Toaster } from "sonner";
import axios from "axios";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(apiRoutes.baseUrl + apiRoutes.Auth + apiRoutes.PasswordReset, { email });
            setIsSent(true);
            toast.success("Reset link sent!");
        } catch (error) {
            toast.error("Failed to send reset link. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (isSent) {
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
                        <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
                        <p className="text-slate-400 mb-8">
                            We've sent a password reset link to <span className="text-white font-medium">{email}</span>.
                        </p>
                        <Link 
                            to="/login" 
                            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
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
                    <p className="text-slate-400">Recover your account</p>
                </div>

                <GlassCard className="p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-1">Forgot Password?</h2>
                        <p className="text-sm text-slate-400">
                            Enter the email address associated with your account and we'll send you a link to reset your password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-slate-400">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    className="bg-slate-900 border-slate-800 pl-10 text-white focus:ring-violet-500 h-12"
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
                                    Sending Link...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Reset Link
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
                        <Link to="/login" className="text-slate-500 hover:text-white flex items-center justify-center gap-2 text-sm transition-colors group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </Link>
                    </div>
                </GlassCard>
            </motion.div>
        </div>
    );
}
