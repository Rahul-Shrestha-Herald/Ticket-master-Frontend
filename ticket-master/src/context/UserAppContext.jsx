import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const UserAppContext = createContext()

export const UserAppContextProvider = (props) => {
    axios.defaults.withCredentials = true;

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [isLoggedin, setIsLoggedin] = useState(false)
    const [userData, setUserData] = useState(false)
    const [authLoading, setAuthLoading] = useState(true)
    const [suppressUnauthorizedToast, setSuppressUnauthorizedToast] = useState(false)

    const getAuthState = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/auth/is-auth`)
            if (data.success) {
                setIsLoggedin(true)
                await getUserData()
            } else {
                setIsLoggedin(false)
            }
        } catch (error) {
            setIsLoggedin(false)
            if (!suppressUnauthorizedToast) {
                toast.error(error.message)
            }
        } finally {
            setAuthLoading(false)
        }
    }

    const getUserData = async () => {
        try {
            const { data } = await axios.get(`${backendUrl}/api/user/data`)
            if (data.success) {
                setUserData(data.userData)
            } else {
                if (!suppressUnauthorizedToast) {
                    toast.error(data.message)
                }
            }
        } catch (error) {
            if (!suppressUnauthorizedToast) {
                toast.error(error.message)
            }
        }
    }

    useEffect(() => {
        getAuthState();
    }, [])

    const value = {
        backendUrl,
        isLoggedin, setIsLoggedin,
        userData, setUserData,
        getUserData,
        authLoading,
        suppressUnauthorizedToast,
        setSuppressUnauthorizedToast,
        getAuthState
    }

    return (
        <UserAppContext.Provider value={value}>
            {props.children}
        </UserAppContext.Provider>
    );
}