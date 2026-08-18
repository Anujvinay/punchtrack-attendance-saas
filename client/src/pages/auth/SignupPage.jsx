import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../services/api";
import useFormDraft from "../../hooks/useFormDraft";
import { FiEye, FiEyeOff, FiUser, FiMail, FiLock, FiAlertCircle, FiCheckCircle, FiBriefcase, FiHash, FiPhone, FiCalendar } from "react-icons/fi";

const INITIAL_FORM = {
  name: "",
  email: "",
  employeeId: "",
  department: "",
  designation: "",
  phone: "",
  joiningDate: "",
};

const SignupPage = () => {
  const navigate = useNavigate();

  const [register, { isLoading }] = useRegisterMutation();

  const {
    values: formData,
    setValues: setFormData,
    clearDraft,
  } = useFormDraft(
    "attendance-saas-signup-draft",
    INITIAL_FORM
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const employeeId = formData.employeeId.trim();
    const department = formData.department.trim();
    const designation = formData.designation.trim();
    const phone = formData.phone.trim();
    const joiningDate = formData.joiningDate;

    if (!name) {
      setError("Name is required.");
      return;
    }

    if (name.length < 2 || name.length > 100) {
      setError("Name must be between 2 and 100 characters.");
      return;
    }

    if (!email) {
      setError("Email is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password.length > 128) {
      setError("Password cannot exceed 128 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (employeeId.length < 2 || employeeId.length > 30) {
      setError("Employee ID must be between 2 and 30 characters.");
      return;
    }

    if (department.length < 2 || department.length > 100) {
      setError("Department must be between 2 and 100 characters.");
      return;
    }

    if (!designation) {
      setError("Designation is required.");
      return;
    }

    if (!joiningDate) {
      setError("Joining date is required.");
      return;
    }

    try {
      await register({
        name,
        email,
        password,
        employeeId,
        department,
        designation,
        phone,
        joiningDate,
      }).unwrap();

      setSuccess("Account created successfully. Redirecting to login...");

      clearDraft();
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (registrationError) {
      setError(
        registrationError?.data?.message ||
          "Unable to create account. Please try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex">
      {/* Left — brand / illustration panel */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-1/2 relative overflow-hidden bg-slate-900">
        <div className="absolute -top-24 -left-20 w-80 h-80 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.05] [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px]" />

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-12 text-white w-full">
          <div className="flex items-center gap-2">
            <span className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <ClockMark className="w-5 h-5 text-indigo-400" />
            </span>
            <span className="text-xl font-bold tracking-tight">
              Punch<span className="text-indigo-400">Track</span>
            </span>
          </div>

          <div className="my-auto py-12">
            <AttendanceIllustration className="w-full max-w-sm mx-auto drop-shadow-2xl" />
          </div>

          <div className="max-w-sm">
            <p className="text-2xl font-semibold leading-snug tracking-tight">
              Verified attendance. Smarter workforce management.
            </p>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed">
              Track attendance with live selfie and location verification,
              manage teams and overtime, and keep every workday accountable.
            </p>
          </div>
        </div>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-1 items-center justify-center px-4 sm:px-6 py-10 sm:py-12">
        <div className="w-full max-w-xl">
          <div className="lg:hidden flex flex-col items-center gap-2 mb-8 text-center">
            <span className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ClockMark className="w-5 h-5 text-indigo-600" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Punch<span className="text-indigo-600">Track</span>
            </span>
            <p className="text-xs text-slate-500 max-w-[260px]">
              Verified attendance. Smarter workforce management.
            </p>
          </div>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Create your account
            </h1>
            <p className="text-slate-500 mt-1.5 text-sm">
              Set up access to the attendance system.
            </p>
          </div>

          {error && (
            <div role="alert" className="mb-5 flex items-center gap-2 p-3 rounded-lg bg-rose-50 text-rose-700 border border-rose-100 text-sm">
              <FiAlertCircle className="shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div role="status" className="mb-5 flex items-center gap-2 p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm">
              <FiCheckCircle className="shrink-0" size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">

            {/* ACCOUNT INFORMATION */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Account Information
              </p>

              <div>
                <label htmlFor="signup-name" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    id="signup-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    autoComplete="name"
                    maxLength={100}
                    disabled={isLoading}
                    placeholder="Enter your name"
                    className="w-full border border-slate-300 pl-10 pr-3 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:bg-slate-100 transition"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    maxLength={254}
                    disabled={isLoading}
                    placeholder="you@company.com"
                    className="w-full border border-slate-300 pl-10 pr-3 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:bg-slate-100 transition"
                  />
                </div>
              </div>
            </div>

            {/* EMPLOYEE INFORMATION */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Employee Information
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-employeeId" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Employee ID
                  </label>
                  <div className="relative">
                    <FiHash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      id="signup-employeeId"
                      name="employeeId"
                      type="text"
                      value={formData.employeeId}
                      onChange={handleChange}
                      maxLength={30}
                      disabled={isLoading}
                      placeholder="EMP001"
                      className="w-full border border-slate-300 pl-10 pr-3 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:bg-slate-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-department" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Department
                  </label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      id="signup-department"
                      name="department"
                      type="text"
                      value={formData.department}
                      onChange={handleChange}
                      maxLength={100}
                      disabled={isLoading}
                      placeholder="Engineering"
                      className="w-full border border-slate-300 pl-10 pr-3 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:bg-slate-100 transition"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-designation" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Designation
                  </label>
                  <div className="relative">
                    <FiBriefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      id="signup-designation"
                      name="designation"
                      type="text"
                      value={formData.designation}
                      onChange={handleChange}
                      maxLength={100}
                      disabled={isLoading}
                      placeholder="Software Engineer"
                      className="w-full border border-slate-300 pl-10 pr-3 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:bg-slate-100 transition"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-phone" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Phone <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <FiPhone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={20}
                      disabled={isLoading}
                      placeholder="+919876543210"
                      className="w-full border border-slate-300 pl-10 pr-3 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:bg-slate-100 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="signup-joiningDate" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Joining Date
                </label>
                <div className="relative">
                  <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                  <input
                    id="signup-joiningDate"
                    name="joiningDate"
                    type="date"
                    value={formData.joiningDate}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full border border-slate-300 pl-10 pr-3 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:bg-slate-100 transition"
                  />
                </div>
              </div>
            </div>

            {/* SECURITY */}
            <div className="space-y-4 pt-6 border-t border-slate-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Security
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={128}
                      disabled={isLoading}
                      placeholder="Enter password"
                      className="w-full border border-slate-300 pl-10 pr-10 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:bg-slate-100 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      tabIndex={-1}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      maxLength={128}
                      disabled={isLoading}
                      placeholder="Confirm password"
                      className="w-full border border-slate-300 pl-10 pr-10 py-2.5 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 disabled:bg-slate-100 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <FiEyeOff size={17} /> : <FiEye size={17} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-900/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-8">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
              Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
};

function ClockMark(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AttendanceIllustration(props) {
  return (
    <svg viewBox="0 0 420 320" fill="none" {...props}>
      <ellipse cx="210" cy="285" rx="150" ry="16" fill="white" fillOpacity="0.06" />

      <circle cx="180" cy="150" r="85" fill="#3730A3" fillOpacity="0.35" />
      <circle cx="180" cy="150" r="70" fill="#0F172A" stroke="#6366F1" strokeWidth="3" />
      <path d="M180 150V105M180 150l32 18" stroke="#818CF8" strokeWidth="6" strokeLinecap="round" />
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30 * Math.PI) / 180;
        const x1 = 180 + 62 * Math.sin(angle);
        const y1 = 150 - 62 * Math.cos(angle);
        const x2 = 180 + 55 * Math.sin(angle);
        const y2 = 150 - 55 * Math.cos(angle);
        return (
          <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#475569" strokeWidth="2" />
        );
      })}

      <path
        d="M300 120c0 26-30 55-30 55s-30-29-30-55a30 30 0 0 1 60 0Z"
        fill="#F59E0B"
      />
      <circle cx="270" cy="120" r="12" fill="#0F172A" />

      <rect x="70" y="200" width="60" height="46" rx="10" fill="#334155" />
      <circle cx="100" cy="223" r="14" fill="#0F172A" stroke="#818CF8" strokeWidth="2" />
      <rect x="86" y="192" width="14" height="10" rx="3" fill="#334155" />

      <circle cx="320" cy="220" r="24" fill="white" />
      <circle cx="320" cy="220" r="24" stroke="#6366F1" strokeWidth="3" fill="none" />
      <path
        d="M311 220l6 6 12-12"
        stroke="#4338CA"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <path d="M225 165 L270 132" stroke="#64748B" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M150 195 L120 205" stroke="#64748B" strokeWidth="2" strokeDasharray="4 4" />
      <path d="M240 195 L305 210" stroke="#64748B" strokeWidth="2" strokeDasharray="4 4" />
    </svg>
  );
}

export default SignupPage;