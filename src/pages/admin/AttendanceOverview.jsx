import React, { useState, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import BarChartComponent from "@/components/charts/BarChartComponent";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  CalendarIcon,
  UserCheck,
  UserX,
  Users,
  Clock,
} from "lucide-react";
import { format } from "date-fns";

/* -------------------------------------------------------------------------- */
/*                               STATIC DATA                                  */
/*                   TODO: Replace with API later                              */
/* -------------------------------------------------------------------------- */

// Weekly chart data
const weeklyData = [
  { name: "Mon", present: 45, absent: 15 },
  { name: "Tue", present: 52, absent: 8 },
  { name: "Wed", present: 48, absent: 12 },
  { name: "Thu", present: 55, absent: 5 },
  { name: "Fri", present: 60, absent: 10 },
  { name: "Sat", present: 38, absent: 22 },
  { name: "Sun", present: 25, absent: 35 },
];

// Today attendance list
const recentAttendance = [
  { id: 1, member: "John Smith", checkIn: "06:30 AM", checkOut: "08:15 AM", status: "present" },
  { id: 2, member: "Sarah Wilson", checkIn: "07:00 AM", checkOut: "09:30 AM", status: "present" },
  { id: 3, member: "Mike Johnson", checkIn: "08:15 AM", checkOut: null, status: "present" },
  { id: 4, member: "Emma Davis", checkIn: null, checkOut: null, status: "absent" },
  { id: 5, member: "James Brown", checkIn: "05:45 AM", checkOut: "07:00 AM", status: "present" },
  { id: 6, member: "Lisa Anderson", checkIn: "09:00 AM", checkOut: null, status: "present" },
  { id: 7, member: "Robert Taylor", checkIn: null, checkOut: null, status: "absent" },
];

export default function AttendanceOverview() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  /* ------------------------------ CALCULATIONS ----------------------------- */
  // TODO: Replace with API values later

  const totalMembers = 60;
  const presentCount = recentAttendance.filter(
    (a) => a.status === "present"
  ).length;
  const absentCount = totalMembers - presentCount;
  const attendanceRate = Math.round((presentCount / totalMembers) * 100);

  const formattedDate = useMemo(
    () => format(selectedDate, "MMMM d, yyyy"),
    [selectedDate]
  );

  return (
    <DashboardLayout title="Attendance Overview">
      <div className="space-y-6">

        {/* Header with Date Picker */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Attendance</h2>
            <p className="text-slate-400">Track member attendance</p>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="bg-slate-800 border-slate-700 text-white"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {formattedDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-slate-900 border-slate-700">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Members"
            value={totalMembers}
            icon={Users}
            gradient="from-violet-500 to-purple-600"
          />
          <StatCard
            title="Present Today"
            value={presentCount}
            icon={UserCheck}
            trend="up"
            trendValue={`${attendanceRate}%`}
            gradient="from-emerald-500 to-green-600"
          />
          <StatCard
            title="Absent Today"
            value={absentCount}
            icon={UserX}
            gradient="from-rose-500 to-red-600"
          />
          <StatCard
            title="Avg Duration"
            value="1.5 hrs"
            icon={Clock}
            gradient="from-amber-500 to-orange-600"
          />
        </div>

        {/* Charts and Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Weekly Chart */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Weekly Overview
                </h3>
                <p className="text-sm text-slate-400">
                  Attendance trend this week
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-violet-500" />
                  <span className="text-xs text-slate-400">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-xs text-slate-400">Absent</span>
                </div>
              </div>
            </div>

            <BarChartComponent
              data={weeklyData}
              dataKey="present"
              secondaryDataKey="absent"
              height={300}
            />
          </GlassCard>

          {/* Today's Attendance */}
          <GlassCard>
            <div className="p-6 border-b border-slate-700/50">
              <h3 className="text-lg font-semibold text-white">
                Today's Log
              </h3>
              <p className="text-sm text-slate-400">
                {format(selectedDate, "EEEE, MMMM d")}
              </p>
            </div>

            <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto">
              {recentAttendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        record.status === "present"
                          ? "bg-emerald-500/20"
                          : "bg-rose-500/20"
                      }`}
                    >
                      {record.status === "present" ? (
                        <UserCheck className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <UserX className="w-5 h-5 text-rose-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {record.member}
                      </p>
                      {record.checkIn && (
                        <p className="text-xs text-slate-500">
                          In: {record.checkIn}
                          {record.checkOut && ` • Out: ${record.checkOut}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <StatusBadge status={record.status} />
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Peak Hours */}
        <GlassCard className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Peak Hours</h3>
            <p className="text-sm text-slate-400">
              Busiest times at the gym
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {["6AM", "8AM", "10AM", "12PM", "2PM", "4PM", "6PM", "8PM"].map(
              (time, idx) => {
                const heights = [45, 75, 55, 40, 35, 60, 90, 65];
                return (
                  <div key={time} className="text-center">
                    <div className="h-24 flex items-end justify-center mb-2">
                      <div
                        className="w-8 rounded-t-lg bg-gradient-to-t from-violet-500 to-purple-500"
                        style={{ height: `${heights[idx]}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-400">{time}</span>
                  </div>
                );
              }
            )}
          </div>
        </GlassCard>

      </div>
    </DashboardLayout>
  );
}
