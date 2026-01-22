import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
import { Dumbbell, Eye, EyeOff } from "lucide-react";

import axios from "axios";
import apiRoutes from "../../services/ApiRoutes/ApiRoutes";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        full_name: form.name,   // 🔥 FIX
        email: form.email.toLowerCase(),
        password: form.password,
      };

      await axios.post(
         apiRoutes.baseUrl +apiRoutes.Auth+
        apiRoutes.MemberRegister, // e.g. http://127.0.0.1:8000/members/register/
        payload
      );

      // ✅ success → redirect to login
      navigate("/login");
    } catch (err) {
      // 🔥 Backend error handling
      if (err.response && err.response.data) {
        const data = err.response.data;

        if (data.email) {
          setError(data.email[0]); // "This email is already registered."
        } else if (data.password) {
          setError(data.password[0]);
        } else if (data.detail) {
          setError(data.detail);
        } else {
          setError("Registration failed");
        }
      } else {
        setError("Server error. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* LOGO */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <Dumbbell className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-violet-400">
            GymMate
          </span>
        </div>

        {/* CARD */}
        <Card className="bg-white/5 border border-white/10 backdrop-blur-xl text-white">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              Create an Account
            </CardTitle>
            <CardDescription className="text-slate-400">
              Start managing your fitness journey today
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">

              {/* NAME */}
              <div>
                <label className="text-sm text-slate-400">
                  Full Name
                </label>
                <Input
                  name="name"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-black/30 border-white/10 text-white"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm text-slate-400">
                  Email
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-1 bg-black/30 border-white/10 text-white"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="text-sm text-slate-400">
                  Password
                </label>
                <div className="relative mt-1">
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="bg-black/30 border-white/10 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="text-sm text-slate-400">
                  Confirm Password
                </label>
                <div className="relative mt-1">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    className="bg-black/30 border-white/10 text-white pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* ERROR */}
              {error && (
                <p className="text-sm text-red-400 text-center">
                  {error}
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
              >
                {loading ? "Creating account..." : "Sign Up"}
              </Button>

              <p className="text-sm text-slate-400">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-violet-400 hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
