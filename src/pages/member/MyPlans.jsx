import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import { 
    CreditCard, 
    Calendar, 
    Clock, 
    Loader2, 
    Shield, 
    ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function MyPlans() {
    const [loading, setLoading] = useState(true);
    const [plansData, setPlansData] = useState({
        active_membership: null,
        scheduled_memberships: []
    });

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                // Fetching from profile endpoint as it already has the membership data
                const res = await axiosInterceptor.get(apiRoutes.Admin + apiRoutes.MemberProfile);
                setPlansData({
                    active_membership: res.data.active_membership,
                    scheduled_memberships: res.data.scheduled_memberships || []
                });
            } catch (error) {
                toast.error("Failed to load your plans");
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="member" title="My Plans" currentPage="My Plans">
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="member" title="My Plans" currentPage="My Plans">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex flex-col gap-2">
                    <h2 className="text-3xl font-bold text-white">Membership Details</h2>
                    <p className="text-slate-400">View and manage your active and upcoming gym memberships.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Active Plan */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <GlassCard className="p-8 border-violet-500/20 bg-violet-500/5 h-full flex flex-col">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-violet-500/20 shadow-lg shadow-violet-500/10">
                                    <CreditCard className="w-8 h-8 text-violet-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Active Plan</h3>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest">Currently In Use</p>
                                </div>
                            </div>

                            {plansData.active_membership ? (
                                <div className="space-y-6 flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-3xl font-black text-white">{plansData.active_membership.plan_name}</p>
                                            <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
                                                Active
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3 mt-4">
                                            <div className="flex items-center gap-3 text-slate-300">
                                                <Calendar className="w-5 h-5 text-violet-400/70" />
                                                <div className="text-sm">
                                                    <span className="text-slate-500 block text-[10px] uppercase font-bold">Duration</span>
                                                    {plansData.active_membership.start_date} — {plansData.active_membership.end_date}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-8">
                                        <Link 
                                            to="/memberplans" 
                                            className="w-full flex items-center justify-center gap-2 py-3.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-violet-600/20 group"
                                        >
                                            Change or Renew Plan
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <CreditCard className="w-8 h-8 text-slate-500" />
                                    </div>
                                    <p className="text-slate-400 font-medium italic">No active membership found.</p>
                                    <Link to="/memberplans" className="mt-4 text-violet-400 hover:text-violet-300 font-bold flex items-center gap-2 group">
                                        View Available Plans 
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>

                    {/* Upcoming Plans */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <GlassCard className="p-8 h-full flex flex-col">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 rounded-2xl bg-slate-800 shadow-lg">
                                    <Clock className="w-8 h-8 text-slate-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Upcoming Plans</h3>
                                    <p className="text-xs text-slate-400 uppercase tracking-widest">Queued for later</p>
                                </div>
                            </div>

                            {plansData.scheduled_memberships?.length > 0 ? (
                                <div className="space-y-4 flex-1 overflow-auto max-h-[300px] pr-2 custom-scrollbar">
                                    {plansData.scheduled_memberships.map((m, idx) => (
                                        <div key={idx} className="relative group">
                                            <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/50 hover:border-violet-500/30 transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <p className="text-lg font-bold text-white">{m.plan_name}</p>
                                                    <div className="px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[10px] font-bold uppercase">
                                                        Scheduled
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-xs">Starts on: <span className="text-slate-200">{m.start_date}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/10 flex items-start gap-3 mt-4">
                                        <Shield className="w-5 h-5 text-violet-400/50 flex-shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                            Your queued plans will automatically activate as soon as your current membership expires. No action required!
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
                                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                        <Clock className="w-8 h-8 text-slate-600" />
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium italic">No upcoming plans scheduled.</p>
                                    <p className="text-slate-600 text-[11px] mt-2 max-w-[200px]">
                                        Buy a plan now to queue it after your current one ends.
                                    </p>
                                </div>
                            )}
                        </GlassCard>
                    </motion.div>
                </div>

                {/* Footer Info */}
                <GlassCard className="p-6 border-slate-700/30">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 flex-shrink-0">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-semibold text-white mb-1">Flexibility & Convenience</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                GymMate allows you to queue multiple memberships. This ensures you never lose access to the gym, and your progress continues uninterrupted. You can view all your history in the payments section.
                            </p>
                        </div>
                    </div>
                </GlassCard>

            </div>
        </DashboardLayout>
    );
}
