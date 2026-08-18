import { useNavigate } from "react-router-dom";
import { useGetManagersQuery } from "../../services/api";

const ManagersPage = () => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
  } = useGetManagersQuery();

  const managers = data?.data?.managers || [];

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-surface rounded-xl border border-border shadow-sm p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-5 w-48 bg-gray-200 rounded" />
              <div className="h-4 w-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="min-h-screen bg-gray-100 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-status-error-bg border border-status-error-text/20 rounded-xl p-6">
            <p className="text-status-error-text">
              Failed to load managers.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
              Managers
            </h1>

            <p className="text-text-secondary mt-1">
              Manage manager accounts
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/managers/add")
            }
            className="px-5 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-hover active:bg-brand-active transition-colors self-start sm:self-auto"
          >
            Add Manager
          </button>
        </div>

        <div className="bg-surface rounded-xl border border-border shadow-sm overflow-hidden">
          {managers.length === 0 ? (
            <div className="p-8 text-text-secondary text-sm text-center">
              No managers found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-100/70 border-b border-border">
                  <tr>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Name</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Email</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Role</th>
                    <th className="p-4 text-xs font-semibold uppercase tracking-wide text-text-secondary whitespace-nowrap">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {managers.map((manager) => (
                    <tr
                      key={manager._id}
                      className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-text-heading whitespace-nowrap">
                        {manager.name}
                      </td>

                      <td className="p-4 text-text-body whitespace-nowrap">
                        {manager.email}
                      </td>

                      <td className="p-4 text-text-body whitespace-nowrap">
                        Manager
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            manager.isActive
                              ? "bg-status-success-bg text-status-success-text"
                              : "bg-status-error-bg text-status-error-text"
                          }`}
                        >
                          {manager.isActive
                            ? "active"
                            : "inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ManagersPage;