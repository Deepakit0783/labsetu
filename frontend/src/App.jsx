
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import AdminLayout from "./layouts/AdminLayout";
import LabLayout from "./layouts/LabLayout";
import AgentLayout from "./layouts/AgentLayout";

// Public pages
import Home from "./pages/Home";
import Tests from "./pages/Tests";
import TestDetails from "./pages/TestDetails";
import Labs from "./pages/Labs";
import Booking from "./pages/Booking";
import MyBookings from "./pages/MyBookings";
import MyReports from "./pages/MyReports";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Customer Dashboard
import Dashboard from "./pages/dashboard/DashboardHome.jsx";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageLabs from "./pages/admin/ManageLabs";
import ManageTests from "./pages/admin/ManageTests";
import ManageBookings from "./pages/admin/ManageBookings";
import ManageUsers from "./pages/admin/ManageUsers";
import CreateAgent from "./pages/admin/CreateAgent";
import ManageReports from "./pages/admin/ManageReports";
import LabStaff from "./pages/admin/LabStaff";

// Lab pages
import LabDashboard from "./pages/lab/LabDashboard";
import LabTests from "./pages/lab/LabTests";
import LabBookings from "./pages/lab/LabBookings";
import LabReports from "./pages/lab/LabReports";

// Agent pages
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentAssignments from "./pages/agent/AgentAssignments";
import AgentProfile from "./pages/agent/AgentProfile";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public and Customer Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/tests/:id" element={<TestDetails />} />
          <Route path="/labs" element={<Labs />} />
          <Route path="/booking" element={<Booking />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/reports" element={<MyReports />} />
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/dashboard"
            element={<Dashboard role="customer" />}
          />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Password Reset Routes */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="labs" element={<ManageLabs />} />
          <Route path="tests" element={<ManageTests />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="reports" element={<ManageReports />} />
          <Route path="agents/create" element={<CreateAgent />} />
          <Route path="lab-staff" element={<LabStaff />} />
        </Route>

        {/* Lab Routes */}
        <Route path="/lab" element={<LabLayout />}>
          <Route index element={<LabDashboard />} />
          <Route path="tests" element={<LabTests />} />
          <Route path="bookings" element={<LabBookings />} />
          <Route path="reports" element={<LabReports />} />
        </Route>

        {/* Agent Routes */}
        <Route path="/agent" element={<AgentLayout />}>
          <Route index element={<AgentDashboard />} />
          <Route path="assignments" element={<AgentAssignments />} />
          <Route path="profile" element={<AgentProfile />} />
        </Route>

        {/* 404 Route - Always keep last */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
