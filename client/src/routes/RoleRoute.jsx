import { Navigate, Outlet } from "react-router-dom";

function RoleRoute({
  allowedRoles = [],
  userRole = "employee",
}) {
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}

export default RoleRoute;