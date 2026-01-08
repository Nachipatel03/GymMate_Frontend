import { Routes, Route } from "react-router-dom";
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admindashboard" element={<AdminDashboard />} />
      <Route path="/managemembers" element={<ManageMembers />} />
      <Route path="/managetrainers" element={<ManageTrainers />} />
      <Route path="/membershipplans" element={<MembershipPlans />} />
      <Route path="/attendanceoverview" element={<AttendanceOverview />} />
      <Route path="/paymentsrevenue" element={<PaymentsRevenue />} />
      <Route path="//memberdashboard" element={<MemberDashboard />} />
      <Route path="/myworkout" element={<MyWorkout />} />
      <Route path="/mydiet" element={<MyDiet />} />
      <Route path="/myprogress" element={<MyProgress />} />
      <Route path="/member/add" element={<AddProgress />} />
      <Route path="/myattendance" element={<MyAttendance />} />
      
    </Routes>
  );
}
