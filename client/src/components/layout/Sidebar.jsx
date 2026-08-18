import { NavLink } from "react-router-dom";

const navigation = {
  employee: [
    {
      label: "Dashboard",
      to: "/dashboard",
    },
    {
      label: "Attendance",
      to: "/attendance",
    },
    {
      label: "Overtime",
      to: "/overtime",
    },
    {
      label: "Reports",
      to: "/reports",
    },
  ],

  manager: [
    {
      label: "Dashboard",
      to: "/dashboard",
    },
    {
      label: "Employees",
      to: "/employees",
    },
    {
      label: "Attendance",
      to: "/attendance",
    },
    {
      label: "Verification",
      to: "/attendance/verification",
    },
    {
      label: "Overtime",
      to: "/overtime",
    },
    {
      label: "Reports",
      to: "/reports",
    },
  ],

  admin: [
    {
      label: "Dashboard",
      to: "/dashboard",
    },
    {
      label: "Employees",
      to: "/employees",
    },
    {
      label: "Attendance",
      to: "/attendance",
    },
    {
      label: "Verification",
      to: "/attendance/verification",
    },
    {
      label: "Overtime",
      to: "/overtime",
    },
    {
      label: "Reports",
      to: "/reports",
    },
  ],
};

function Sidebar({ role = "employee" }) {
  const items = navigation[role] || navigation.employee;

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-lg font-semibold text-gray-900">
          Attendance
        </h1>

        <p className="mt-1 text-sm text-gray-500">
          Management System
        </p>
      </div>

      <nav
        className="flex-1 space-y-1 p-4"
        aria-label="Main navigation"
      >
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "border-l-2 border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-200 p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Role
        </div>

        <div className="mt-1 text-sm font-medium capitalize text-gray-700">
          {role}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;