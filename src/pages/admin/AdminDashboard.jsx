import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/ui/StatCard";
import GlassCard from "@/components/ui/GlassCard";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import BarChartComponent from "@/components/charts/BarChartComponent";
import DonutChart from "@/components/charts/DonutChart";
import PageHeader from "@/components/ui/PageHeader";
import {
  Users,
  UserCog,
  IndianRupee,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { format, parseISO } from "date-fns";


import axios from "axios";
import apiRoutes from "../../services/ApiRoutes/ApiRoutes";
import axiosInterceptor from "@/api/axiosInterceptor";
/* ================= DYNAMIC DATA INTEGRATION ================= *//* ================= DASHBOARD ================= */

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [revenueStats, setRevenueStats] = useState({ total_revenue: 0, trend: [] });
  const [attendanceStats, setAttendanceStats] = useState({ present_members: 0, absent_members: 0 });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${localStorage.getItem("access_token")}` };

      const [membersRes, trainersRes, revenueRes, attendanceRes] = await Promise.all([
        axiosInterceptor.get(apiRoutes.baseUrl + apiRoutes.Admin + apiRoutes.Members, { headers }),
        axiosInterceptor.get(apiRoutes.baseUrl + apiRoutes.Admin + apiRoutes.Trainers, { headers }),
        axiosInterceptor.get(apiRoutes.baseUrl + apiRoutes.Admin + apiRoutes.RevenueStats, { headers }),
        axiosInterceptor.get(apiRoutes.baseUrl + apiRoutes.Admin + apiRoutes.AdminAttendanceOverview, {
          headers,
          params: { date: format(new Date(), "yyyy-MM-dd") }
        })
      ]);

      setMembers(membersRes.data);
      setTrainers(trainersRes.data);
      setRevenueStats(revenueRes.data);
      setAttendanceStats(attendanceRes.data.stats || { present_members: 0, absent_members: 0 });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Calculate dynamic membership distribution from actual members
  const planCounts = {};
  members.forEach(m => {
    const planName = m.active_membership?.plan_name || 'No Plan';
    planCounts[planName] = (planCounts[planName] || 0) + 1;
  });

  const colors = ["#64748b", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];
  const membershipDistribution = Object.keys(planCounts).map((key, idx) => ({
    name: key,
    value: planCounts[key],
    color: colors[idx % colors.length]
  }));

  // Dummy placeholder for week trend until full weekly API is built
  const weeklyAttendanceTrend = [
    { name: 'Today', present: attendanceStats.present_members || 0, absent: attendanceStats.absent_members || 0 }
  ]; const memberColumns = [
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
      accessor: "active_membership",
      render: (row) => <StatusBadge status={row.active_membership?.plan_name || 'No Plan'} />,
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Joined",
      accessor: "join_date",
      render: (row) => {
        if (!row.join_date) {
          return <span className="text-slate-500">—</span>;
        }

        const date = parseISO(row.join_date);

        if (isNaN(date.getTime())) {
          return <span className="text-slate-500">—</span>;
        }

        return (
          <span className="text-slate-400">
            {format(date, "MMM d, yyyy")}
          </span>
        );
      },
    }
  ];

  return (
    <DashboardLayout role="admin" currentPage="AdminDashboard" title="Admin Dashboard">
      <div className="space-y-6">
        <PageHeader
          title="Admin Overview"
          subtitle="Real-time key metrics and statistics for your gym."
        />

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard title="Total Members" value={members.length} icon={Users} />
          <StatCard title="Total Trainers" value={trainers.length} icon={UserCog} />
          <StatCard title="Total Revenue" value={`₹${revenueStats.total_revenue || 0}`} icon={IndianRupee} />
          <StatCard title="Present Today" value={attendanceStats.present_members || 0} icon={UserCheck} />
          <StatCard title="Absent Today" value={attendanceStats.absent_members || 0} icon={UserX} />
          <StatCard title="Active Plans" value={members.filter(m => m.status === "active").length} icon={Calendar} />
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Attendance Trend</h3>
            <BarChartComponent data={weeklyAttendanceTrend} dataKey="present" secondaryDataKey="absent" />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Revenue Overview</h3>
            <AreaChartComponent data={revenueStats.trend || []} dataKey="revenue" />
          </GlassCard>
        </div>

        {/* TABLE + DONUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 p-0">
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
              <DataTable
                columns={memberColumns}
                data={members.slice(0, 10)} // optional safety
              />
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Membership Distribution</h3>
            {membershipDistribution.length > 0 ? (
              <DonutChart data={membershipDistribution} />
            ) : (
              <div className="text-sm text-slate-500 text-center py-10">No active plans found</div>
            )}
          </GlassCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
