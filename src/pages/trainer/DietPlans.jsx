import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Apple, Search, Flame, User, Info } from 'lucide-react';
import { toast } from 'sonner';
import axiosInterceptor from '@/api/axiosInterceptor';
import apiRoutes from '@/services/ApiRoutes/ApiRoutes';

export default function DietPlans() {
  const [dietPlans, setDietPlans] = useState([]);
  const [members, setMembers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    member_id: '',
    daily_calories: '',
    protein_grams: '',
    carbs_grams: '',
    fat_grams: '',
    notes: '',
    status: 'active',
    meals: []
  });

  const fetchDietPlans = async () => {
    try {
      const res = await axiosInterceptor.get(apiRoutes.Admin + apiRoutes.TrainerDietPlans);
      setDietPlans(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch diet plans");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axiosInterceptor.get(apiRoutes.Admin + apiRoutes.Members);
      // Only trainers can access this page, and the backend filters members by assigned trainer
      // if we use a specific "my-members" endpoint. For now, we use the regular members endpoint
      // which the backend should filter based on the logged-in trainer.
      const data = Array.isArray(res.data) ? res.data : res.data.results || [];
      setMembers(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDietPlans();
    fetchMembers();
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      member_id: '',
      daily_calories: '',
      protein_grams: '',
      carbs_grams: '',
      fat_grams: '',
      notes: '',
      status: 'active',
      meals: []
    });
    setEditingPlan(null);
    setIsModalOpen(false);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      member_id: plan.member, // Assuming the API returns the member UUID in 'member' field
      daily_calories: plan.daily_calories,
      protein_grams: plan.protein_grams,
      carbs_grams: plan.carbs_grams,
      fat_grams: plan.fat_grams,
      notes: plan.notes || '',
      status: plan.status,
      meals: plan.meals || []
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Convert string inputs to numbers
    const payload = {
      ...formData,
      daily_calories: parseInt(formData.daily_calories),
      protein_grams: parseInt(formData.protein_grams),
      carbs_grams: parseInt(formData.carbs_grams),
      fat_grams: parseInt(formData.fat_grams),
    };

    try {
      if (editingPlan) {
        await axiosInterceptor.put(apiRoutes.Admin + apiRoutes.TrainerDietPlanDetail(editingPlan.id), payload);
        toast.success("Diet plan updated");
      } else {
        await axiosInterceptor.post(apiRoutes.Admin + apiRoutes.TrainerDietPlans, payload);
        toast.success("Diet plan created");
      }
      fetchDietPlans();
      resetForm();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.detail || "Failed to save diet plan";
      toast.error(message);
    }
  };

  const handleAddMeal = () => {
    setFormData(prev => ({
      ...prev,
      meals: [...prev.meals, { name: '', description: '', calories: 0, protein: 0, carbs: 0, fat: 0 }]
    }));
  };

  const handleRemoveMeal = (index) => {
    setFormData(prev => ({
      ...prev,
      meals: prev.meals.filter((_, i) => i !== index)
    }));
  };

  const handleMealChange = (index, field, value) => {
    setFormData(prev => {
      const newMeals = [...prev.meals];
      newMeals[index] = { ...newMeals[index], [field]: value };
      return { ...prev, meals: newMeals };
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this diet plan?")) return;
    try {
      await axiosInterceptor.delete(apiRoutes.Admin + apiRoutes.TrainerDietPlanDetail(id));
      toast.success("Diet plan deleted");
      fetchDietPlans();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete diet plan");
    }
  };

  const filteredPlans = dietPlans.filter(plan =>
    plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.member_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="trainer" title="Diet Plans">
      <div className="space-y-6">

        {/* Header */}
        <PageHeader
          title="Diet Plans"
          subtitle="Create and manage nutrition plans for your members"
          action={
            <Button onClick={() => { setEditingPlan(null); resetForm(); setIsModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Create Plan
            </Button>
          }
        />

        {/* Search */}
        <GlassCard className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by plan name or member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </GlassCard>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredPlans.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="h-full flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                        <Apple className="text-emerald-400 w-6 h-6" />
                      </div>
                      <StatusBadge status={plan.status} />
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>

                    <div className="flex items-center gap-2 mb-4">
                      <User className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-300">
                        {plan.member_name}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                        <p className="text-violet-400 font-bold">{plan.protein_grams}g</p>
                        <p className="text-xs text-slate-500 uppercase">Protein</p>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                        <p className="text-cyan-400 font-bold">{plan.carbs_grams}g</p>
                        <p className="text-xs text-slate-500 uppercase">Carbs</p>
                      </div>
                      <div className="bg-slate-800/50 p-2 rounded-lg border border-slate-700/50">
                        <p className="text-amber-400 font-bold">{plan.fat_grams}g</p>
                        <p className="text-xs text-slate-500 uppercase">Fat</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <Flame className="text-orange-400 w-5 h-5" />
                        <span className="text-white font-semibold">
                          {plan.daily_calories} <span className="text-xs text-slate-400 font-normal">cal/day</span>
                        </span>
                      </div>
                    </div>

                    {plan.notes && (
                      <div className="mt-4 p-3 rounded-lg bg-slate-900/50 border border-slate-800/50 flex gap-2">
                        <Info className="w-4 h-4 text-slate-500 shrink-0" />
                        <p className="text-xs text-slate-400 line-clamp-2">{plan.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end gap-2 bg-slate-900/30">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(plan)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        ) : (
          <GlassCard className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Apple className="text-slate-600 w-8 h-8" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No diet plans found</h3>
            <p className="text-slate-400 max-w-xs mx-auto mb-6">
              {searchQuery ? `No results for "${searchQuery}"` : "You haven't created any diet plans yet. Get started by creating your first plan!"}
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Plan
            </Button>
          </GlassCard>
        )}

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Diet Plan" : "Create Diet Plan"}</DialogTitle>
              <DialogDescription className="text-slate-400">
                Set nutritional targets and meals for the diet plan.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Summer Shredding"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Assigned Member</Label>
                  <Select
                    value={formData.member_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, member_id: value })
                    }
                    required
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select Member" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                      {members.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Plan Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                  required
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={formData.daily_calories}
                    onChange={(e) =>
                      setFormData({ ...formData, daily_calories: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={formData.protein_grams}
                    onChange={(e) =>
                      setFormData({ ...formData, protein_grams: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={formData.carbs_grams}
                    onChange={(e) =>
                      setFormData({ ...formData, carbs_grams: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={formData.fat_grams}
                    onChange={(e) =>
                      setFormData({ ...formData, fat_grams: e.target.value })
                    }
                    className="bg-slate-800 border-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg font-semibold flex items-center gap-2">
                    Meals
                  </Label>
                  <Button type="button" size="sm" onClick={handleAddMeal} variant="outline" className="border-slate-700 hover:bg-slate-800">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Meal
                  </Button>
                </div>

                <div className="space-y-3">
                  {formData.meals.map((meal, index) => (
                    <div key={index} className="flex gap-2 items-start p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <div className="flex-1 space-y-2">
                        <Input
                          placeholder="Meal Name (e.g. Breakfast)"
                          value={meal.name}
                          onChange={(e) => handleMealChange(index, 'name', e.target.value)}
                          className="bg-slate-900 border-slate-700"
                          required
                        />
                        <Textarea
                          placeholder="Description / Ingredients"
                          value={meal.description}
                          onChange={(e) => handleMealChange(index, 'description', e.target.value)}
                          className="bg-slate-900 border-slate-700 min-h-[60px]"
                        />
                        <div className="grid grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-slate-500">Calories</Label>
                            <Input
                              type="number"
                              value={meal.calories}
                              onChange={(e) => handleMealChange(index, 'calories', parseInt(e.target.value) || 0)}
                              className="bg-slate-900 border-slate-700 h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-slate-500">Protein</Label>
                            <Input
                              type="number"
                              value={meal.protein}
                              onChange={(e) => handleMealChange(index, 'protein', parseInt(e.target.value) || 0)}
                              className="bg-slate-900 border-slate-700 h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-slate-500">Carbs</Label>
                            <Input
                              type="number"
                              value={meal.carbs}
                              onChange={(e) => handleMealChange(index, 'carbs', parseInt(e.target.value) || 0)}
                              className="bg-slate-900 border-slate-700 h-8 text-xs"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-slate-500">Fat</Label>
                            <Input
                              type="number"
                              value={meal.fat}
                              onChange={(e) => handleMealChange(index, 'fat', parseInt(e.target.value) || 0)}
                              className="bg-slate-900 border-slate-700 h-8 text-xs"
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMeal(index)}
                        className="text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {formData.meals.length === 0 && (
                    <p className="text-sm text-center py-4 text-slate-500 border border-dashed border-slate-700 rounded-lg">
                      No meals added yet. Click "Add Meal" below to start.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">General Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional dietary advice..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="bg-slate-800 border-slate-700"
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="ghost" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-violet-600 hover:bg-violet-700">
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
