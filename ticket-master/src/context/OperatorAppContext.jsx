import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const OperatorAppContext = createContext();

export const OperatorAppContextProvider = (props) => {
  axios.defaults.withCredentials = true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [isOperatorLoggedin, setIsOperatorLoggedin] = useState(false);
  const [operatorData, setOperatorData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [suppressUnauthorizedToast, setSuppressUnauthorizedToast] = useState(false);

  const getOperatorAuthState = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/operator/auth/is-auth`);
      if (data.success) {
        setIsOperatorLoggedin(true);
        await getOperatorData();
      } else {
        setIsOperatorLoggedin(false);
      }
    } catch (error) {
      setIsOperatorLoggedin(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const getOperatorData = async () => {
    try {
        const { data } = await axios.get(`${backendUrl}/api/operator/data`);
        if (data.success) {
            setOperatorData(data.operatorData);
        } else {
            if (!suppressUnauthorizedToast) {
                toast.error(data.message);
            }
        }
    } catch (error) {
        if (!suppressUnauthorizedToast) {
            toast.error(error.response?.data?.message || error.message);
        }
    }
};

  useEffect(() => {
    if (window.location.pathname.startsWith('/operator')) {
      getOperatorAuthState();
    } else {
      setAuthLoading(false);
    }
  }, []);

  const value = {
    backendUrl,
    isOperatorLoggedin,
    setIsOperatorLoggedin,
    operatorData,
    setOperatorData,
    getOperatorData,
    authLoading,
    suppressUnauthorizedToast,
    setSuppressUnauthorizedToast,
  };

  return (
    <OperatorAppContext.Provider value={value}>
      {props.children}
    </OperatorAppContext.Provider>
  );
};
