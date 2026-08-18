import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const apiBaseUrl =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

export const api = createApi({
  reducerPath: "api",

  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    credentials: "include",
  }),

  tagTypes: [
    "Auth",
    "Attendance",
    "Overtime",
    "User",
    "Report",
  ],

  endpoints: (builder) => ({
    // =========================
    // AUTH
    // =========================

    register: builder.mutation({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),

    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),

      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(api.util.resetApiState());
        } catch {
          // Logout error is handled by the mutation.
        }
      },
    }),

    // =========================
    // ATTENDANCE
    // =========================

    checkIn: builder.mutation({
      query: (formData) => ({
        url: "/attendance/check-in",
        method: "POST",
        body: formData, 
      }),
      invalidatesTags: ["Attendance"],
    }),

    checkOut: builder.mutation({
      query: (formData) => ({
        url: "/attendance/check-out",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Attendance"],
    }),

    getMyAttendance: builder.query({
      query: (params = {}) => ({
        url: "/attendance/my",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    getAllAttendance: builder.query({
      query: (params = {}) => ({
        url: "/attendance",
        params,
      }),
      providesTags: ["Attendance"],
    }),

    verifyAttendance: builder.mutation({
      query: ({ id, verificationStatus, verificationNote }) => ({
        url: `/attendance/${id}/verify`,
        method: "PATCH",
        body: {
          verificationStatus,
          verificationNote,
        },
      }),
      invalidatesTags: ["Attendance", "Report"], 
    }),

    // =========================
    // EMPLOYEES
    // =========================

    getEmployees: builder.query({
      query: (params = {}) => ({
        url: "/employees",
        params,
      }),
      providesTags: ["User"],
    }),

    getManagers: builder.query({
      query: () => "/employees/managers",
      providesTags: ["User"],
    }),

    createManager: builder.mutation({
      query: (data) => ({
        url: "/employees/managers",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    getEmployeeById: builder.query({
      query: (id) => `/employees/${id}`,
      providesTags: ["User"],
    }),

   
    
    updateEmployee: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/employees/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),
    
    updateEmployeeStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/employees/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["User"],
    }),

    assignManager: builder.mutation({
      query: ({ id, managerId }) => ({
        url: `/employees/${id}/manager`,
        method: "PATCH",
        body: { managerId },
      }),
      invalidatesTags: ["User"],
    }),

    // =========================
    // OVERTIME
    // =========================

    getMyOvertime: builder.query({
      query: (params = {}) => ({
        url: "/overtime/my",
        params,
      }),
      providesTags: ["Overtime"],
    }),

    createOvertimeRequest: builder.mutation({
      query: (data) => ({
        url: "/overtime",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Overtime"],
    }),

    getAllOvertime: builder.query({
      query: (params = {}) => ({
        url: "/overtime",
        params,
      }),
      providesTags: ["Overtime"],
    }),

    reviewOvertime: builder.mutation({
      query: ({ id, status, reviewNote }) => ({
        url: `/overtime/${id}/review`,
        method: "PATCH",
        body: {
          status,
          reviewNote,
        },
      }),
      invalidatesTags: ["Overtime", "Report"],
    }),

    // =========================
    // REPORTS
    // =========================

    getAttendanceReport: builder.query({
      query: (params = {}) => ({
        url: "/reports/attendance",
        params,
      }),
      providesTags: ["Report"],
    }),

    getDailyAttendanceReport: builder.query({
      query: ({ from, to }) => ({
        url: "/reports/attendance/daily",
        params: {
          from,
          to,
        },
      }),
      providesTags: ["Report"],
    }),

    getOvertimeReport: builder.query({
      query: (params = {}) => ({
        url: "/reports/overtime",
        params,
      }),
      providesTags: ["Report"],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useLogoutMutation,

  useCheckInMutation,
  useCheckOutMutation,
  useGetMyAttendanceQuery,
  useGetAllAttendanceQuery,
  useVerifyAttendanceMutation,

  useGetEmployeesQuery,
  useGetManagersQuery,
  useCreateManagerMutation,
  useGetEmployeeByIdQuery,
 
  useUpdateEmployeeMutation,
  useUpdateEmployeeStatusMutation,
  useAssignManagerMutation,

  // OVERTIME
  useGetMyOvertimeQuery,
  useCreateOvertimeRequestMutation,
  useGetAllOvertimeQuery,
  useReviewOvertimeMutation,

  useGetAttendanceReportQuery,
  useGetDailyAttendanceReportQuery,
  useGetOvertimeReportQuery,
} = api;