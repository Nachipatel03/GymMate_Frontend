import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Banknote } from 'lucide-react';
import axiosInterceptor from '@/api/axiosInterceptor';

export default function CheckoutModal({ isOpen, onClose, plan, onSuccess }) {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen || !plan) return null;

    const paymentMethods = [
        { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
        { id: 'upi', name: 'UPI', icon: Smartphone },
        { id: 'bank_transfer', name: 'Bank Transfer', icon: Banknote },
    ];

    const handleCheckout = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axiosInterceptor.post('/api/payments/checkout/', {
                plan: plan.id,
                amount: plan.price,
                payment_method: paymentMethod,
                status: 'completed'
            });
            onSuccess(response.data.message);
            onClose();
        } catch (err) {
            setError(err.response?.data?.detail || 'Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl p-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Checkout</h2>
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Order Summary */}
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                            <h3 className="text-sm font-medium text-slate-400 mb-2">Order Summary</h3>
                            <div className="flex justify-between items-center text-white mb-2">
                                <span className="font-semibold">{plan.name} Plan</span>
                                <span className="font-bold">₹{plan.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-slate-400">
                                <span>Duration</span>
                                <span>{plan.duration_months} Months</span>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div>
                            <h3 className="text-sm font-medium text-slate-400 mb-3">Select Payment Method</h3>
                            <div className="space-y-3">
                                {paymentMethods.map((method) => (
                                    <button
                                        key={method.id}
                                        onClick={() => setPaymentMethod(method.id)}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 ${paymentMethod === method.id
                                                ? 'bg-violet-500/10 border-violet-500 text-white'
                                                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800'
                                            }`}
                                    >
                                        <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-violet-400' : 'text-slate-400'}`} />
                                        <span className="font-medium">{method.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Action */}
                        <button
                            onClick={handleCheckout}
                            disabled={loading}
                            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold hover:from-violet-500 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Processing...' : `Pay ₹${plan.price}`}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
