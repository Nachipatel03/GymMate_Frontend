import { Toaster } from "sonner";
import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import PageHeader from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toastSuccess, toastError } from "@/utils/toastMessages";
import { isEmailValid, isPhoneValid } from "@/utils/validators";
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
import {
  Search,
  Pencil,
  Trash2,
  UserPlus,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import PaymentModal from "@/components/ui/PaymentModal";


import axiosInterceptor from "@/api/axiosInterceptor";
import apiRoutes from "../../services/ApiRoutes/ApiRoutes";


export default function ManageMembers() {

  /* ------------------------------ STATE ----------------------------------- */

  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [plans, setPlans] = useState([]);

  const validateMemberForm = () => {
    if (!formData.full_name || formData.full_name.trim().length < 3) {
      toastError.validation("Full name must be at least 3 characters");
      return false;
    }

    if (!editingMember && !formData.email) {
      toastError.validation("Email is required");
      return false;
    }

    if (!editingMember && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toastError.validation("Enter a valid email address");
      return false;
    }

    if (formData.phone && !/^[0-9]{10,15}$/.test(formData.phone)) {
      toastError.validation("Phone must be 10–15 digits");
      return false;
    }

    if (!editingMember && (!formData.membership_plan_id || formData.membership_plan_id === "none")) {

      toastError.validation("Please select a membership plan");
      return false;
    }

    if (formData.height && Number(formData.height) <= 0) {
      toastError.validation("Height must be a positive number");
      return false;
    }

    if (formData.weight && Number(formData.weight) <= 0) {
      toastError.validation("Weight must be a positive number");
      return false;
    }

    return true;
  };

  // const createPayment = async (memberId, planId, amount) => {
  //   try {
  //     const response = await axios.post(
  //       apiRoutes.baseUrl + apiRoutes.Payments,
  //       {
  //         member: memberId,
  //         plan: planId,
  //         amount: amount,
  //         payment_method: "cash", // static for now
  //       },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //         },
  //       }
  //     );

  //     toast.success("Payment successful & Membership activated 🎉");
  //     return response.data;

  //   } catch (error) {
  //     toast.error("Payment failed");
  //     console.error(error);
  //   }
  // };

  const fetchMembers = async () => {
    try {
      const res = await axiosInterceptor.get(
        apiRoutes.Admin + apiRoutes.Members
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
  }, []);


  const fetchTrainers = async () => {
    try {
      const res = await axiosInterceptor.get(
        apiRoutes.Admin + apiRoutes.Trainers
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data.results || [];

      setTrainers(data);
    } catch (error) {
      toast.error("Failed to load trainers");
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);


  const fetchPlans = async () => {
    try {
      const resget = await axiosInterceptor.get(
        apiRoutes.Admin +
        apiRoutes.Plans
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


  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteMember, setDeleteMember] = useState(null);

  // Payment modal state
  const [paymentModal, setPaymentModal] = useState({
    open: false,
    memberId: null,
    plan: null,
    memberName: "",
    mode: null, // "create" | "activate"
  });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [pendingCreatePayload, setPendingCreatePayload] = useState(null); // stores form data for deferred create

  const isEditMode = Boolean(editingMember);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    membership_plan_id: "none",
    status: "active",
    goal: "maintenance",
    height: "",
    weight: "",
    assigned_trainer_id: "none", // ✅ MUST exist
  });
  /* --------------------------- FILTER LOGIC -------------------------------- */

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || member.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [members, searchQuery, filterStatus]);

  /* ------------------------------ HELPERS ---------------------------------- */

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      membership_plan_id: "none",
      status: "active",
      goal: "maintenance",
      height: "",
      weight: "",
      assigned_trainer_id: "none", // ✅ required
    });

    setEditingMember(null);
    setIsModalOpen(false);
  };

  /* ------------------------------ CRUD ------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateMemberForm()) return;

    const payload = editingMember
      ? {
        assigned_trainer:
          formData.assigned_trainer_id === "none"
            ? null
            : formData.assigned_trainer_id,
        status: formData.status,
        goal: formData.goal,
      }
      : {
        full_name: formData.full_name,
        phone: formData.phone,
        status: formData.status,
        goal: formData.goal,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        assigned_membership: formData.membership_plan_id,
        assigned_trainer:
          formData.assigned_trainer_id === "none"
            ? null
            : formData.assigned_trainer_id,
      };

    try {
      if (editingMember) {

        const planChanged =
          formData.membership_plan_id &&
          formData.membership_plan_id !== "none" &&
          formData.membership_plan_id !== editingMember.active_membership?.plan_id;

        // Update basic member fields first
        await axiosInterceptor.patch(
          apiRoutes.Admin +
          apiRoutes.MemberDetail(editingMember.id),
          {
            assigned_trainer:
              formData.assigned_trainer_id === "none"
                ? null
                : formData.assigned_trainer_id,
            status: formData.status,
            goal: formData.goal,
          }
        );

        if (planChanged) {
          // 💳 Open Payment Modal instead of directly submitting
          const selectedPlan = plans.find(
            (plan) => String(plan.id) === String(formData.membership_plan_id)
          );

          if (!selectedPlan) {
            toast.error("Selected plan not found");
            return;
          }

          setIsModalOpen(false);
          setPaymentModal({
            open: true,
            memberId: editingMember.id,
            plan: selectedPlan,
            memberName: editingMember.full_name,
            mode: "activate",
          });
          return; // wait for payment confirmation
        } else {
          toastSuccess.updated("Member");
        }

      } else {
        // 💳 CREATE: open PaymentModal FIRST — don't create member yet
        const selectedPlan = plans.find(
          (plan) => String(plan.id) === String(formData.membership_plan_id)
        );

        if (!selectedPlan) {
          toast.error("Selected plan not found");
          return;
        }

        // Store the payload for use after payment confirmation
        setPendingCreatePayload({
          ...payload,
          email: formData.email.toLowerCase(),
          plan: selectedPlan,
          memberName: formData.full_name,
        });

        setIsModalOpen(false);
        setPaymentModal({
          open: true,
          memberId: null,         // ← no ID yet, member not created
          plan: selectedPlan,
          memberName: formData.full_name,
          mode: "create",
        });
        return; // wait for payment confirmation
      }

      fetchMembers();
      resetForm();

    } catch (error) {
      console.error(error);

      if (error.response?.status === 400) {
        const errors = error.response.data;

        Object.keys(errors).forEach((field) => {
          if (Array.isArray(errors[field])) {
            toastError.validation(errors[field][0]);
          } else {
            toastError.validation(errors[field]);
          }
        });

        return;
      }

      toast.error("Operation failed");
    }
  };

  /* ------------------------- PAYMENT CONFIRM ----------------------------- */

  const handlePaymentConfirm = async (paymentMethod, dueDate) => {
    setPaymentLoading(true);
    try {
      let memberId = paymentModal.memberId;

      // For CREATE mode: first create the member, then process payment
      if (paymentModal.mode === "create" && pendingCreatePayload) {
        const { plan, memberName, ...createPayload } = pendingCreatePayload;
        const memberResponse = await axiosInterceptor.post(
          apiRoutes.Admin + apiRoutes.Members,
          createPayload
        );
        memberId = memberResponse.data.member_id;
      }

      // Now call payment API
      await axiosInterceptor.post(
        apiRoutes.Admin + apiRoutes.Payments,
        {
          member: memberId,
          plan: paymentModal.plan.id,
          amount: paymentModal.plan.price,
          payment_method: paymentMethod,
          status: paymentMethod === "pay_later" ? "pending" : "completed",
          due_date: dueDate,
        }
      );

      if (paymentModal.mode === "create") {
        toastSuccess.created("Member & Membership Activated");
      } else {
        toastSuccess.created("Membership Activated");
      }

      setPaymentModal({ open: false, memberId: null, plan: null, memberName: "", mode: null });
      setPendingCreatePayload(null);
      fetchMembers();
      resetForm();
    } catch (error) {
      console.error(error);

      if (error.response?.status === 400) {
        const errors = error.response.data;
        Object.keys(errors).forEach((field) => {
          if (Array.isArray(errors[field])) {
            toastError.validation(errors[field][0]);
          } else {
            toastError.validation(errors[field]);
          }
        });
        return;
      }

      toast.error("Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };


  const handleEdit = (member) => {
    setEditingMember(member);

    setFormData({
      full_name: member.full_name,
      email: member.email,
      phone: member.phone || "",

      // ✅ DIRECT UUID mapping
      membership_plan_id: member.active_membership?.plan_id ?? "none",

      assigned_trainer_id: member.assigned_trainer_id ?? "none",

      status: member.status,
      goal: member.goal,

      height: member.height || "",
      weight: member.weight || "",
    });

    setIsModalOpen(true);
  };


  const handleDeleteClick = (member) => {
    setDeleteMember(member);
  };

  const confirmDelete = async () => {
    if (!deleteMember) return;

    try {
      await axiosInterceptor.delete(
        apiRoutes.Admin +
        apiRoutes.MemberDetail(deleteMember.id)
      );

      toastSuccess.deleted("Member");
      fetchMembers();
    } catch (error) {
      console.error(error);
      const serverError = error.response?.data?.error || error.response?.data?.detail;
      if (serverError) {
        toastError.custom(serverError);
      } else {
        toastError.delete("Member");
      }
    } finally {
      setDeleteMember(null);
    }
  };


  /* --------------------------- TABLE COLUMNS ------------------------------- */

  const columns = [
    {
      header: "Member",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-medium">
              {row.full_name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-white">{row.full_name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    { header: "Phone", accessor: "phone" },
    {
      header: "Plan",
      accessor: "active_membership",
      render: (row) => {
        const membership = row.active_membership;
        if (!membership) return <StatusBadge status="none" />;

        return (
          <div className="flex flex-col items-start gap-1">
            <StatusBadge status={membership.plan_name} />
            {membership.start_date && membership.end_date && (
              <span className="text-[10px] text-slate-500 whitespace-nowrap">
                {format(new Date(membership.start_date), "MMM d")} - {format(new Date(membership.end_date), "MMM d, yyyy")}
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Goal",
      render: (row) => (
        <span className="capitalize text-slate-400">
          {row.goal.replace("_", " ")}
        </span>
      ),
    },
    {
      header: "Joined",
      render: (row) =>
        row.join_date
          ? format(new Date(row.join_date), "MMM dd, yyyy")
          : "-",
    },
    {
      header: "Assign Trainer",
      render: (row) => (
        <span className="capitalize text-slate-400">
          {row.assigned_trainer_name
            ? row.assigned_trainer_name.replace("_", " ")
            : "—"}
        </span>
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button size="icon" variant="ghost" onClick={() => handleEdit(row)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDeleteClick(row)}
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
          </Button>
        </div>
      ),
    },
  ];

  /* ------------------------------- UI -------------------------------------- */

  return (
    <DashboardLayout title="Manage Members">
      <div className="space-y-6">

        {/* Header */}
        <PageHeader
          title="Members"
          subtitle="Manage your gym members"
          action={
            <Button
              type="button"
              variant="primary"
              onClick={() => {
                setEditingMember(null);
                setFormData({
                  full_name: "",
                  email: "",
                  phone: "",
                  membership_plan_id: "none",
                  status: "active",
                  goal: "maintenance",
                  height: "",
                  weight: "",
                  assigned_trainer_id: "none",
                });
                setIsModalOpen(true);
              }}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          }
        />

        {/* Filters */}
        <GlassCard className="p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="all" value="all">All</SelectItem>
              <SelectItem key="active" value="active">Active</SelectItem>
              <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
              <SelectItem key="expired" value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </GlassCard>

        <GlassCard className="p-0">
          <div className="relative max-h-[1000px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <DataTable columns={columns} data={filteredMembers} />
          </div>
        </GlassCard>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingMember ? "Edit Member" : "Add New Member"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter gym member details below
              </DialogDescription>
            </DialogHeader>


            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">

                <div className="col-span-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.full_name}
                    disabled={isEditMode}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    disabled={isEditMode}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    disabled={isEditMode}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Membership Plans</Label>

                  <Select
                    value={String(formData.membership_plan_id ?? "none")}
                    disabled={isEditMode && !editingMember?.can_change_plan}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        membership_plan_id: value === "none" ? null : value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Plan" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="none">
                        No Plan
                      </SelectItem>

                      {plans.map((plan) => (
                        <SelectItem
                          key={plan.id}
                          value={String(plan.id)}
                        >
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="active" value="active">Active</SelectItem>
                      <SelectItem key="inactive" value="inactive">Inactive</SelectItem>
                      <SelectItem key="expired" value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Fitness Goal</Label>
                  <Select
                    value={formData.goal}
                    onValueChange={(value) =>
                      setFormData({ ...formData, goal: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="weight_loss" value="weight_loss">Weight Loss</SelectItem>
                      <SelectItem key="muscle_gain" value="muscle_gain">Muscle Gain</SelectItem>
                      <SelectItem key="maintenance" value="maintenance">Maintenance</SelectItem>
                      <SelectItem key="endurance" value="endurance">Endurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Assign Trainer</Label>


                  <Select
                    value={String(formData.assigned_trainer_id ?? "none")}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        assigned_trainer_id: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trainer" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem key="none" value="none">
                        No Trainer
                      </SelectItem>

                      {trainers.map((trainer) => (
                        <SelectItem
                          key={trainer.id}
                          value={String(trainer.id)}
                        >
                          {trainer.full_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Height (cm)</Label>
                  <Input
                    type="number"
                    value={formData.height}
                    disabled={isEditMode}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Weight (kg)</Label>
                  <Input
                    type="number"
                    value={formData.weight}
                    disabled={isEditMode}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingMember ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={!!deleteMember} onOpenChange={() => setDeleteMember(null)}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-sm">
            <DialogHeader>
              <DialogTitle>Delete Member</DialogTitle>
              <DialogDescription className="text-slate-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {deleteMember?.full_name}
                </span>
                ? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteMember(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 💳 Payment Modal */}
        <PaymentModal
          isOpen={paymentModal.open}
          onClose={() =>
            setPaymentModal({ open: false, memberId: null, plan: null, memberName: "", mode: null })
          }
          onConfirm={handlePaymentConfirm}
          plan={paymentModal.plan}
          memberName={paymentModal.memberName}
          loading={paymentLoading}
        />

      </div>
    </DashboardLayout>
  );
}
