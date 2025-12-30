import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import GlassCard from "@/components/ui/GlassCard";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import BarChartComponent from "@/components/charts/BarChartComponent";
import DonutChart from "@/components/charts/DonutChart";
import {
  Users,
  UserCog,
  DollarSign,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

/* ================= DUMMY DATA ================= */

const members = [
  { id: 1, full_name: "John Smith", email: "john@email.com", phone: "+1 234 567", membership_plan: "premium", status: "active", created_date: new Date() },
  { id: 2, full_name: "Sarah Wilson", email: "sarah@email.com", phone: "+1 345 678", membership_plan: "vip", status: "active", created_date: new Date() },
  { id: 3, full_name: "Mike Johnson", email: "mike@email.com", phone: "+1 456 789", membership_plan: "basic", status: "inactive", created_date: new Date() },
];

const trainers = [{ id: 1 }, { id: 2 }, { id: 3 }];

const payments = [
  { amount: 12000, status: "completed" },
  { amount: 18000, status: "completed" },
  { amount: 15500, status: "completed" },
];

const weeklyAttendanceData = [
  { name: "Mon", present: 45, absent: 5 },
  { name: "Tue", present: 52, absent: 8 },
  { name: "Wed", present: 48, absent: 12 },
  { name: "Thu", present: 55, absent: 5 },
  { name: "Fri", present: 60, absent: 10 },
  { name: "Sat", present: 38, absent: 22 },
  { name: "Sun", present: 25, absent: 35 },
];

const revenueData = [
  { name: "Jan", revenue: 12500 },
  { name: "Feb", revenue: 15000 },
  { name: "Mar", revenue: 18500 },
  { name: "Apr", revenue: 16000 },
  { name: "May", revenue: 21000 },
  { name: "Jun", revenue: 19500 },
];

const membershipDistribution = [
  { name: "Basic", value: 45, color: "#64748b" },
  { name: "Premium", value: 35, color: "#8b5cf6" },
  { name: "VIP", value: 20, color: "#f59e0b" },
];

/* ================= DASHBOARD ================= */

export default function AdminDashboard() {
  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
  const presentToday = 48;
  const absentToday = members.length - presentToday;

  const memberColumns = [
    {
      header: "Member",
      accessor: "full_name",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {row.full_name?.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-white">{row.full_name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Phone", accessor: "phone" },
    {
      header: "Plan",
      accessor: "membership_plan",
      render: (row) => <StatusBadge status={row.membership_plan} />,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Joined",
      accessor: "created_date",
      render: (row) => (
        <span className="text-slate-400">
          {format(new Date(row.created_date), "MMM d, yyyy")}
        </span>
      ),
    },
  ];

  return (
    <DashboardLayout role="admin" currentPage="AdminDashboard" title="Admin Dashboard">
      <div className="space-y-6">

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Members" value={members.length} icon={Users} />
          <StatCard title="Total Trainers" value={trainers.length} icon={UserCog} />
          <StatCard title="Monthly Revenue" value={`$${totalRevenue}`} icon={DollarSign} />
          <StatCard title="Present Today" value={presentToday} icon={UserCheck} />
          <StatCard title="Absent Today" value={absentToday} icon={UserX} />
          <StatCard title="Active Plans" value={members.filter(m => m.status === "active").length} icon={Calendar} />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <BarChartComponent data={weeklyAttendanceData} />
          </GlassCard>

          <GlassCard className="p-6">
            <AreaChartComponent data={revenueData} dataKey="revenue" />
          </GlassCard>
        </div>

        {/* TABLE + DONUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2">
            <DataTable columns={memberColumns} data={members} />
          </GlassCard>

          <GlassCard className="p-6">
            <DonutChart data={membershipDistribution} />
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
