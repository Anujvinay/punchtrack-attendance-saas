import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

import {
  FiHome,
  FiUsers,
  FiUserCheck,
  FiClock,
  FiWatch,
  FiBarChart2,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

import { api, useLogoutMutation } from "../../services/api";

const AdminLayout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [logout, { isLoading: isLoggingOut }] =
    useLogoutMutation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: FiHome,
    },
    {
      label: "Employees",
      path: "/admin/employees",
      icon: FiUsers,
    },
    {
      label: "Managers",
      path: "/admin/managers",
      icon: FiUserCheck,
    },
    {
      label: "Attendance",
      path: "/admin/attendance",
      icon: FiClock,
    },
    {
      label: "Overtime",
      path: "/admin/overtime",
      icon: FiWatch,
    },
    {
      label: "Reports",
      path: "/admin/reports",
      icon: FiBarChart2,
    },
  ];

  const handleLogout = async () => {
    try {
      // 1. Call backend logout API
      await logout().unwrap();

      // 2. Clear RTK Query cache.
      // This removes cached /auth/me user data.
      dispatch(api.util.resetApiState());

      // 3. Go to login and replace browser history.
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);

      // Clear frontend auth/cache even if the
      // logout request itself fails.
      dispatch(api.util.resetApiState());

      navigate("/login", { replace: true });
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-page flex">

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between h-14 px-4 bg-surface border-b border-border">
        <button
          type="button"
          onClick={() => setIsSidebarOpen(true)}
          aria-label="Open navigation menu"
          className="p-2 -ml-2 rounded-md text-text-body hover:bg-gray-100 transition-colors"
        >
          <FiMenu className="text-xl" />
        </button>

        <span className="text-sm font-semibold text-text-heading">
          Admin Panel
        </span>

        <div className="w-9" aria-hidden="true" />
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-gray-900/40"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-64 shrink-0 bg-surface border-r border-border min-h-screen flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo / Header */}
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-heading tracking-tight">
              Attendance SaaS
            </h1>

            <p className="text-sm text-text-secondary mt-1">
              Admin Panel
            </p>
          </div>

          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close navigation menu"
            className="lg:hidden p-1.5 -mr-1.5 rounded-md text-text-secondary hover:bg-gray-100 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-primary text-white"
                      : "text-text-body hover:bg-gray-100"
                  }`
                }
              >
                <Icon className="text-lg shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-body hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiLogOut className="text-lg shrink-0" />
            <span>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>

      </aside>

      {/* Page Content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <Outlet />
      </main>

    </div>
  );
};

export default AdminLayout;