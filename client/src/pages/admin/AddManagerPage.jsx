import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";

import {
  useCreateManagerMutation,
} from "../../services/api";
import useFormDraft from "../../hooks/useFormDraft";

const INITIAL_FORM = {
  name: "",
  email: "",
};

const AddManagerPage = () => {
  const navigate = useNavigate();

  const [createManager, { isLoading }] =
    useCreateManagerMutation();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    values: form,
    setValues: setForm,
    clearDraft,
  } = useFormDraft(
    "attendance-saas-add-manager-draft",
    INITIAL_FORM
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();

    if (name.length < 2 || name.length > 100) {
      setError(
        "Name must be between 2 and 100 characters."
      );
      return;
    }

    if (
      password.length < 8 ||
      password.length > 128
    ) {
      setError(
        "Password must be between 8 and 128 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await createManager({
        name,
        email,
        password,
      }).unwrap();

      clearDraft();
      setPassword("");
      setConfirmPassword("");

      navigate("/admin/managers", {
        replace: true,
      });
    } catch (error) {
      console.error(
        "Create manager failed:",
        error
      );

      setError(
        error?.data?.message ||
          "Failed to create manager."
      );
    }
  };

  const inputClasses =
    "w-full border border-input-border rounded-lg p-3 text-text-body placeholder:text-text-disabled bg-surface focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary transition-colors disabled:bg-gray-100 disabled:text-text-disabled disabled:cursor-not-allowed";

  return (
    <main className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">

        <button
          type="button"
          onClick={() =>
            navigate("/admin/managers")
          }
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-brand-primary transition-colors mb-5"
        >
          <FiArrowLeft />
          Back to Managers
        </button>

        <div className="bg-surface rounded-xl border border-border shadow-sm p-5 sm:p-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading tracking-tight">
            Add Manager
          </h1>

          <p className="text-text-secondary mt-1 mb-6">
            Create a new manager account
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-lg bg-status-error-bg border border-status-error-text/20 flex items-start gap-2">
              <FiAlertCircle className="text-status-error-text mt-0.5 shrink-0" />
              <p className="text-status-error-text text-sm">{error}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Name */}
            <div>
              <label className="block mb-2 text-sm font-medium text-text-body">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                minLength={2}
                maxLength={100}
                required
                disabled={isLoading}
                className={inputClasses}
                placeholder="Rahul Manager"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block mb-2 text-sm font-medium text-text-body">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className={inputClasses}
                placeholder="rahul.manager@company.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-text-body">
                Password
              </label>

              <div className="relative">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={isLoading}
                  className={`${inputClasses} pr-12`}
                  placeholder="Enter password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <FiEyeOff className="text-lg" />
                  ) : (
                    <FiEye className="text-lg" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block mb-2 text-sm font-medium text-text-body">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  maxLength={128}
                  required
                  disabled={isLoading}
                  className={`${inputClasses} pr-12`}
                  placeholder="Confirm password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (prev) => !prev
                    )
                  }
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-brand-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="text-lg" />
                  ) : (
                    <FiEye className="text-lg" />
                  )}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() =>
                  navigate("/admin/managers")
                }
                disabled={isLoading}
                className="px-5 py-2.5 border border-border rounded-lg text-text-body hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="px-5 py-2.5 bg-brand-primary text-white rounded-lg hover:bg-brand-hover active:bg-brand-active transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Creating..."
                  : "Create Manager"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
};

export default AddManagerPage;