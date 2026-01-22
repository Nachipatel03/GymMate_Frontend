import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
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
import {
  Search,
  Pencil,
  Trash2,
  UserPlus,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";


import axios from "axios";
import apiRoutes from "../../services/ApiRoutes/ApiRoutes";







/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export default function ManageMembers() {
  /* ------------------------------ STATE ----------------------------------- */

  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);

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
  }, []);


  const fetchTrainers = async () => {
    try {
      const res = await axios.get(
        apiRoutes.baseUrl + apiRoutes.Admin + apiRoutes.Trainers,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
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



  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    membership_plan: "basic",
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
      membership_plan: "basic",
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

    const payload = {
      ...formData,
      email: formData.email.toLowerCase(),
      height: formData.height ? Number(formData.height) : null,
      weight: formData.weight ? Number(formData.weight) : null,
      assigned_trainer:
        formData.assigned_trainer_id === "none"
          ? null
          : formData.assigned_trainer_id,
    };

    try {
      await axios.post(
        apiRoutes.baseUrl + apiRoutes.Admin + apiRoutes.Members,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success("Member created");
      fetchMembers();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to create member");
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setFormData({
      ...member,
      assigned_trainer_id: member.assigned_trainer_id || "none",
    });
    setIsModalOpen(true);
  };

  const handleDelete = (member) => {
    if (confirm(`Delete ${member.full_name}?`)) {
      // TODO: DELETE MEMBER API
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      toast.success("Member deleted");
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
      render: (row) => <StatusBadge status={row.membership_plan} />,
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
        row.created_at
          ? format(new Date(row.created_at), "MMM dd, yyyy")
          : "-",
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
            onClick={() => handleDelete(row)}
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Members</h2>
            <p className="text-slate-400">Manage your gym members</p>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Member
          </Button>
        </div>

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

        {/* Table */}
        <GlassCard>
          <DataTable columns={columns} data={filteredMembers} />
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
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label>Membership Plan</Label>
                  <Select
                    value={formData.membership_plan}
                    onValueChange={(value) =>
                      setFormData({ ...formData, membership_plan: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key="basic" value="basic">Basic</SelectItem>
                      <SelectItem key="premium" value="premium">Premium</SelectItem>
                      <SelectItem key="vip" value="vip">VIP</SelectItem>
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

      </div>
    </DashboardLayout>
  );
}
