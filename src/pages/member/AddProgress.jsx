import React, { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Scale,
  Ruler,
  Save,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";

export default function AddProgress() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    weight: "",
    chest: "",
    waist: "",
    arms: "",
    thighs: "",
    notes: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.weight) {
      toast.error("Weight is required");
      return;
    }

    setSaving(true);
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
      toast.success("Progress logged successfully!");
      navigate("/myprogress");
    } catch (error) {
      toast.error("Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="member" currentPage="AddProgress" title="Add Progress">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto"
      >
        <GlassCard className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white">
              Update Today’s Progress
            </h2>
            <p className="text-sm text-slate-400">
              Track your fitness journey daily
            </p>
          </div>

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

          {/* Submit */}
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Progress
                </>
              )}
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </DashboardLayout>
  );
}
