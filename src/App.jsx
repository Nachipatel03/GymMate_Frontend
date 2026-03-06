import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/layout/ProtectedRoute";
import Home from "@/pages/public/Home";
import Login from "@/pages/public/Login";
import Register from "@/pages/public/Register";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import ManageMembers from "@/pages/admin/ManageMembers";
import ManageTrainers from "@/pages/admin/ManageTrainers";
import MembershipPlans from "@/pages/admin/MembershipPlans";
import AttendanceOverview from "@/pages/admin/AttendanceOverview";
import PaymentsRevenue from "@/pages/admin/PaymentsRevenue";
import MemberDashboard from "@/pages/member/MemberDashboard";
import MyWorkout from "@/pages/member/MyWorkout";
import MyDiet from "@/pages/member/MyDiet";
import MyProgress from "@/pages/member/MyProgress";
import AddProgress from "@/pages/member/AddProgress";
import MyAttendance from "@/pages/member/MyAttendace";
import MemberProfile from "@/pages/member/MemberProfile";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import AssignedMembers from "./pages/trainer/AssignedMembers";
import WorkoutPlans from "./pages/trainer/WorkoutPlans";
import DietPlans from "./pages/trainer/DietPlans";
import TrainerAttendance from "./pages/trainer/TrainerAttendance";
import Notifications from "./pages/Notification";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Admin Routes */}
      <Route path="/admindashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/managemembers" element={<ProtectedRoute allowedRoles={["admin"]}><ManageMembers /></ProtectedRoute>} />
      <Route path="/managetrainers" element={<ProtectedRoute allowedRoles={["admin"]}><ManageTrainers /></ProtectedRoute>} />
      <Route path="/membershipplans" element={<ProtectedRoute allowedRoles={["admin"]}><MembershipPlans /></ProtectedRoute>} />
      <Route path="/attendanceoverview" element={<ProtectedRoute allowedRoles={["admin"]}><AttendanceOverview /></ProtectedRoute>} />
      <Route path="/paymentsrevenue" element={<ProtectedRoute allowedRoles={["admin"]}><PaymentsRevenue /></ProtectedRoute>} />

      {/* Member Routes */}
      <Route path="/memberdashboard" element={<ProtectedRoute allowedRoles={["member"]}><MemberDashboard /></ProtectedRoute>} />
      <Route path="/myworkout" element={<ProtectedRoute allowedRoles={["member"]}><MyWorkout /></ProtectedRoute>} />
      <Route path="/mydiet" element={<ProtectedRoute allowedRoles={["member"]}><MyDiet /></ProtectedRoute>} />
      <Route path="/myprogress" element={<ProtectedRoute allowedRoles={["member"]}><MyProgress /></ProtectedRoute>} />
      <Route path="/member/add" element={<ProtectedRoute allowedRoles={["member"]}><AddProgress /></ProtectedRoute>} />
      <Route path="/myattendance" element={<ProtectedRoute allowedRoles={["member"]}><MyAttendance /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={["member"]}><MemberProfile /></ProtectedRoute>} />

      {/* Trainer Routes */}
      <Route path="/trainerdashboard" element={<ProtectedRoute allowedRoles={["trainer"]}><TrainerDashboard /></ProtectedRoute>} />
      <Route path="/assignedmembers" element={<ProtectedRoute allowedRoles={["trainer"]}><AssignedMembers /></ProtectedRoute>} />
      <Route path="/workoutplans" element={<ProtectedRoute allowedRoles={["trainer"]}><WorkoutPlans /></ProtectedRoute>} />
      <Route path="/dietplans" element={<ProtectedRoute allowedRoles={["trainer"]}><DietPlans /></ProtectedRoute>} />
      <Route path="/trainerattendance" element={<ProtectedRoute allowedRoles={["trainer"]}><TrainerAttendance /></ProtectedRoute>} />

      {/* Shared Authenticated Routes */}
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

    </Routes>
  );
}
