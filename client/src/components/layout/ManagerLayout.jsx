import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import {
  FiHome,
  FiUsers,
  FiClock,
  FiWatch,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";

const ManagerLayout = () => {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    {
      label: "Dashboard",
      path: "/manager/dashboard",
      icon: FiHome,
    },
    {
      label: "Team",
      path: "/manager/team",
      icon: FiUsers,
    },
    {
      label: "Attendance",
      path: "/manager/attendance",
      icon: FiClock,
    },
    {
      label: "Overtime",
      path: "/manager/overtime",
      icon: FiWatch,
    },
  ];

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
          Manager Panel
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

      <aside
        className={`w-64 shrink-0 bg-surface border-r border-border min-h-screen flex flex-col fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out lg:sticky lg:top-0 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        <div className="p-6 border-b border-border flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-heading tracking-tight">
              Attendance SaaS
            </h1>

            <p className="text-sm text-text-secondary mt-1">
              Manager Panel
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

        <div className="p-4 border-t border-border">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-text-body hover:bg-gray-100 transition-colors"
          >
            <FiLogOut className="text-lg shrink-0" />
            <span>Logout</span>
          </button>
        </div>

      </aside>

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;