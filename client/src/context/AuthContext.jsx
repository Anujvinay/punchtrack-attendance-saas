import { createContext, useContext } from "react";
import { useLocation } from "react-router-dom";
import { useGetMeQuery } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const location = useLocation();

  const isPublicRoute =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useGetMeQuery(undefined, {
    skip: isPublicRoute,
    refetchOnMountOrArgChange: true,
  });

  const user = data?.data?.user || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isFetching,
        isError,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};