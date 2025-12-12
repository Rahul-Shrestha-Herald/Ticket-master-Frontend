import React, { useState, useEffect, useContext } from 'react';
import { UserAppContext } from '../../../context/UserAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';

const EmailVerify = () => {
    axios.defaults.withCredentials = true;
    const { backendUrl, isLoggedin, getUserData, setIsLoggedin, setUserData } = useContext(UserAppContext);
    const navigate = useNavigate();
    const inputRefs = React.useRef([]);

    const [timer, setTimer] = useState(30);  // ⬅️ Start countdown immediately
    const [canResend, setCanResend] = useState(false);

    const { state } = useLocation();
    const email = state?.email || '';

    useEffect(() => {
        if (timer > 0) {
            setCanResend(false);
            const interval = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setCanResend(true);
        }
    }, [timer]);

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
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('');
        pasteArray.forEach((char, index) => {
            if (inputRefs.current[index]) {
                inputRefs.current[index].value = char;
            }
        });
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        const otpArray = inputRefs.current.map(e => e.value);
        const otp = otpArray.join('');

        try {
            const { data } = await axios.post(backendUrl + '/api/auth/verify-account', { email, otp });

            if (data.success) {
                toast.success("Email Verified Successfully!");
                toast.success("Login Successfully!");
                setIsLoggedin(true);
                getUserData(data.user);
                navigate('/');
            } else {
                toast.error(data.message || "Verification failed. Please try again.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    const resendOtp = async () => {
        if (!canResend) return;

        setCanResend(false);
        setTimer(30);  // ⬅️ Restart timer immediately when Resend OTP is clicked

        try {
            const { data } = await axios.post(backendUrl + '/api/auth/resend-otp', { email });

            if (data.success) {
                toast.success("OTP Resent! Please check your email.");
            } else {
                toast.error(data.message || "Failed to resend OTP.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    useEffect(() => {
        if (isLoggedin) {
            if (getUserData?.isAccountVerified) {
                toast.info("Already logged in and verified.");
                navigate('/');
            } else {
                toast.info("Already logged in but not verified.");
            }
        }
    }, [isLoggedin, getUserData, navigate]);

    return (
        <div className='flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-purple-400'>
            <form onSubmit={onSubmitHandler} noValidate className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
                <h1 className='text-white text-2xl font-semibold text-center mb-4'>Email Verify OTP</h1>
                <p className='text-center mb-6 text-indigo-300'>Enter the 6-digit Code Sent to your Email</p>

                <div className='flex justify-between mb-8' onPaste={handlePaste}>
                    {Array(6).fill(0).map((_, index) => (
                        <input type="text" maxLength='1' key={index} required
                            className='w-12 h-12 bg-[#333A5C] text-white text-center text-xl rounded-md'
                            ref={e => inputRefs.current[index] = e}
                            onInput={(e) => handleInput(e, index)}
                            onKeyDown={(e) => handleKeyDown(e, index)} />
                    ))}
                </div>

                {/* Resend OTP Button - Positioned Above & Left */}
                <div className="mb-4 text-left">
                    <button
                        type="button"
                        onClick={resendOtp}
                        className={`text-blue-400 underline ${!canResend ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!canResend}>
                        Resend OTP {timer > 0 && `(${timer}s)`}
                    </button>
                </div>

                {/* Verify Email Button */}
                <button className='w-full py-2.5 bg-primary hover:bg-transparent border-2 border-primary 
                    hover:border-primary rounded-full font-medium text-neutral-50 hover:text-primary ease-in-out duration-300'>
                    Verify Email
                </button>

                {/* Back to Home Link */}
                <div className="mt-6 text-center">
                    <Link to="/" className="text-blue-400 underline">
                        Back to Home
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default EmailVerify;
