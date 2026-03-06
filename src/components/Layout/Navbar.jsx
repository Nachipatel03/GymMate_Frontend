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
    const storedUser = localStorage.getItem("user");
    setUser(
      storedUser
        ? JSON.parse(storedUser)
        : { full_name: "Admin User", role: "admin" }
    );
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 p-3 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16">

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

        {/* SEARCH */}
        {/* <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search..."
              className="w-full pl-10 bg-slate-800/50 border-slate-700 text-white"
            />
          </div>
        </div> */}

        {/* RIGHT */}
        <div className="flex items-center gap-2">

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
                className="flex items-center gap-2 px-2 hover:bg-slate-800"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
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
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>

              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
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
