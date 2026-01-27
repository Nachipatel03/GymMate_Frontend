import React, { useState, useMemo, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import GlassCard from "@/components/ui/GlassCard";
import DataTable from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  UserCog,
  Filter,
  Award,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";


import axios from "axios";
import apiRoutes from "../../services/ApiRoutes/ApiRoutes";

const INITIAL_MEMBERS = [{ id: 1, assigned_trainer_id: 1 }, { id: 2, assigned_trainer_id: 1 }, { id: 3, assigned_trainer_id: 2 },];

/* -------------------------------------------------------------------------- */
/*                                COMPONENT                                   */
/* -------------------------------------------------------------------------- */

export default function ManageTrainers() {
  /* ------------------------------ STATE ----------------------------------- */

  const [trainers, setTrainers] = useState([]);


  const fetchTrainers = async () => {
    try {
      const res = await axios.get(
        apiRoutes.baseUrl + apiRoutes.Admin +
        apiRoutes.Trainers,
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
      console.error(error);
      toast.error("Failed to fetch trainers");
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const [members] = useState(INITIAL_MEMBERS);
  // TODO: Replace with API data

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("all");


  const initialTrainerForm = {
    full_name: "",
    email: "",
    phone: "",
    specialization: "general",
    experience_years: "",
    bio: "",
    status: "active",
  };


  const [formData, setFormData] = useState(initialTrainerForm);

  /* ------------------------------ HELPERS ---------------------------------- */

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      phone: "",
      specialization: "general",
      experience_years: "",
      bio: "",
      status: "active",
    });
    setEditingTrainer(null);
    setIsModalOpen(false);
  };

  const getAssignedMembersCount = (trainerId) =>
    members.filter((m) => m.assigned_trainer_id === trainerId).length;

  /* ------------------------------ CRUD ------------------------------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      experience_years: formData.experience_years
        ? Number(formData.experience_years)
        : null,
    };

    try {
      if (editingTrainer) {
        // ✅ UPDATE
        await axios.patch(
          apiRoutes.baseUrl +
          apiRoutes.Admin +
          apiRoutes.TrainerDetail(editingTrainer.id),
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        toast.success("Trainer updated successfully");
      } else {
        await axios.post(
          apiRoutes.baseUrl +
          apiRoutes.Admin +
          apiRoutes.Trainers,
          payload,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );

        toast.success("Trainer added successfully");
      }

      fetchTrainers();
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save trainer");
    }
  };


  const handleEdit = (trainer) => {
    setEditingTrainer(trainer);
    setFormData({
      full_name: trainer.full_name || "",
      email: trainer.trainer_email || "",
      phone: trainer.phone || "",
      specialization: trainer.specialization || "general",
      experience_years: trainer.experience_years || "",
      bio: trainer.bio || "",
      status: trainer.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (trainer) => {
    if (!confirm(`Remove ${trainer.full_name}?`)) return;

    try {
      await axios.delete(
        apiRoutes.baseUrl +
        apiRoutes.Admin +
        apiRoutes.TrainerDetail(trainer.id),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success("Trainer deleted");
      fetchTrainers();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete trainer");
    }
  };
  /* ------------------------------ FILTER ----------------------------------- */

  const filteredTrainers = useMemo(() => {
    const query = (searchQuery ?? "").toLowerCase();

    return trainers.filter((trainer) => {
      const fullName = (trainer?.full_name ?? "").toLowerCase();
      const email = (trainer?.email ?? "").toLowerCase();

      const matchesSearch =
        fullName.includes(query) || email.includes(query);

      const matchesSpec =
        filterSpecialization === "all" ||
        trainer?.specialization === filterSpecialization;

      return matchesSearch && matchesSpec;
    });
  }, [trainers, searchQuery, filterSpecialization]);

  /* --------------------------- TABLE COLUMNS ------------------------------- */

  const columns = [
    {
      header: "Trainer",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-medium">
              {row.full_name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-white">{row.full_name}</p>
            <p className="text-xs text-slate-400">{row.trainer_email}</p>
          </div>
        </div>
      ),
    },
    { header: "Phone", accessor: "phone" },
    {
      header: "Specialization",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-violet-400" />
          <span className="capitalize text-slate-300">
            {row.specialization}
          </span>
        </div>
      ),
    },
    {
      header: "Experience",
      render: (row) => (
        <span className="text-slate-300">
          {row.experience_years ? `${row.experience_years} years` : "-"}
        </span>
      ),
    },
    {
      header: "Assigned Members",
      accessor: "assigned_members_count",
      render: (row) => (
        <span className="text-white font-medium">
          {row.assigned_members_count ?? 0}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
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
    <DashboardLayout title="Manage Trainers">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Trainers</h2>
            <p className="text-slate-400">Manage your gym trainers</p>
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={() => {
              setEditingTrainer(null);
              setFormData(initialTrainerForm);
              setIsModalOpen(true);
            }}
          >
            <UserCog className="w-4 h-4 mr-2" />
            Add Trainer
          </Button>
        </div>

        {/* Filters */}
        <GlassCard className="p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search trainers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={filterSpecialization}
            onValueChange={setFilterSpecialization}
          >
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="strength">Strength</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="yoga">Yoga</SelectItem>
              <SelectItem value="crossfit">CrossFit</SelectItem>
              <SelectItem value="nutrition">Nutrition</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
        </GlassCard>

        {/* Table */}

        <GlassCard className="p-0">
          <div className="relative max-h-[420px] overflow-y-auto overflow-x-hidden custom-scrollbar">
            <DataTable columns={columns} data={filteredTrainers} />
          </div>
        </GlassCard>

        {/* Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingTrainer ? "Edit Trainer" : "Add Trainer"}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter trainer details below
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
                    disabled={Boolean(editingTrainer)}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
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
                  <Label>Specialization</Label>
                  <Select
                    value={formData.specialization}
                    onValueChange={(value) =>
                      setFormData({ ...formData, specialization: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strength">Strength</SelectItem>
                      <SelectItem value="cardio">Cardio</SelectItem>
                      <SelectItem value="yoga">Yoga</SelectItem>
                      <SelectItem value="crossfit">CrossFit</SelectItem>
                      <SelectItem value="nutrition">Nutrition</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Experience (years)</Label>
                  <Input
                    type="number"
                    value={formData.experience_years}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experience_years: e.target.value,
                      })
                    }
                  />
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
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2">
                  <Label>Bio</Label>
                  <Textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {editingTrainer ? "Update" : "Add Trainer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
}

