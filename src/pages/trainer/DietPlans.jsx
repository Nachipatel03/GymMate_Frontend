import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import GlassCard from '@/components/ui/GlassCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Apple, Search, Flame, User } from 'lucide-react';
import { toast } from 'sonner';

const dummyDietPlans = [
  {
    id: 1,
    name: 'Muscle Building Diet',
    member_name: 'John Smith',
    daily_calories: 2800,
    protein_grams: 180,
    carbs_grams: 320,
    fat_grams: 80,
    status: 'active',
  },
];

const dummyMembers = [
  { id: "1", full_name: "John Smith" },
  { id: "2", full_name: "Sarah Wilson" },
];

export default function DietPlans() {
  const [dietPlans, setDietPlans] = useState(dummyDietPlans);
  const [members] = useState(dummyMembers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    member_id: '',
    daily_calories: 2000,
    protein_grams: 150,
    carbs_grams: 200,
    fat_grams: 70,
    notes: '',
    status: 'active'
  });

  const resetForm = () => {
    setFormData({
      name: '',
      member_id: '',
      daily_calories: 2000,
      protein_grams: 150,
      carbs_grams: 200,
      fat_grams: 70,
      notes: '',
      status: 'active'
    });
    setIsModalOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newPlan = {
      id: Date.now(),
      ...formData,
      member_name: members.find(m => m.id === formData.member_id)?.full_name
    };

    setDietPlans(prev => [...prev, newPlan]);
    toast.success("Diet plan created");
    resetForm();
  };

  const handleDelete = (id) => {
    setDietPlans(prev => prev.filter(plan => plan.id !== id));
    toast.success("Diet plan deleted");
  };

  const filteredPlans = dietPlans.filter(plan =>
    plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.member_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout role="trainer" title="Diet Plans">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Diet Plans</h2>
            <p className="text-slate-400">Create and manage nutrition plans</p>
          </div>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Plan
          </Button>
        </div>

        {/* Search */}
        <GlassCard className="p-4">
          <Input
            placeholder="Search diet plans..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </GlassCard>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard>
                <div className="p-6">
                  <div className="flex justify-between mb-4">
                    <Apple className="text-emerald-400" />
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
                    <div>
                      <p className="text-violet-400 font-bold">{plan.protein_grams}g</p>
                      <p className="text-xs text-slate-500">Protein</p>
                    </div>
                    <div>
                      <p className="text-cyan-400 font-bold">{plan.carbs_grams}g</p>
                      <p className="text-xs text-slate-500">Carbs</p>
                    </div>
                    <div>
                      <p className="text-amber-400 font-bold">{plan.fat_grams}g</p>
                      <p className="text-xs text-slate-500">Fat</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Flame className="text-orange-400" />
                    <span className="text-white font-semibold">
                      {plan.daily_calories} cal/day
                    </span>
                  </div>
                </div>

                <div className="px-6 py-4 border-t flex justify-end gap-2">
                  <Button variant="ghost" size="sm">
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

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Diet Plan</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Plan Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />

              <Select
                value={formData.member_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, member_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map(member => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button type="submit">Create</Button>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}
