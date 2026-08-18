import { Outlet, useLocation } from "react-router-dom";

import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";

function AppLayout() {
  const location = useLocation();

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/attendance": "Attendance",
    "/overtime": "Overtime",
    "/reports": "Reports",
    "/employees": "Employees",
    "/attendance/verification": "Attendance Verification",
  };

  const title = pageTitles[location.pathname] || "Attendance Management";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <Sidebar role="employee" />

        <div className="min-w-0 flex-1">
          <Header title={title} />

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;