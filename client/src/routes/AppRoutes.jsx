import { Navigate, Route, Routes } from "react-router-dom";

import AuthLayout from "../layouts/AuthLayout";
import AppLayout from "../layouts/AppLayout";
import LoginPage from "../pages/auth/LoginPage";
import ForbiddenPage from "../pages/errors/ForbiddenPage";

import ProtectedRoute from "./ProtectedRoute";
import RoleRoute from "./RoleRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Authentication */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Application - Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>

          {/* All authenticated users */}
          <Route
            path="/dashboard"
            element={<div>Dashboard</div>}
          />

          <Route
            path="/attendance"
            element={<div>Attendance</div>}
          />

          <Route
            path="/overtime"
            element={<div>Overtime</div>}
          />

          <Route
            path="/reports"
            element={<div>Reports</div>}
          />

          {/* Manager + Admin only */}
          <Route
            element={
              <RoleRoute allowedRoles={["manager", "admin"]} />
            }
          >
            <Route
              path="/employees"
              element={<div>Employees</div>}
            />

            <Route
              path="/attendance/verification"
              element={<div>Attendance Verification</div>}
            />
          </Route>

        </Route>
      </Route>

      {/* Forbidden */}
      <Route
        path="/403"
        element={<ForbiddenPage />}
      />

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* 404 */}
      <Route
        path="*"
        element={<div>Page Not Found</div>}
      />
    </Routes>
  );
}

export default AppRoutes;