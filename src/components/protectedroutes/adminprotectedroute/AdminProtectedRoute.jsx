import { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AdminAppContext } from "../../../context/AdminAppContext";
import { toast } from "react-toastify";

const AdminProtectedRoute = () => {
  const { isAdminLoggedin, authLoading, suppressUnauthorizedToast } = useContext(AdminAppContext);

  useEffect(() => {
    if (!authLoading && !isAdminLoggedin && !suppressUnauthorizedToast) {
      toast.error("Not Authorized. Please log in.");
    }
  }, [authLoading, isAdminLoggedin, suppressUnauthorizedToast]);

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdminLoggedin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
