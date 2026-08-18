import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForbiddenPage from "./pages/errors/ForbiddenPage";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import EmployeesPage from "./pages/admin/EmployeesPage";
import ManagersPage from "./pages/admin/ManagersPage";
import AddManagerPage from "./pages/admin/AddManagerPage";

import EditEmployeePage from "./pages/admin/EditEmployeePage";
import AdminAttendancePage from "./pages/admin/AdminAttendancePage";
import AdminOvertimePage from "./pages/admin/OvertimePage";
import ReportsPage from "./pages/admin/ReportsPage";

// Other Role Pages
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ManagerAttendancePage from "./pages/manager/AttendancePage";
import ManagerTeamPage from "./pages/manager/ManagerTeamPage";
import ManagerEmployeeDetailsPage from "./pages/manager/ManagerEmployeeDetailsPage";
import ManagerOvertimePage from "./pages/manager/OvertimePage";
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeAttendancePage from "./pages/employee/AttendancePage";
import EmployeeOvertimePage from "./pages/employee/OvertimePage";

// Security & Layouts
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./components/layout/AdminLayout";
import EmployeeLayout from "./components/layout/EmployeeLayout";
import ManagerLayout from "./components/layout/ManagerLayout";

const App = () => {
  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={<LoginPage />} />

      <Route path="/signup" element={<SignupPage />} />

      {/* Admin Routes - Nested Layout Approach */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Relative paths inside /admin */}
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="employees" element={<EmployeesPage />} />
        <Route path="managers" element={<ManagersPage />} />
        <Route path="managers/add" element={<AddManagerPage />} />
     
        <Route path="employees/:id/edit" element={<EditEmployeePage />} />
        <Route path="attendance" element={<AdminAttendancePage />} />
        <Route path="overtime" element={<AdminOvertimePage />} />
        <Route path="reports" element={<ReportsPage />} />
        
        {/* Default redirect for /admin */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Manager Routes - Nested Layout Approach */}
      <Route
        path="/manager"
        element={
          <ProtectedRoute roles={["manager"]}>
            <ManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={<ManagerDashboard />}
        />
        
        <Route
          path="team"
          element={<ManagerTeamPage />}
        />

        <Route
          path="team/:id"
          element={<ManagerEmployeeDetailsPage />}
        />
        
        <Route
          path="attendance"
          element={<ManagerAttendancePage />}
        />

        <Route
          path="overtime"
          element={<ManagerOvertimePage />}
        />

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />
      </Route>

      {/* Employee Routes - Nested Layout Approach */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute roles={["employee"]}>
            <EmployeeLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="dashboard"
          element={<EmployeeDashboard />}
        />

        <Route
          path="attendance"
          element={<EmployeeAttendancePage />}
        />

        <Route
          path="overtime"
          element={<EmployeeOvertimePage />}
        />

        <Route
          index
          element={<Navigate to="dashboard" replace />}
        />
      </Route>

      {/* Unauthorized */}
      <Route
        path="/unauthorized"
        element={<ForbiddenPage />}
      />

      {/* Unknown URL Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;