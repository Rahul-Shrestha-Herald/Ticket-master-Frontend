import { useContext, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { UserAppContext } from "../../../context/UserAppContext";
import { toast } from "react-toastify";

const UserProtectedRoute = () => {
    const { isLoggedin, authLoading, suppressUnauthorizedToast, getAuthState } = useContext(UserAppContext);
    const location = useLocation();

    useEffect(() => {
        getAuthState();
    }, [location.pathname]);

    useEffect(() => {
        if (!authLoading && !isLoggedin && !suppressUnauthorizedToast) {
            toast.error("Not Authorized. Please log in.");
        }
    }, [authLoading, isLoggedin, suppressUnauthorizedToast]);

    if (authLoading) {
        return <div>Loading...</div>;
    }

    if (!isLoggedin) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default UserProtectedRoute; 