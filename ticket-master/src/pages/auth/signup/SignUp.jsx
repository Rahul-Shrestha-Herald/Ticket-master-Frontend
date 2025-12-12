import React, { useContext, useState, useEffect } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useNavigate, Link } from 'react-router-dom';
import { UserAppContext } from '../../../context/UserAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Signup = () => {
    const navigate = useNavigate();
    const { backendUrl, isLoggedin, setSuppressUnauthorizedToast } = useContext(UserAppContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        setSuppressUnauthorizedToast(false);
        if (isLoggedin) {
            toast.info("Already logged in.");
            navigate('/');
        }
    }, [isLoggedin, navigate, setSuppressUnauthorizedToast]);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;

    const validateForm = () => {
        // Check if the email is in a lowercase
        if (email !== email.toLowerCase()) {
            toast.error("Email must be in lowercase.");
            return false;
        }

        // Check if the email is in a valid format
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return false;
        }

        // Check if password meets the criteria
        if (!passwordRegex.test(password)) {
            toast.error("Password must be at least 6 characters long and contain at least one special character.");
            return false;
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return false;
        }

        return true;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return; // Stop form submission if validation fails
        }

        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/auth/register`, { name, email, password });

            if (data.success) {
                toast.success("OTP Sent. Verify Your Email.");
                navigate('/email-verify', { state: { email } });
            } else {
                toast.error(data.message || "Signup failed. Please try again.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
            <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
                <h2 className='text-3xl font-semibold text-white text-center mb-3'>Create Account</h2>
                <p className='text-center text-sm mb-6'>Create your Account</p>

                <form onSubmit={onSubmitHandler} noValidate>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <FaUser className="w-5 h-5 min-w-5 min-h-5 text-indigo-300" />
                        <input
                            onChange={e => setName(e.target.value)}
                            value={name}
                            className='bg-transparent outline-none w-full'
                            type="text"
                            placeholder='Full Name'
                            required
                        />
                    </div>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <MdEmail className="w-5 h-5 min-w-5 min-h-5 text-indigo-300" />
                        <input
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                            className='bg-transparent outline-none w-full'
                            type="email"
                            placeholder='Email Id'
                            required
                        />
                    </div>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <FaLock className="w-5 h-5 min-w-5 min-h-5 text-indigo-300" />
                        <input
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            className='bg-transparent outline-none w-full'
                            type={showPassword ? "text" : "password"}
                            placeholder='Password'
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-indigo-300"
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                    </div>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <FaLock className="w-5 h-5 min-w-5 min-h-5 text-indigo-300" />
                        <input
                            onChange={e => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                            className='bg-transparent outline-none w-full'
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder='Confirm Password'
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
                    <button className='w-full py-2.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-full font-medium text-neutral-50 hover:text-primary ease-in-out duration-300'>
                        Sign Up
                    </button>
                </form>

                <p className='text-gray-400 text-center text-xs mt-4'>
                    Already have an Account? <Link to="/login" className='text-blue-400 underline'>Login here</Link>
                </p>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-blue-400 underline">Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
