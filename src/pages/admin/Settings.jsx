import React from "react";
import DashboardLayout from "@/components/Layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Settings as SettingsIcon, Mail, ChevronRight } from "lucide-react";

export default function Settings() {
  const settingOptions = [
    {
      title: "Email Templates",
      description: "Customize the automated emails sent to members (Welcome, Password Reset, etc.)",
      icon: <Mail className="w-6 h-6" />,
      link: "/emailtemplates",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    // Future settings can go here
  ];

  return (
    <DashboardLayout role="admin" title="Settings" currentPage="Settings">
      <div className="max-w-4xl mx-auto py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-2xl bg-violet-500/10 text-violet-400">
              <SettingsIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">System Settings</h2>
              <p className="text-sm text-slate-400">
                Manage global application settings and configuration
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {settingOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={option.link}>
                  <GlassCard className="p-6 h-full cursor-pointer hover:border-violet-500/40 hover:-translate-y-1 transition-all group">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-xl ${option.bgColor} ${option.color}`}>
                        {option.icon}
                      </div>
                      <div className="text-slate-600 group-hover:text-violet-400 transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {option.title}
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {option.description}
                    </p>
                  </GlassCard>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
