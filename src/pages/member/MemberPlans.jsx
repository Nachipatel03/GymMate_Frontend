import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, Shield, Zap } from 'lucide-react';
import axiosInterceptor from '@/api/axiosInterceptor';
import CheckoutModal from '@/components/member/CheckoutModal';

export default function MemberPlans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await axiosInterceptor.get('/api/plans/available/');
            setPlans(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch membership plans');
            setLoading(false);
        }
    };

    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
        setIsCheckoutOpen(true);
    };

    const handleCheckoutSuccess = (message) => {
        setSuccessMessage(message);
        setTimeout(() => {
            setSuccessMessage('');
        }, 5000);
    };

    return (
        <DashboardLayout role="member">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Membership Plans</h1>
                        <p className="text-slate-400">Choose the perfect plan for your fitness goals.</p>
                    </div>
                </div>

                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-3"
                    >
                        <CheckCircle2 className="w-5 h-5" />
                        <p className="font-medium">{successMessage}</p>
                    </motion.div>
                )}

                {/* Plans Grid */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                        {error}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                key={plan.id}
                                className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 flex flex-col hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10 transition-all duration-300"
                            >
                                {/* Popular Badge */}
                                {plan.type === 'premium' && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                        <Zap className="w-3.5 h-3.5" />
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="mb-8 text-center mt-2">
                                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                                            ${plan.price}
                                        </span>
                                        <span className="text-slate-400">/{plan.duration_months} mo</span>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4 mb-8">
                                    {plan.features?.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-slate-300">
                                            <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                                <CheckCircle2 className="w-3.5 h-3.5 text-violet-400" />
                                            </div>
                                            <span className="text-sm">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSelectPlan(plan)}
                                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${plan.type === 'premium'
                                            ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:shadow-lg hover:shadow-violet-500/25'
                                            : 'bg-white/5 text-white hover:bg-white/10'
                                        }`}
                                >
                                    <CreditCard className="w-5 h-5" />
                                    Select Plan
                                </button>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 flex-shrink-0">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-1">Secure Checkout</h4>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Your payment information is encrypted and securely processed. Upon successful payment, your membership plan will be
                            activated instantly, unlocking all features based on your selected tier.
                        </p>
                    </div>
                </div>
            </div>

            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                plan={selectedPlan}
                onSuccess={handleCheckoutSuccess}
            />
        </DashboardLayout>
    );
}
