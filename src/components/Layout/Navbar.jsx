import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Menu,
  Bell,
  Search,
  LogOut,
  User,
  ChevronDown,
  Settings,
  LogIn,
  CheckCircle,
  Clock,
  Coffee,
  CreditCard,
  Key,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import axios from "axios";
import { useAttendance } from "@/hooks/useAttendance";


export default function Navbar({ onMenuClick, title = "Dashboard" }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await axios.get(
          apiRoutes.baseUrl + apiRoutes.Auth + apiRoutes.NotificationUnreadCount,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        setUnreadCount(res.data.unread_count);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUnread();
  }, []);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem("user");
      setUser(
        storedUser
          ? JSON.parse(storedUser)
          : { full_name: "Admin User", role: "admin" }
      );
    };

    handleStorageChange(); // initial load
    window.addEventListener("userProfileUpdated", handleStorageChange);
    return () => window.removeEventListener("userProfileUpdated", handleStorageChange);
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  /* ================= ATTENDANCE ================= */
  const { todayRecord, loading: attendanceLoading, handleAction, isOnBreak } = useAttendance(user);

  const canShowAttendance = user?.role?.toLowerCase() === "member" || user?.role?.toLowerCase() === "trainer";

  return (
    <header className="sticky top-0 p-2 sm:p-3 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="flex items-center justify-between px-2 sm:px-4 lg:px-6 h-14 sm:h-16">

        {/* LEFT */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="lg:hidden text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold text-white hidden sm:block"
          >
            {title}
          </motion.h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2">

          {/* ATTENDANCE & BREAKS (Trainer) */}
          {user?.role?.toLowerCase() === "trainer" && (
            <div className="mr-2 hidden sm:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant={todayRecord?.check_out ? "outline" : (isOnBreak ? "secondary" : "default")}
                    disabled={attendanceLoading}
                    className={`gap-2 h-9 rounded-full px-4 font-bold transition-all ${!todayRecord || todayRecord.check_out
                        ? "bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/20"
                        : isOnBreak
                          ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                          : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                      }`}
                  >
                    {attendanceLoading ? (
                      <Clock className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        {isOnBreak ? <Coffee className="w-4 h-4" /> : (todayRecord?.check_out ? <LogIn className="w-4 h-4" /> : (todayRecord ? <LogOut className="w-4 h-4" /> : <LogIn className="w-4 h-4" />))}
                        <span>
                          {todayRecord
                            ? (todayRecord.check_out ? "Resume" : (isOnBreak ? "On Break" : "Active"))
                            : "Check In"}
                        </span>
                        <ChevronDown className="w-3 h-3 opacity-50 ml-1" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-900 border-slate-700 text-slate-200 w-48">
                  {(!todayRecord || todayRecord.check_out) ? (
                    <DropdownMenuItem onClick={() => handleAction('check-in')} className="hover:bg-slate-800 focus:bg-slate-800">
                      <LogIn className="w-4 h-4 mr-2 text-violet-400" />
                      {todayRecord?.check_out ? "Resume Session" : "Start Session"}
                    </DropdownMenuItem>
                  ) : (
                    <>
                      <DropdownMenuItem
                        onClick={() => handleAction(isOnBreak ? 'break-end' : 'break-start')}
                        className="hover:bg-slate-800 focus:bg-slate-800"
                      >
                        <Coffee className="w-4 h-4 mr-2 text-amber-400" />
                        {isOnBreak ? "End Break" : "Take Break"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        onClick={() => {
                          if (window.confirm("Are you sure you want to check out? This will end your current session.")) {
                            handleAction('check-out');
                          }
                        }}
                        className="text-red-400 hover:bg-red-500/10 focus:bg-red-500/10"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Finish Day (Check Out)
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* ATTENDANCE BUTTON (Member Only) */}
          {user?.role?.toLowerCase() === "member" && (
            <div className="mr-2 hidden sm:block">
              <Button
                size="sm"
                variant={todayRecord?.check_out ? "outline" : "default"}
                disabled={attendanceLoading || todayRecord?.check_out}
                onClick={() => {
                  if (!todayRecord) {
                    handleAction('check-in');
                  } else {
                    if (window.confirm("Are you sure you want to check out? This will end your current session.")) {
                      handleAction('check-out');
                    }
                  }
                }}
                className={`gap-2 h-9 rounded-full px-4 font-bold transition-all ${!todayRecord
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                    : todayRecord.check_out
                      ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/5 cursor-default"
                      : "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20"
                  }`}
              >
                {attendanceLoading ? (
                  <Clock className="w-4 h-4 animate-spin" />
                ) : todayRecord ? (
                  todayRecord.check_out ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Checked In</span>
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4" />
                      <span>Check Out</span>
                    </>
                  )
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Check In</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* NOTIFICATIONS */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => navigate('/notifications')}
          >
            <Bell className="w-5 h-5 text-slate-400" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 min-w-[16px] h-4 px-1 text-[10px] flex items-center justify-center bg-violet-500 text-white rounded-full">
                {unreadCount}
              </span>
            )}
          </Button>

          {/* USER MENU */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-1 sm:px-2 hover:bg-slate-800"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs sm:text-sm font-medium">
                    {user?.username?.charAt(0) || "U"}
                  </span>
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">
                    {user?.username}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">
                    {user?.role}
                  </p>
                </div>

                <ChevronDown className="w-4 h-4 hidden sm:block text-slate-400" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-56 bg-slate-900 border border-slate-700 text-slate-300"
            >
              {(user?.role?.toLowerCase() === "member" || user?.role?.toLowerCase() === "admin") && (
                <DropdownMenuItem onClick={() => navigate(user?.role?.toLowerCase() === "admin" ? "/admin/profile" : "/profile")}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
              )}

              {user?.role?.toLowerCase() === "member" && (
                <DropdownMenuItem onClick={() => navigate("/my-plans")}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  My Plans
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => navigate("/change-password")}>
                <Key className="w-4 h-4 mr-2" />
                Reset Password
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="text-rose-400"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
      </div>
    </header>
  );
}
