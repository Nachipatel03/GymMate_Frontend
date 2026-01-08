import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import DonutChart from "@/components/charts/DonutChart";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  Download,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

/* -------------------------------------------------------------------------- */
/*                               STATIC DATA                                  */
/*                   TODO: Replace with API later                              */
/* -------------------------------------------------------------------------- */

const revenueData = [
  { name: "Jan", revenue: 12500 },
  { name: "Feb", revenue: 15000 },
  { name: "Mar", revenue: 18500 },
  { name: "Apr", revenue: 16000 },
  { name: "May", revenue: 21000 },
  { name: "Jun", revenue: 19500 },
];

const paymentMethodsData = [
  { name: "Card", value: 55, color: "#8b5cf6" },
  { name: "Cash", value: 25, color: "#10b981" },
  { name: "UPI", value: 15, color: "#06b6d4" },
  { name: "Bank", value: 5, color: "#f59e0b" },
];

const INITIAL_PAYMENTS = [
  { id: 1, member: "John Smith", amount: 79, method: "card", plan: "Premium", status: "completed", date: "2024-01-15" },
  { id: 2, member: "Sarah Wilson", amount: 249, method: "upi", plan: "VIP", status: "completed", date: "2024-01-15" },
  { id: 3, member: "Mike Johnson", amount: 29, method: "cash", plan: "Basic", status: "completed", date: "2024-01-14" },
  { id: 4, member: "Emma Davis", amount: 79, method: "card", plan: "Premium", status: "pending", date: "2024-01-14" },
  { id: 5, member: "James Brown", amount: 29, method: "bank_transfer", plan: "Basic", status: "completed", date: "2024-01-13" },
  { id: 6, member: "Lisa Anderson", amount: 249, method: "card", plan: "VIP", status: "failed", date: "2024-01-13" },
];

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export default function PaymentsRevenue() {
  const [payments] = useState(INITIAL_PAYMENTS);
  // TODO: Replace with API data

  const [periodFilter, setPeriodFilter] = useState("month");
  const [statusFilter, setStatusFilter] = useState("all");

  /* ------------------------------ METRICS ---------------------------------- */

  const totalRevenue = useMemo(
    () =>
      payments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const pendingAmount = useMemo(
    () =>
      payments
        .filter((p) => p.status === "pending")
        .reduce((sum, p) => sum + p.amount, 0),
    [payments]
  );

  const filteredPayments = useMemo(
    () =>
      payments.filter(
        (payment) =>
          statusFilter === "all" || payment.status === statusFilter
      ),
    [payments, statusFilter]
  );

  /* ------------------------------ TABLE ------------------------------------ */

  const columns = [
    {
      header: "Member",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-white text-xs font-medium">
              {row.member.charAt(0)}
            </span>
          </div>
          <span className="font-medium text-white">{row.member}</span>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-semibold text-emerald-400">
          ${row.amount}
        </span>
      ),
    },
    {
      header: "Plan",
      render: (row) => (
        <StatusBadge status={row.plan.toLowerCase()} />
      ),
    },
    {
      header: "Method",
      render: (row) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span className="capitalize text-slate-300">
            {row.method.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Date",
      render: (row) => (
        <span className="text-slate-400">
          {format(new Date(row.date), "MMM d, yyyy")}
        </span>
      ),
    },
  ];

  /* ------------------------------- UI -------------------------------------- */

  return (
    <DashboardLayout title="Payments & Revenue">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Revenue</h2>
            <p className="text-slate-400">Track payments and revenue</p>
          </div>
          <Button
            type="button"
            className="bg-gradient-to-r from-emerald-500 to-green-600"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={DollarSign}
            trend="up"
            trendValue="+18%"
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            title="This Month"
            value="$19,500"
            icon={TrendingUp}
            trend="up"
            trendValue="+12%"
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Pending"
            value={`$${pendingAmount.toLocaleString()}`}
            icon={Receipt}
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard
            title="Transactions"
            value={payments.length}
            icon={CreditCard}
            gradient="from-cyan-500 to-blue-600"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Revenue Trend
                </h3>
                <p className="text-sm text-slate-400">
                  Monthly revenue overview
                </p>
              </div>
              <Select value={periodFilter} onValueChange={setPeriodFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AreaChartComponent
              data={revenueData}
              dataKey="revenue"
              color="#10b981"
              gradientId="revenueGradient"
              height={280}
            />
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="text-lg font-semibold text-white mb-1">
              Payment Methods
            </h3>
            <p className="text-sm text-slate-400 mb-4">
              Distribution by type
            </p>
            <DonutChart data={paymentMethodsData} height={280} />
          </GlassCard>
        </div>

        {/* Table */}
        <GlassCard>
          <div className="p-6 border-b border-slate-700/50 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Recent Payments
              </h3>
              <p className="text-sm text-slate-400">
                Latest transactions
              </p>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DataTable columns={columns} data={filteredPayments} />
        </GlassCard>

      </div>
    </DashboardLayout>
  );
}
