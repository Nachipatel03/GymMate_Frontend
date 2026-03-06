import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import StatusBadge from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { motion } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  Sparkles,
  Crown,
} from "lucide-react";
import { toastSuccess, toastError } from "@/utils/toastMessages";

import axios from "axios";
import apiRoutes from "../../services/ApiRoutes/ApiRoutes";


// const resupdate = await axios.put(
//   apiRoutes.baseUrl +
//   apiRoutes.Plans +
//   `membership-plans/${editingPlan.id}/`,
//   payload,
//   {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//     },
//   }
// );


// await axios.delete(
//   apiRoutes.baseUrl +
//   apiRoutes.Plans +
//   `membership-plans/${plan.id}/`,
//   {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem("access_token")}`,
//     },
//   }
// );


const planColors = {
  basic: "from-slate-500 to-slate-600",
  premium: "from-violet-500 to-purple-600",
  vip: "from-amber-500 to-orange-600",
};

const planIcons = {
  basic: null,
  premium: Sparkles,
  vip: Crown,
};

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export default function MembershipPlans() {

  const [plans, setPlans] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [deletePlan, setDeletePlan] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "basic",
    duration_months: 1,
    price: "",
    features: "",
    is_active: true,
  });



  const validatePlanForm = (data) => {
    if (!data.name.trim()) {
      toastError.validation("Plan name is required");
      return false;
    }

    if (!data.type) {
      toastError.validation("Plan type is required");
      return false;
    }

    if (!data.duration_months || data.duration_months < 1) {
      toastError.validation("Duration must be at least 1 month");
      return false;
    }

    if (data.price === "" || isNaN(Number(data.price))) {
      toastError.validation("Price must be a valid number");
      return false;
    }

    if (Number(data.price) <= 0) {
      toastError.validation("Price must be greater than 0");
      return false;
    }

    if (!data.features.trim()) {
      toastError.validation("Please add at least one feature");
      return false;
    }

    return true;
  };

  /* -------------------- GET -------------------- */
  const fetchPlans = async () => {
    try {
      const resget = await axios.get(
        apiRoutes.baseUrl +
        apiRoutes.Admin +
        apiRoutes.Plans,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log("API response:", resget.data);
      setPlans(resget.data);

    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch plans");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  /* -------------------- POST -------------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePlanForm(formData)) return;

    const payload = {
      ...formData,
      price: Number(formData.price),
      features: formData.features
        .split("\n")
        .map((f) => f.trim())
        .filter(Boolean),
    };

    try {
      if (editingPlan) {
        // 🔄 UPDATE
        await axios.put(
          apiRoutes.baseUrl +
          apiRoutes.Admin +
          apiRoutes.PlansDetails(editingPlan.id),
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        toastSuccess.updated("Plan");
      } else {
        // ➕ CREATE
        await axios.post(
          apiRoutes.baseUrl +
          apiRoutes.Admin +
          apiRoutes.Plans,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        toastSuccess.created("Plan");
      }

      fetchPlans();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save plan");
    }
  };



  /* ------------------------------ HELPERS ---------------------------------- */

  const resetForm = () => {
    setFormData({
      name: "",
      type: "basic",
      duration_months: 1,
      price: "",
      features: "",
      is_active: true,
    });
    setEditingPlan(null);
    setIsModalOpen(false);
  };

  /* ------------------------------ CRUD ------------------------------------- */

  const handleEdit = (plan) => {
    if ((plan.assigned_members_count ?? 0) > 0) {
      toastError.forbidden(
        "Plan is assigned to members and cannot be updated"
      );
      return;
    }

    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      type: plan.type,
      duration_months: plan.duration_months,
      price: plan.price,
      features: plan.features.join("\n"),
      is_active: plan.is_active,
    });
    setIsModalOpen(true);
  };




  const handleDeleteClick = (plan) => {
    setDeletePlan(plan);
    if ((plan.assigned_members_count ?? 0) > 0) {
      toastError.forbidden(
        "Plan is assigned to members and cannot be deleted"
      );
      return;
    }
  };


  const confirmDelete = async () => {
    if (!deletePlan) return;

    try {
      await axios.delete(
        apiRoutes.baseUrl +
        apiRoutes.Admin +
        apiRoutes.PlansDetails(deletePlan.id),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toastSuccess.deleted("Plan");
      fetchPlans();
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        "Failed to delete plan";

      toastError.forbidden(message);
    } finally {
      setDeletePlan(null);
    }
  };

  /* ------------------------------- UI -------------------------------------- */

  return (
    <DashboardLayout title="Membership Plans">
      <div className="space-y-6">

        {/* Header */}
        <PageHeader
          title="Membership Plans"
          subtitle="Manage your gym membership plans"
          action={
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Plan
            </Button>
          }
        />

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const Icon = planIcons[plan.type];
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="overflow-hidden h-full">
                  <div
                    className={`bg-gradient-to-r ${planColors[plan.type]
                      } p-6`}
                  >
                    {/* {Icon && (
                      <Icon className="w-8 h-8 text-white/80 mb-3" />
                    )} */}
                    <h3 className="text-xl font-bold text-white">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl font-bold text-white">
                        ${plan.price}
                      </span>
                      <span className="text-white/70">
                        /{plan.duration_months} mo
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-3 text-slate-300"
                        >
                          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <Check className="w-3 h-3 text-emerald-400" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <StatusBadge
                        status={plan.is_active ? "active" : "inactive"}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(plan)}
                        >
                          <Pencil className="w-4 h-4 text-white " />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(plan)}
                        >
                          <Trash2 className="w-4 h-4 text-rose-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Edit Plan" : "Create Plan"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Configure membership plan details
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Plan Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plan Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration (months)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.duration_months}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        duration_months: Number(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Price ($)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label>Features (one per line)</Label>
                <textarea
                  value={formData.features}
                  onChange={(e) =>
                    setFormData({ ...formData, features: e.target.value })
                  }
                  className="w-full min-h-[120px] rounded-md border border-slate-700 bg-slate-800 p-3 text-sm text-white placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingPlan ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={!!deletePlan}
          onOpenChange={() => setDeletePlan(null)}
        >
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Plan</DialogTitle>
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
                onClick={() => setDeletePlan(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
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
