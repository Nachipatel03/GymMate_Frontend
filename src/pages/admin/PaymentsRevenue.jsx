import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import StatCard from "@/components/ui/StatCard";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import AreaChartComponent from "@/components/charts/AreaChartComponent";
import DonutChart from "@/components/charts/DonutChart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "@/services/ApiRoutes/ApiRoutes";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IndianRupee,
  TrendingUp,
  CreditCard,
  Receipt,
  Download,
  Filter,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export default function PaymentsRevenue() {
  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    total_revenue: 0,
    this_month_revenue: 0,
    pending_amount: 0,
    total_transactions: 0,
    trend: [],
    methods: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const fetchPayments = async (page = 1, search = searchQuery, status = statusFilter) => {
    try {
      setLoading(true);
      const res = await axiosInterceptor.get(`${apiRoutes.baseUrl}${apiRoutes.Admin}${apiRoutes.PaymentsList}`, {
        params: {
          page: page,
          search: search,
          status: status
        }
      });
      
      setPayments(res.data.results || []);
      setPaginationInfo({
        count: res.data.count,
        next: res.data.next,
        previous: res.data.previous,
      });
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axiosInterceptor.get(apiRoutes.baseUrl + apiRoutes.Admin + apiRoutes.RevenueStats);
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch revenue stats:", error);
    }
  };

  // Fetch stats only once on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Fetch payments when status changes (immediate)
  useEffect(() => {
    fetchPayments(1, searchQuery, statusFilter);
  }, [statusFilter]);

  // Handle search with debounce (only for search input)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPayments(1, searchQuery, statusFilter);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [periodFilter, setPeriodFilter] = useState("month");

  /* ------------------------------ METRICS ---------------------------------- */

  // Removed client-side filteredPayments as it's now handled by backend
  const displayPayments = payments;

  /* ------------------------------ TABLE ------------------------------------ */

  const columns = [
    {
      header: "Member",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-medium">
              {row.member_name?.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-white line-clamp-1">{row.member_name}</span>
            <span className="text-xs text-slate-400 line-clamp-1">{row.member_email}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Amount",
      render: (row) => (
        <span className="font-semibold text-emerald-400">
          ₹{row.amount}
        </span>
      ),
    },
    {
      header: "Invoice ID",
      render: (row) => (
        <span className="text-slate-300 font-mono text-xs">
          {row.invoice_number || "—"}
        </span>
      ),
    },
    {
      header: "Plan",
      render: (row) => (
        <StatusBadge status={row.plan_name?.toLowerCase() || "basic"} />
      ),
    },
    {
      header: "Method",
      render: (row) => (
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-slate-400" />
          <span className="capitalize text-slate-300">
            {row.payment_method?.replace("_", " ") || "—"}
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
          {row.status === "pending" && row.due_date ? (
            <span className="text-amber-400 font-medium">Due: {format(new Date(row.due_date), "MMM d, yyyy")}</span>
          ) : row.payment_date ? (
            format(new Date(row.payment_date), "MMM d, yyyy")
          ) : (
            "-"
          )}
        </span>
      ),
    },
  ];

  const handlePageChange = (page) => {
    fetchPayments(page, searchQuery, statusFilter);
  };

  /* ------------------------------- UI -------------------------------------- */

  return (
    <DashboardLayout title="Payments & Revenue">
      <div className="space-y-6">

        {/* Header */}
        <PageHeader
          title="Revenue"
          subtitle="Track payments and revenue"
          action={
            <Button
              type="button"
              className="bg-gradient-to-r from-emerald-500 to-green-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Revenue"
            value={`₹${Number(stats.total_revenue).toLocaleString()}`}
            icon={IndianRupee}
            trend="up"
            trendValue="+18%"
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            title="This Month"
            value={`₹${Number(stats.this_month_revenue).toLocaleString()}`}
            icon={TrendingUp}
            trend="up"
            trendValue="+12%"
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Pending"
            value={`₹${Number(stats.pending_amount).toLocaleString()}`}
            icon={Receipt}
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard
            title="Transactions"
            value={stats.total_transactions}
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
              data={stats.trend}
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
            <DonutChart data={stats.methods} height={280} />
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

            <div className="flex items-center gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search name or invoice..."
                  className="pl-9 bg-slate-800/50 border-slate-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
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
          </div>

          <DataTable 
            columns={columns} 
            data={displayPayments} 
            currentPage={currentPage}
            totalPages={Math.ceil(paginationInfo.count / 10)}
            onPageChange={handlePageChange}
          />
        </GlassCard>

      </div>
    </DashboardLayout>
  );
}
