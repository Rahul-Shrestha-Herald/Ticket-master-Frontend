import React, { useContext, useState, useEffect } from 'react';
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useNavigate, Link } from 'react-router-dom';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import axios from 'axios';
import { toast } from "react-toastify";

const OperatorLogin = () => {
    const navigate = useNavigate();
    const { backendUrl, setIsOperatorLoggedin, getOperatorData, isOperatorLoggedin, setSuppressUnauthorizedToast } = useContext(OperatorAppContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        setSuppressUnauthorizedToast(false);
        if (isOperatorLoggedin && !submitted) {
            toast.info("Already logged in.");
            navigate('/operator/dashboard');
        }
    }, [isOperatorLoggedin, submitted, navigate, setSuppressUnauthorizedToast]);

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
            const { data } = await axios.post(`${backendUrl}/api/operator/auth/login`, { email, password });
            if (data.success) {
                setSubmitted(true);
                toast.success("Operator Login Successful!");
                setIsOperatorLoggedin(true);
                getOperatorData();
                navigate('/operator/dashboard');
            } else {
                toast.error(data.message || "Invalid email or password.");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Invalid email or password.");
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
            <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
                <h2 className='text-3xl font-semibold text-white text-center mb-3'>Operator Login</h2>
                <p className='text-center text-sm mb-6'>Login to your Operator Account</p>
                <form onSubmit={onSubmitHandler} noValidate>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <MdEmail />
                        <input
                            onChange={e => setEmail(e.target.value)}
                            value={email}
                            className='bg-transparent outline-none w-full text-white'
                            type="email"
                            placeholder='Operator Email'
                            required
                        />
                    </div>
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <FaLock />
                        <input
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            className='bg-transparent outline-none w-full text-white'
                            type={showPassword ? "text" : "password"}
                            placeholder='Operator Password'
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
                    <p onClick={() => navigate('/operator-reset-password')} className='mb-4 text-indigo-500 cursor-pointer'>
                        Forgot Password?
                    </p>
                    <button className='w-full py-2.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-full font-medium text-neutral-50 hover:text-primary ease-in-out duration-300'>
                        Login
                    </button>
                </form>
                <p className='text-gray-400 text-center text-xs mt-4'>
                    Don't have an Account? <Link to="/operator/signup" className='text-blue-400 underline'>Sign Up</Link>
                </p>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-blue-400 underline">Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default OperatorLogin;
