import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Users,
  ChevronRight,
  Zap,
  BarChart3,
  Apple,
} from "lucide-react";

/* ================= FEATURES ================= */

const features = [
  {
    icon: Users,
    title: "Member Management",
    description: "Easily manage all your gym members with detailed tracking",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: Dumbbell,
    title: "Workout Plans",
    description: "Create customized workout plans for each member",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: Apple,
    title: "Diet Planning",
    description: "Design nutrition plans with meal scheduling",
    gradient: "from-emerald-500 to-green-600",
  },
  {
    icon: BarChart3,
    title: "Progress Analytics",
    description: "Track progress with detailed charts and insights",
    gradient: "from-amber-500 to-orange-600",
  },
];

/* ================= HOME ================= */

export default function Home() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------- AUTH CHECK ---------- */
  useEffect(() => {
    try {
      const token = localStorage.getItem("access_token");
      const storedUser = JSON.parse(localStorage.getItem("user"));

      // ❌ Not logged in
      if (!token || !storedUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      // ✅ Logged in
      setUser(storedUser);
    } catch (error) {
      // corrupted localStorage
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ---------- DASHBOARD REDIRECT ---------- */
  const goToDashboard = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "ADMIN") navigate("/admindashboard");
    else if (user.role === "TRAINER") navigate("/memberdashboard");
    else navigate("/memberdashboard");
  };

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden">

      {/* ================= NAVBAR ================= */}
      <nav className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="flex items-center justify-between h-[88px] px-6 sm:px-10 lg:px-16">

          {/* LOGO */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Dumbbell className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-violet-400">
              GymMate
            </span>
          </div>

          {/* CTA */}
          {!loading && (
            <Button
              size="lg"
              onClick={goToDashboard}
              className="px-8 py-3 text-lg bg-gradient-to-r from-violet-500 to-purple-600"
            >
              {user ? "Dashboard" : "Sign In"}
            </Button>
          )}
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="pt-20 pb-16 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-400 text-sm mb-8">
            <Zap className="w-4 h-4" />
            Ultimate Fitness Platform
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
            Transform Your
            <span className="block text-violet-400">Fitness Journey</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
            Manage members, workouts, diets, and analytics in one powerful platform.
          </p>

          <Button
            size="lg"
            onClick={goToDashboard}
            className="px-10 py-4 text-lg bg-gradient-to-r from-violet-500 to-purple-600"
          >
            Get Started
            <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </motion.div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-violet-500/40 transition"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}
              >
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 py-6 text-center text-slate-400 text-sm">
        © 2024 GymMate. All rights reserved.
      </footer>
    </div>
  );
}
