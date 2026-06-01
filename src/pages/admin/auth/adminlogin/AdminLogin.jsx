import React, { useContext, useState, useEffect } from 'react';
import { FaLock } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import { AdminAppContext } from '../../../../context/AdminAppContext';
import axios from 'axios';
import { toast } from "react-toastify";

const AdminLogin = () => {
  const navigate = useNavigate();
  const {
    backendUrl,
    setIsAdminLoggedin,
    getAdminData,
    isAdminLoggedin,
    setSuppressUnauthorizedToast,
  } = useContext(AdminAppContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Local flag to mark that the login form was submitted
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setSuppressUnauthorizedToast(false);
    if (isAdminLoggedin && !submitted) {
      toast.info("Already logged in.");
      navigate('/admin/dashboard');
    }
  }, [isAdminLoggedin, submitted, navigate, setSuppressUnauthorizedToast]);

  const validateForm = () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return false;
    }
    return true;
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/admin/auth/login`, { email, password });
      if (data.success) {
        setSubmitted(true); // Mark that the form was submitted to prevent duplicate toast.
        toast.success("Admin Login Successful!");
        setIsAdminLoggedin(true);
        getAdminData();
        navigate('/admin/dashboard');
      } else {
        toast.error(data.message || "Invalid email or password.");
      }
    } catch (error) {
      toast.error("Invalid email or password.");
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
        <h2 className='text-3xl font-semibold text-white text-center mb-3'>Admin Login</h2>
        <p className='text-center text-sm mb-6'>Login to your Admin Account</p>

        <form onSubmit={onSubmitHandler} noValidate>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <MdEmail />
            <input
              onChange={e => setEmail(e.target.value)}
              value={email}
              className='bg-transparent outline-none w-full text-white'
              type="email"
              placeholder='Email'
              required
            />
          </div>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <FaLock />
            <input
              onChange={e => setPassword(e.target.value)}
              value={password}
              className='bg-transparent outline-none w-full text-white'
              type="password"
              placeholder='Password'
              required
            />
          </div>
          <button className='w-full py-2.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-full font-medium text-neutral-50 hover:text-primary ease-in-out duration-300'>
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/" className="text-blue-400 underline">Back to Home</a>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;