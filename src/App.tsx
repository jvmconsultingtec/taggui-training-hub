
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import TrainingsList from "@/pages/TrainingsList";
import TrainingDetail from "@/pages/TrainingDetail";
import TrainingForm from "@/pages/TrainingForm";
import Progress from "@/pages/Progress";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Collaborators from "@/pages/Collaborators";
import Company from "@/pages/Company";
import NotFound from "@/pages/NotFound";
import ResetPassword from "@/pages/ResetPassword";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AdminRoute } from "@/components/auth/AdminRoute";
import AdminPanel from "@/pages/admin/AdminPanel";
import UserManagement from "@/pages/admin/UserManagement";
import UserGroups from "@/pages/admin/UserGroups";
import UserGroupForm from "@/pages/admin/UserGroupForm";
import GroupMembers from "@/pages/admin/GroupMembers";
import TrainingGroupAssignment from "@/pages/admin/TrainingGroupAssignment";
import Index from "@/pages/Index";
import { AuthProvider } from "@/hooks/useAuth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/trainings" element={<TrainingsList />} />
            <Route path="/trainings/:id" element={<TrainingDetail />} />
            <Route path="/trainings/new" element={<TrainingForm />} />
            <Route path="/trainings/edit/:id" element={<TrainingForm />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/collaborators" element={<Collaborators />} />
            <Route path="/company" element={<Company />} />
          </Route>
          
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/groups" element={<UserGroups />} />
            <Route path="/admin/groups/new" element={<UserGroupForm />} />
            <Route path="/admin/groups/edit/:id" element={<UserGroupForm />} />
            <Route path="/admin/groups/:groupId/members" element={<GroupMembers />} />
            <Route path="/admin/trainings/:trainingId/groups" element={<TrainingGroupAssignment />} />
          </Route>
          
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
