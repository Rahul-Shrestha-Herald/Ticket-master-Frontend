import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const AdminAppContext = createContext();

export const AdminAppContextProvider = (props) => {
  axios.defaults.withCredentials = true;

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [isAdminLoggedin, setIsAdminLoggedin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [suppressUnauthorizedToast, setSuppressUnauthorizedToast] = useState(false);

  // Check if the admin is authenticated by verifying the cookie with the backend.
  const getAdminAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/auth/is-auth`);
      if (data.success) {
        setIsAdminLoggedin(true);
        await getAdminData();
      } else {
        setIsAdminLoggedin(false);
      }
    } catch (error) {
      setIsAdminLoggedin(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const getAdminData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/admin/data`);
      if (data.success) {
        setAdminData(data.adminData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    // Only check admin auth state if the URL starts with '/admin'
    if (window.location.pathname.startsWith('/admin')) {
      getAdminAuthState();
    } else {
      setAuthLoading(false);
    }
  }, []);

  const value = {
    backendUrl,
    isAdminLoggedin,
    setIsAdminLoggedin,
    adminData,
    setAdminData,
    getAdminData,
    authLoading,
    suppressUnauthorizedToast,
    setSuppressUnauthorizedToast,
  };

  return (
    <AdminAppContext.Provider value={value}>
      {props.children}
    </AdminAppContext.Provider>
  );
};