import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/Layout/ProtectedRoute";
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
import AdminProfile from "@/pages/admin/AdminProfile";
import EmailTemplates from "@/pages/admin/EmailTemplates";
import Settings from "@/pages/admin/Settings";
import TrainerDashboard from "./pages/trainer/TrainerDashboard";
import AssignedMembers from "./pages/trainer/AssignedMembers";
import WorkoutPlans from "./pages/trainer/WorkoutPlans";
import DietPlans from "./pages/trainer/DietPlans";
import TrainerAttendance from "./pages/trainer/TrainerAttendance";
import Notifications from "./pages/Notification";
import MemberPlans from "@/pages/member/MemberPlans";
import MyPlans from "@/pages/member/MyPlans";
import BMIChecker from "@/pages/member/BMIChecker";
import ChangePassword from "@/pages/member/ChangePassword";
import ForgotPassword from "@/pages/public/ForgotPassword";
import ResetPasswordConfirm from "@/pages/public/ResetPasswordConfirm";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password-confirm/:uid/:token" element={<ResetPasswordConfirm />} />

      {/* Admin Routes */}
      <Route path="/admindashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/managemembers" element={<ProtectedRoute allowedRoles={["admin"]}><ManageMembers /></ProtectedRoute>} />
      <Route path="/managetrainers" element={<ProtectedRoute allowedRoles={["admin"]}><ManageTrainers /></ProtectedRoute>} />
      <Route path="/membershipplans" element={<ProtectedRoute allowedRoles={["admin"]}><MembershipPlans /></ProtectedRoute>} />
      <Route path="/attendanceoverview" element={<ProtectedRoute allowedRoles={["admin"]}><AttendanceOverview /></ProtectedRoute>} />
      <Route path="/paymentsrevenue" element={<ProtectedRoute allowedRoles={["admin"]}><PaymentsRevenue /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={["admin"]}><AdminProfile /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute allowedRoles={["admin"]}><Settings /></ProtectedRoute>} />
      <Route path="/emailtemplates" element={<ProtectedRoute allowedRoles={["admin"]}><EmailTemplates /></ProtectedRoute>} />

      {/* Member Routes */}
      <Route path="/memberdashboard" element={<ProtectedRoute allowedRoles={["member"]}><MemberDashboard /></ProtectedRoute>} />
      <Route path="/myworkout" element={<ProtectedRoute allowedRoles={["member"]}><MyWorkout /></ProtectedRoute>} />
      <Route path="/mydiet" element={<ProtectedRoute allowedRoles={["member"]}><MyDiet /></ProtectedRoute>} />
      <Route path="/myprogress" element={<ProtectedRoute allowedRoles={["member"]}><MyProgress /></ProtectedRoute>} />
      <Route path="/member/add" element={<ProtectedRoute allowedRoles={["member"]}><AddProgress /></ProtectedRoute>} />
      <Route path="/myattendance" element={<ProtectedRoute allowedRoles={["member"]}><MyAttendance /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute allowedRoles={["member"]}><MemberProfile /></ProtectedRoute>} />
      <Route path="/memberplans" element={<ProtectedRoute allowedRoles={["member"]}><MemberPlans /></ProtectedRoute>} />
      <Route path="/my-plans" element={<ProtectedRoute allowedRoles={["member"]}><MyPlans /></ProtectedRoute>} />
      <Route path="/bmichecker" element={<ProtectedRoute allowedRoles={["member"]}><BMIChecker /></ProtectedRoute>} />

      {/* Trainer Routes */}
      <Route path="/trainerdashboard" element={<ProtectedRoute allowedRoles={["trainer"]}><TrainerDashboard /></ProtectedRoute>} />
      <Route path="/assignedmembers" element={<ProtectedRoute allowedRoles={["trainer"]}><AssignedMembers /></ProtectedRoute>} />
      <Route path="/workoutplans" element={<ProtectedRoute allowedRoles={["trainer"]}><WorkoutPlans /></ProtectedRoute>} />
      <Route path="/dietplans" element={<ProtectedRoute allowedRoles={["trainer"]}><DietPlans /></ProtectedRoute>} />
      <Route path="/trainerattendance" element={<ProtectedRoute allowedRoles={["trainer"]}><TrainerAttendance /></ProtectedRoute>} />

      {/* Shared Authenticated Routes */}
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

    </Routes>
  );
}
