import { useContext, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { OperatorAppContext } from "../../../context/OperatorAppContext";
import { toast } from "react-toastify";

const OperatorProtectedRoute = () => {
  const { isOperatorLoggedin, authLoading, suppressUnauthorizedToast } = useContext(OperatorAppContext);

  useEffect(() => {
    if (!authLoading && !isOperatorLoggedin && !suppressUnauthorizedToast) {
      toast.error("Not Authorized. Please log in.");
    }
  }, [authLoading, isOperatorLoggedin, suppressUnauthorizedToast]);

  if (authLoading) {
    return <div>Loading...</div>;
  }
  if (!isOperatorLoggedin) {
    return <Navigate to="/operator/login" replace />;
  }
  return <Outlet />;
};

export default OperatorProtectedRoute;
