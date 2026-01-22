import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Dumbbell, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

const ROLE_REDIRECT = {
  admin: "/admindashboard",
  trainer: "/trainer/dashboard",
  member: "/memberdashboard",
};

/* ---------- API FUNCTION ---------- */
const loginUser = (data) => {
  return axios.post(
    `${import.meta.env.VITE_API_BASE_URL}auth/login/`,
    data
  );
};

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /* ---------- HANDLE CHANGE ---------- */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ---------- HANDLE SUBMIT ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    if (!form.password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(form);
      const { access, refresh, user } = res.data;

      if (access) localStorage.setItem("access_token", access);
      if (refresh) localStorage.setItem("refresh_token", refresh);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      toast.success("Login successful");
      navigate("/");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "Login failed. Please check credentials.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
      <Toaster position="top-right" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* LOGO */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-violet-400">GymMate</span>
        </div>

        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-slate-400">
              Sign in to continue to GymMate
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* EMAIL */}
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="mt-1 bg-black/30 border-white/10 text-white"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm text-slate-400">Password</label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="bg-black/30 border-white/10 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600"
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>

              <p className="text-sm text-slate-400">
                Don’t have an account?{" "}
                <Link to="/register" className="text-violet-400 hover:underline">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
