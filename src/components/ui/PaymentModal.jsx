import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { CreditCard, Banknote, Smartphone, Building2, CheckCircle2 } from "lucide-react";

const PAYMENT_METHODS = [
    { value: "cash", label: "Cash", icon: Banknote },
    { value: "card", label: "Card", icon: CreditCard },
    { value: "upi", label: "UPI", icon: Smartphone },
    { value: "bank_transfer", label: "Bank Transfer", icon: Building2 },
    { value: "pay_later", label: "Pay Later", icon: Banknote },
];

export default function PaymentModal({ isOpen, onClose, onConfirm, plan, memberName, loading = false }) {
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [dueDate, setDueDate] = useState("");

    const handleConfirm = () => {
        onConfirm(paymentMethod, paymentMethod === "pay_later" ? dueDate : null);
    };

    const selectedMethod = PAYMENT_METHODS.find((m) => m.value === paymentMethod);
    const MethodIcon = selectedMethod?.icon ?? Banknote;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-violet-400" />
                        Payment Details
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Confirm payment to activate membership for{" "}
                        <span className="text-white font-medium">{memberName}</span>
                    </DialogDescription>
                </DialogHeader>

                {/* Plan Summary Card */}
                {plan && (
                    <div className="rounded-xl border border-violet-500/30 bg-violet-500/5 p-4 space-y-3">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Plan</p>
                                <p className="text-white font-semibold text-lg">{plan.name}</p>
                                <p className="text-slate-400 text-sm">{plan.duration_months} month{plan.duration_months > 1 ? "s" : ""}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Amount</p>
                                <p className="text-3xl font-bold text-violet-400">
                                    ₹{Number(plan.price).toLocaleString("en-IN")}
                                </p>
                            </div>
                        </div>

                        {plan.features?.length > 0 && (
                            <div className="pt-2 border-t border-slate-700 space-y-1">
                                {plan.features.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                        {f}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Payment Method */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Payment Method</label>
                        <div className="grid grid-cols-2 gap-2">
                            {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => setPaymentMethod(value)}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${paymentMethod === value
                                        ? "border-violet-500 bg-violet-500/15 text-white"
                                        : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
                                        }`}
                                >
                                    <Icon className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm font-medium">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {paymentMethod === "pay_later" && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-sm font-medium text-slate-300">Due Date</label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full bg-slate-800 border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-violet-500 outline-none transition-all"
                                min={new Date().toISOString().split("T")[0]}
                                required
                            />
                            <p className="text-xs text-amber-400">Admin will be notified 1 day before the due date.</p>
                        </div>
                    )}
                </div>

                {/* Total Summary */}
                <div className="flex justify-between items-center py-3 border-t border-slate-700">
                    <span className="text-slate-400 text-sm">Total Payable</span>
                    <span className="text-white font-bold text-lg">
                        ₹{plan ? Number(plan.price).toLocaleString("en-IN") : "—"}
                    </span>
                </div>

                <DialogFooter className="gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        onClick={handleConfirm}
                        disabled={loading || (paymentMethod === "pay_later" && !dueDate)}
                        className="bg-violet-600 hover:bg-violet-700 text-white gap-2"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing…
                            </>
                        ) : (
                            <>
                                <MethodIcon className="w-4 h-4" />
                                Confirm Payment
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
