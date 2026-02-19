import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import DataTable from '@/components/ui/DataTable';
import StatusBadge from '@/components/ui/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Search,
    Filter,
    Target,
    Dumbbell,
    Apple,
    TrendingUp,
    MessageCircle
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { motion } from 'framer-motion';

import axios from "axios";
import apiRoutes from "../../services/ApiRoutes/ApiRoutes";
/* -------------------------------------------------------------------------- */
/* TEMP DATA (Remove later when API is connected) */
/* -------------------------------------------------------------------------- */




const dummyMembers = [
    {
        id: 1,
        full_name: 'John Smith',
        email: 'john@email.com',
        phone: '+1 234 567',
        goal: 'muscle_gain',
        status: 'active',
        progress: 75,
        hasWorkout: true,
        hasDiet: true
    },
    {
        id: 2,
        full_name: 'Sarah Wilson',
        email: 'sarah@email.com',
        phone: '+1 345 678',
        goal: 'weight_loss',
        status: 'active',
        progress: 60,
        hasWorkout: true,
        hasDiet: true
    },
];

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

    /* ---------------------------------------------------------------------- */
    /* TEMP LOAD (Replace with axios API later) */
    /* ---------------------------------------------------------------------- */

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



    useEffect(() => {
        fetchMembers();
        // setMembers(dummyMembers);
    }, []);

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

                                        {/* Progress */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-xs text-slate-400">Goal Progress</span>
                                                <span className="text-sm font-medium text-white">{member.progress || 0}%</span>
                                            </div>
                                            <Progress value={member.progress || 0} className="h-2 bg-slate-700" />
                                        </div>

                                        {/* Plans Status */}
                                        <div className="flex gap-2 mb-4">
                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${member.workout_plans?.length > 0
                                                ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                                                : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                <Dumbbell className="w-3 h-3" />
                                                Workout
                                            </div>

                                            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs ${member.diet_plans?.length > 0
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-slate-800 text-slate-500'
                                                }`}>
                                                <Apple className="w-3 h-3" />
                                                Diet
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 border-t border-slate-700/50 flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
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
                                    header: 'Progress',
                                    accessor: 'progress',
                                    render: (row) => (
                                        <div className="flex items-center gap-2">
                                            <Progress value={row.progress || 0} className="h-2 w-20 bg-slate-700" />
                                            <span className="text-sm text-white">{row.progress || 0}%</span>
                                        </div>
                                    )
                                },
                                {
                                    header: 'Status',
                                    accessor: 'status',
                                    render: (row) => <StatusBadge status={row.status} />
                                }
                            ]}
                            data={filteredMembers}
                        />
                    </GlassCard>
                )}

            </div>
        </DashboardLayout>
    );
}
