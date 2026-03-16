import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AreaChartComponent from '@/components/charts/AreaChartComponent';
import {
    Search,
    Filter,
    Target,
    Dumbbell,
    Apple,
    TrendingUp,
    MessageCircle,
    Scale,
    Loader2,
    TrendingDown,
    Trophy
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

import axios from "axios";
import axiosInterceptor from '@/api/axiosInterceptor';
import apiRoutes from "../../services/ApiRoutes/ApiRoutes";

const goalColors = {
    weight_loss: 'text-rose-400',
    muscle_gain: 'text-violet-400',
    endurance: 'text-cyan-400',
    maintenance: 'text-emerald-400'
};

/* -------------------------------------------------------------------------- */
/* COMPONENT */
/* -------------------------------------------------------------------------- */

export default function AssignedMembers() {

    const [members, setMembers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGoal, setFilterGoal] = useState('all');
    const [viewMode, setViewMode] = useState('grid');

    // Progress Modal State
    const [progressModal, setProgressModal] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [progressLogs, setProgressLogs] = useState([]);
    const [progressLoading, setProgressLoading] = useState(false);

    const fetchMembers = async () => {
        try {
            const res = await axios.get(
                apiRoutes.baseUrl + apiRoutes.Admin + apiRoutes.Members,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            const data = Array.isArray(res.data)
                ? res.data
                : res.data.results || [];

            setMembers(data);

        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch members");
        }
    };

    const handleViewProgress = async (member) => {
        setSelectedMember(member);
        setProgressModal(true);
        setProgressLogs([]);
        setProgressLoading(true);
        try {
            const res = await axiosInterceptor.get(
                apiRoutes.Admin + apiRoutes.TrainerMemberProgress(member.id)
            );
            setProgressLogs(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load progress data");
        } finally {
            setProgressLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* PROGRESS CHART DATA */
    /* ---------------------------------------------------------------------- */

    const chartData = useMemo(() => {
        if (!progressLogs.length) return [];
        const uniqueDays = {};
        progressLogs.forEach(log => {
            const dayKey = format(parseISO(log.date), 'yyyy-MM-dd');
            uniqueDays[dayKey] = { date: log.date, weight: log.weight };
        });
        return Object.values(uniqueDays)
            .map(p => ({
                name: format(parseISO(p.date), 'MMM d, yyyy'),
                weight: p.weight,
                rawDate: p.date
            }))
            .sort((a, b) => parseISO(a.rawDate).getTime() - parseISO(b.rawDate).getTime());
    }, [progressLogs]);

    const currentWeight = progressLogs.length > 0 ? progressLogs[progressLogs.length - 1].weight : null;
    const startWeight = progressLogs.length > 0 ? progressLogs[0].weight : null;
    const goalWeight = selectedMember?.goal_weight;
    const weightChanged = (startWeight && currentWeight) ? (startWeight - currentWeight).toFixed(1) : null;

    const goalProgress = useMemo(() => {
        if (!startWeight || !currentWeight || !goalWeight || startWeight === goalWeight) return 0;
        const totalToChange = goalWeight - startWeight;
        const totalChanged = currentWeight - startWeight;
        return Math.min(100, Math.max(0, (totalChanged / totalToChange) * 100));
    }, [startWeight, currentWeight, goalWeight]);

    /* ---------------------------------------------------------------------- */
    /* FILTER LOGIC */
    /* ---------------------------------------------------------------------- */

    const filteredMembers = members.filter(member => {
        const matchesSearch =
            member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.email?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesGoal =
            filterGoal === 'all' || member.goal === filterGoal;

        return matchesSearch && matchesGoal;
    });

    /* ---------------------------------------------------------------------- */
    /* UI */
    /* ---------------------------------------------------------------------- */

    return (
        <DashboardLayout role="trainer" currentPage="AssignedMembers" title="My Members">
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Assigned Members</h2>
                        <p className="text-slate-400">Manage and track your members' progress</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className={
                                viewMode === 'grid'
                                    ? 'bg-violet-600 hover:bg-violet-700 text-white'
                                    : 'border border-slate-700 text-slate-400 hover:bg-slate-800'
                            }
                        >
                            Grid
                        </Button>
                        <Button
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className={
                                viewMode === 'list'
                                    ? 'bg-violet-600 hover:bg-violet-700 text-white'
                                    : 'border border-slate-700 text-slate-400 hover:bg-slate-800'
                            }
                        >
                            List
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <GlassCard className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search members..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <Select value={filterGoal} onValueChange={setFilterGoal}>
                            <SelectTrigger className="w-full sm:w-48">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Filter by goal" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Goals</SelectItem>
                                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
                                <SelectItem value="endurance">Endurance</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </GlassCard>

                {/* Grid View */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMembers.map((member, index) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <GlassCard className="h-full">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                                    <span className="text-white text-lg font-bold">
                                                        {member.full_name?.charAt(0) || 'M'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-white">{member.full_name}</h3>
                                                    <p className="text-xs text-slate-500">{member.email}</p>
                                                </div>
                                            </div>
                                            <StatusBadge status={member.status} />
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            <Target className={`w-4 h-4 ${goalColors[member.goal] || 'text-slate-400'}`} />
                                            <span className={`text-sm capitalize ${goalColors[member.goal] || 'text-slate-400'}`}>
                                                {member.goal?.replace('_', ' ') || 'Not set'}
                                            </span>
                                        </div>

                                        {/* Plans Status */}
                                        <div className="flex gap-2 mb-4">
                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${member.workout_plans?.length > 0
                                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                                : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                <Dumbbell className="w-3 h-3" />
                                                Workout {member.workout_plans?.length > 0 && `(${member.workout_plans.length})`}
                                            </div>

                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${member.diet_plans?.length > 0
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                <Apple className="w-3 h-3" />
                                                Diet {member.diet_plans?.length > 0 && `(${member.diet_plans.length})`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 border-t border-slate-700/50 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-slate-700 text-slate-300 hover:bg-violet-600/20 hover:border-violet-500/50 hover:text-violet-300 transition-colors"
                                            onClick={() => handleViewProgress(member)}
                                        >
                                            <TrendingUp className="w-4 h-4 mr-2" />
                                            Progress
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                                        >
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Message
                                        </Button>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <GlassCard>
                        <DataTable
                            columns={[
                                {
                                    header: 'Member',
                                    accessor: 'full_name',
                                    render: (row) => (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                                                <span className="text-white font-medium">{row.full_name?.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{row.full_name}</p>
                                                <p className="text-xs text-slate-500">{row.email}</p>
                                            </div>
                                        </div>
                                    )
                                },
                                { header: 'Phone', accessor: 'phone' },
                                {
                                    header: 'Goal',
                                    accessor: 'goal',
                                    render: (row) => (
                                        <span className={`capitalize ${goalColors[row.goal] || 'text-slate-400'}`}>
                                            {row.goal?.replace('_', ' ') || '-'}
                                        </span>
                                    )
                                },
                                {
                                    header: 'Status',
                                    accessor: 'status',
                                    render: (row) => <StatusBadge status={row.status} />
                                },
                                {
                                    header: 'Actions',
                                    accessor: 'id',
                                    render: (row) => (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewProgress(row)}
                                            className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10"
                                        >
                                            <TrendingUp className="w-4 h-4 mr-1" />
                                            Progress
                                        </Button>
                                    )
                                }
                            ]}
                            data={filteredMembers}
                        />
                    </GlassCard>
                )}

                {/* ---- Progress Modal ---- */}
                <Dialog open={progressModal} onOpenChange={setProgressModal}>
                    <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                    {selectedMember?.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-lg font-bold">{selectedMember?.full_name}</p>
                                    <p className="text-xs text-slate-400 capitalize font-normal">{selectedMember?.goal?.replace('_', ' ') || 'No goal set'}</p>
                                </div>
                            </DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Body weight progress tracking history
                            </DialogDescription>
                        </DialogHeader>

                        {progressLoading ? (
                            <div className="flex justify-center py-16">
                                <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
                            </div>
                        ) : progressLogs.length === 0 ? (
                            <div className="text-center py-16">
                                <Scale className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                                <p className="text-slate-400">No progress logs recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Stats Row */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-800/60 rounded-xl p-4 text-center border border-slate-700/50">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Current</p>
                                        <p className="text-2xl font-bold text-white">{currentWeight}<span className="text-sm text-slate-400 ml-1">kg</span></p>
                                    </div>
                                    <div className="bg-slate-800/60 rounded-xl p-4 text-center border border-slate-700/50">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                                            {parseFloat(weightChanged) >= 0 ? 'Gained' : 'Lost'}
                                        </p>
                                        <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${parseFloat(weightChanged) <= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {parseFloat(weightChanged) <= 0
                                                ? <TrendingDown className="w-5 h-5" />
                                                : <TrendingUp className="w-5 h-5" />
                                            }
                                            {Math.abs(weightChanged)}<span className="text-sm font-normal ml-1">kg</span>
                                        </p>
                                    </div>
                                    <div className="bg-slate-800/60 rounded-xl p-4 text-center border border-slate-700/50">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Goal</p>
                                        <p className="text-2xl font-bold text-violet-400">{goalWeight || '—'}<span className="text-sm text-slate-400 ml-1">kg</span></p>
                                    </div>
                                </div>

                                {/* Goal Progress Bar */}
                                {goalWeight && (
                                    <div>
                                        <div className="flex justify-between text-xs text-slate-400 mb-2">
                                            <span>Goal Progress</span>
                                            <span className="text-violet-400 font-semibold">{goalProgress.toFixed(0)}%</span>
                                        </div>
                                        <Progress value={goalProgress} className="h-2 bg-slate-700" />
                                        <div className="flex items-center gap-1 mt-2">
                                            <Trophy className="w-3 h-3 text-amber-400" />
                                            <span className="text-xs text-slate-500">Target: {goalWeight} kg</span>
                                        </div>
                                    </div>
                                )}

                                {/* Chart */}
                                <div>
                                    <p className="text-sm font-semibold text-slate-300 mb-3">Weight Over Time</p>
                                    <AreaChartComponent
                                        data={chartData}
                                        dataKey="weight"
                                        color="#8b5cf6"
                                        height={220}
                                        gradientId="progressGrad"
                                    />
                                </div>

                                {/* Latest Logs Table */}
                                <div>
                                    <p className="text-sm font-semibold text-slate-300 mb-3">Recent Logs</p>
                                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                        {[...progressLogs].reverse().slice(0, 10).map((log, i) => (
                                            <div key={log.id || i} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg border border-slate-700/30">
                                                <span className="text-xs text-slate-400">{format(parseISO(log.date), 'MMM d, yyyy')}</span>
                                                <span className="text-sm font-semibold text-white">{log.weight} kg</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardLayout>
    );
}
