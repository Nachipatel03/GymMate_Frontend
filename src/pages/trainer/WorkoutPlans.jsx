import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import {
    Plus,
    Pencil,
    Trash2,
    Dumbbell,
    Search,
    Calendar,
    User
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';


import axios from "axios";
import apiRoutes from "../../services/ApiRoutes/ApiRoutes";



/* -------------------------------------------------------------------------- */
/* COMPONENT */
/* -------------------------------------------------------------------------- */

export default function WorkoutPlans() {

    const [workoutPlans, setWorkoutPlans] = useState([]);
    const [members, setMembers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletePlan, setDeletePlan] = useState(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        member_id: '',
        description: '',
        status: 'active',
        exercises: [],
        start_date: '',
        end_date: ''
    });

    const [newExercise, setNewExercise] = useState({
        name: '',
        sets: 3,
        reps: 10,
        day: 'Monday'
    });

    /* ---------------------------------------------------------------------- */
    /* TEMP LOAD (Replace with axios later) */
    /* ---------------------------------------------------------------------- */


    const validateForm = () => {
        if (!formData.name.trim()) {
            toast.error("Plan name is required");
            return false;
        }

        if (!formData.member_id) {
            toast.error("Please select a member");
            return false;
        }

        if (!formData.start_date) {
            toast.error("Start date is required");
            return false;
        }

        if (formData.end_date && formData.end_date < formData.start_date) {
            toast.error("End date cannot be before start date");
            return false;
        }

        if (formData.exercises.length === 0) {
            toast.error("Add at least one exercise");
            return false;
        }

        for (let exercise of formData.exercises) {
            if (!exercise.name.trim()) {
                toast.error("Exercise name cannot be empty");
                return false;
            }
            if (exercise.sets <= 0 || exercise.reps <= 0) {
                toast.error("Sets and reps must be greater than 0");
                return false;
            }
        }

        return true;
    };



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


    const fetchWorkoutPlans = async () => {
        try {
            const res = await axios.get(
                apiRoutes.baseUrl + apiRoutes.Admin + apiRoutes.WorkoutPlans,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            setWorkoutPlans(res.data);

        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch workout plans");
        }
    };

    useEffect(() => {

        fetchMembers();
        fetchWorkoutPlans();
    }, []);

    const handleEdit = (plan) => {
        setEditingPlan(plan);

        setFormData({
            name: plan.name,
            member_id: plan.member_id || '',
            description: plan.description,
            status: plan.status,
            exercises: plan.exercises || [],
            start_date: plan.start_date || '',
            end_date: plan.end_date || ''
        });

        setIsModalOpen(true);
    };
    const resetForm = () => {
        setFormData({
            name: '',
            member_id: '',
            description: '',
            status: 'active',
            exercises: [],
            start_date: '',
            end_date: ''
        });
        setNewExercise({ name: '', sets: 3, reps: 10, day: 'Monday' });
        setEditingPlan(null);
        setIsModalOpen(false);
    };

    const addExercise = () => {
        if (!newExercise.name.trim()) {
            toast.error("Exercise name is required");
            return;
        }

        if (newExercise.sets <= 0 || newExercise.reps <= 0) {
            toast.error("Sets and reps must be greater than 0");
            return;
        }

        setFormData({
            ...formData,
            exercises: [...formData.exercises, { ...newExercise }]
        });

        setNewExercise({ name: '', sets: 3, reps: 10, day: 'Monday' });
    };


    const removeExercise = (index) => {
        setFormData({
            ...formData,
            exercises: formData.exercises.filter((_, i) => i !== index)
        });
    };

    /* ---------------------------------------------------------------------- */
    /* SUBMIT */
    /* ---------------------------------------------------------------------- */

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const payload = {
                name: formData.name,
                member_id: formData.member_id,
                description: formData.description,
                status: formData.status,
                exercises: formData.exercises,
                start_date: formData.start_date || null,
                end_date: formData.end_date || null,
            };

            if (editingPlan) {
                // 🔥 UPDATE (PUT)
                await axios.put(
                    `${apiRoutes.baseUrl}${apiRoutes.Admin}${apiRoutes.WorkoutPlans}${editingPlan.id}/`,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                    }
                );

                toast.success("Workout plan updated");
            } else {
                // 🔥 CREATE (POST)
                await axios.post(
                    apiRoutes.baseUrl + apiRoutes.Admin + apiRoutes.WorkoutPlans,
                    payload,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                        },
                    }
                );

                toast.success("Workout plan created");
            }

            fetchWorkoutPlans();
            resetForm();

        } catch (error) {
            console.error(error);
            toast.error("Operation failed");
        }
    };



    const confirmDelete = async () => {
    if (!deletePlan) return;

    try {
        await axios.delete(
            `${apiRoutes.baseUrl}${apiRoutes.Admin}${apiRoutes.WorkoutPlans}${deletePlan.id}/`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                },
            }
        );

        toast.success("Workout plan deleted");
        fetchWorkoutPlans();
        setIsDeleteOpen(false);
        setDeletePlan(null);

    } catch (error) {
        console.error(error);
        toast.error("Failed to delete workout plan");
    }
};


    const filteredPlans = workoutPlans.filter(plan =>
        plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.member_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    /* ---------------------------------------------------------------------- */
    /* UI */
    /* ---------------------------------------------------------------------- */

    return (
        <DashboardLayout role="trainer" currentPage="WorkoutPlans" title="Workout Plans">
            <div className="space-y-6">

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Workout Plans</h2>
                    <Button onClick={() => setIsModalOpen(true)}
                        className="bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-600/20"
                    >

                        <Plus className="w-4 h-4" />
                        Create Plan
                    </Button>
                </div>

                {/* Search */}
                <GlassCard className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search workout plans..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </GlassCard>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPlans.map((plan, index) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <GlassCard className="h-full">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20">
                                            <Dumbbell className="w-6 h-6 text-violet-400" />
                                        </div>
                                        <StatusBadge status={plan.status} />
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{plan.description}</p>

                                    <div className="flex items-center gap-2 mb-4">
                                        <User className="w-4 h-4 text-slate-500" />
                                        <span className="text-sm text-slate-300">{plan.member_name || 'Assigned Member'}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar className="w-4 h-4 text-slate-500" />
                                        <span className="text-xs text-slate-500">
                                            {plan.start_date && format(new Date(plan.start_date), 'MMM d')} - {plan.end_date && format(new Date(plan.end_date), 'MMM d, yyyy')}
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-slate-700/50">
                                        <p className="text-xs text-slate-500 mb-2">Exercises:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(plan.exercises || []).slice(0, 3).map((ex, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 text-xs bg-slate-800 rounded-lg text-slate-300"
                                                >
                                                    {ex.name}
                                                </span>
                                            ))}
                                            {(plan.exercises?.length || 0) > 3 && (
                                                <span className="px-2 py-1 text-xs bg-slate-800 rounded-lg text-slate-500">
                                                    +{plan.exercises.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(plan)}
                                        className="text-slate-400 hover:text-white"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setDeletePlan(plan);
                                            setIsDeleteOpen(true);
                                        }}
                                        className="text-slate-400 hover:text-rose-400"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>


                {/* Create Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="custom-scrollbar bg-slate-900 border-slate-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingPlan ? "Edit Workout Plan" : "Create Workout Plan"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label>Plan Name</Label>
                                <Input
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="bg-slate-800 border-slate-700 text-white mt-1"
                                    placeholder="e.g., Upper Body Strength"
                                    required
                                />
                            </div>

                            <div>
                                <Label>Assign to Member</Label>
                                <Select
                                    value={formData.member_id}
                                    onValueChange={(value) => setFormData({ ...formData, member_id: value })}
                                >
                                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white mt-1">
                                        <SelectValue placeholder="Select member" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 border-slate-700">
                                        {members.map((member) => (
                                            <SelectItem key={member.id} value={String(member.id)}>
                                                {member.full_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-slate-800 border-slate-700 text-white mt-1"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Start Date</Label>
                                    <Input
                                        type="date"


                                        value={formData.start_date || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, start_date: e.target.value })
                                        }
                                        className="bg-slate-800 border-slate-700 text-white mt-1 focus:ring-2 focus:ring-violet-500"
                                    />
                                </div>

                                <div>
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.end_date || ''}
                                        onChange={(e) =>
                                            setFormData({ ...formData, end_date: e.target.value })
                                        }
                                        className="bg-slate-800 border-slate-700 text-white mt-1"
                                    />
                                </div>
                            </div>


                            {/* Exercises */}
                            <div>
                                <Label className="mb-2 block">Exercises</Label>
                                <div className="space-y-2 mb-3">
                                    {formData.exercises.map((ex, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                            <div>
                                                <p className="text-sm font-medium text-white">{ex.name}</p>
                                                <p className="text-xs text-slate-400">{ex.sets} sets × {ex.reps} reps • {ex.day}</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeExercise(idx)}
                                                className="text-rose-400"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-3 bg-slate-800/50 rounded-lg space-y-3">
                                    <Input
                                        value={newExercise.name}
                                        onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                                        placeholder="Exercise name"
                                        className="bg-slate-700 border-slate-600 text-white"
                                    />
                                    <div className="grid grid-cols-3 gap-2">
                                        <Input
                                            type="number"
                                            value={newExercise.sets}
                                            onChange={(e) => setNewExercise({ ...newExercise, sets: Number(e.target.value) })}
                                            placeholder="Sets"
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                        <Input
                                            type="number"
                                            value={newExercise.reps}
                                            onChange={(e) => setNewExercise({ ...newExercise, reps: Number(e.target.value) })}
                                            placeholder="Reps"
                                            className="bg-slate-700 border-slate-600 text-white"
                                        />
                                        <Select
                                            value={newExercise.day}
                                            onValueChange={(value) => setNewExercise({ ...newExercise, day: value })}
                                        >
                                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addExercise}
                                        className="w-full border-slate-600"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Exercise
                                    </Button>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={resetForm} className="border-slate-700 text-slate-300">
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-violet-500 to-purple-600"
                                >
                                    {editingPlan ? "Update Plan" : "Create Plan"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                    <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Delete Workout Plan</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Are you sure you want to delete{" "}
                                <span className="font-semibold text-white">
                                    {deletePlan?.name}
                                </span>
                                ? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleteOpen(false)}
                                className="border-slate-700 text-slate-300"
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={confirmDelete}
                                className="bg-rose-600 hover:bg-rose-700 text-white"
                            >
                                Delete
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </DashboardLayout>
    );
}
