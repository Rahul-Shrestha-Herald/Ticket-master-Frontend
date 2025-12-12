import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MdEmail } from "react-icons/md";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa6";
import { UserAppContext } from '../../../context/UserAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const ResetPassword = () => {
  const { backendUrl, isLoggedin, setSuppressUnauthorizedToast } = useContext(UserAppContext);
  axios.defaults.withCredentials = true;

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [isOtpSubmitted, setIsOtpSubmitted] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    setSuppressUnauthorizedToast(false);
    if (isLoggedin) {
      toast.info("Already logged in.");
      navigate('/');
    }
  }, [isLoggedin, navigate, setSuppressUnauthorizedToast]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleInput = (e, index) => {
    if (e.target.value.length > 0 && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && e.target.value === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').slice(0, 6);
    paste.split('').forEach((char, index) => {
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = char;
      }
    });
  };

  const onSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, { email });
      if (data.success) {
        toast.success(data.message);
        setIsEmailSent(true);
        setResendTimer(30); // Start the 30-sec timer
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const onSubmitOtp = async (e) => {
    e.preventDefault();
    const otpArray = inputRefs.current.map((input) => input.value).join('');
    setOtp(otpArray);
    setIsOtpSubmitted(true);
  };

  const onResendOtp = async () => {
    if (resendTimer > 0) return;

    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/resend-reset-otp`, { email });
      if (data.success) {
        toast.success("A new OTP has been sent to your email.");
        setResendTimer(30); // Restart the timer on successful resend
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to resend OTP. Try again.");
    }
  };

  const onSubmitNewPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, { email, otp, newPassword });
      if (data.success) {
        toast.success(data.message);
        navigate('/login');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400 px-4 md:px-0'>

      {!isEmailSent && (
        <form onSubmit={onSubmitEmail} noValidate className='bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-sm md:w-96 text-sm'>
          <h1 className='text-white text-xl md:text-2xl font-semibold text-center mb-4'>Reset Password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter your Registered Email Address</p>
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <MdEmail className='text-indigo-300 w-5 h-5 min-w-5 min-h-5' />
            <input type="email" placeholder='Email Id' className='bg-transparent outline-none text-white w-full'
              value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <button className='w-full py-2.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-full font-medium text-neutral-50 hover:text-primary ease-in-out duration-300'>Submit</button>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-400 underline">Back to Login</Link>
          </div>

        </form>
      )}

      {!isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitOtp} noValidate className='bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-sm md:w-96 text-sm'>
          <h1 className='text-white text-xl md:text-2xl font-semibold text-center mb-4'>Reset Password OTP</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit Code Sent to your Email</p>
          <div className='flex justify-between mb-4 gap-1 md:gap-2' onPaste={handlePaste}>
            {Array(6).fill(0).map((_, index) => (
              <input type="text" maxLength='1' key={index} required
                className='w-10 h-10 md:w-12 md:h-12 bg-[#333A5C] text-white text-center text-lg md:text-xl rounded-md'
                ref={e => inputRefs.current[index] = e}
                onInput={(e) => handleInput(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)} />
            ))}
          </div>

          {/* Resend OTP button */}
          <button
            type="button"
            className={`text-blue-400 underline text-sm md:text-base ${resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onResendOtp}
            disabled={resendTimer > 0}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
          </button>

          <button className='w-full py-2.5 bg-primary rounded-full font-medium text-neutral-50 mt-4'>Submit</button>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-400 underline">Back to Login</Link>
          </div>

        </form>
      )}

      {isOtpSubmitted && isEmailSent && (
        <form onSubmit={onSubmitNewPassword} noValidate className='bg-slate-900 p-6 md:p-8 rounded-lg shadow-lg w-full max-w-sm md:w-96 text-sm'>
          <h1 className='text-white text-xl md:text-2xl font-semibold text-center mb-4'>New Password</h1>
          <p className='text-center mb-6 text-indigo-300'>Enter New Password</p>

          {/* New Password input */}
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <FaLock className='text-indigo-300 w-5 h-5 min-w-5 min-h-5' />
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder='New Password'
              className='bg-transparent outline-none text-white w-full'
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="text-indigo-300"
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Confirm New Password input */}
          <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
            <FaLock className='text-indigo-300 w-5 h-5 min-w-5 min-h-5' />
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder='Confirm New Password'
              className='bg-transparent outline-none text-white w-full'
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="text-indigo-300"
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button className='w-full py-2.5 bg-primary rounded-full font-medium text-neutral-50'>Submit</button>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-blue-400 underline">Back to Login</Link>
          </div>

        </form>
      )}

    </div>
  );
};

export default ResetPassword;
