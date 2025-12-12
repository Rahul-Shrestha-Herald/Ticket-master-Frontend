import React, { useContext, useState, useEffect } from 'react';
import { FaUser, FaLock, FaIdCard, FaEye, FaEyeSlash } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { useNavigate, Link } from 'react-router-dom';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const OperatorSignUp = () => {
    const navigate = useNavigate();
    const { backendUrl, isOperatorLoggedin, setSuppressUnauthorizedToast } = useContext(OperatorAppContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [panNo, setPanNo] = useState('');
    const [panImage, setPanImage] = useState(null);

    useEffect(() => {
        if (isOperatorLoggedin) {
            toast.info("Already logged in.");
            navigate('/operator/dashboard');
        }
    }, [isOperatorLoggedin, navigate]);

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;
    const panNoRegex = /^[0-9]+$/;

    const validateForm = () => {
        if (email !== email.toLowerCase()) {
            toast.error("Email must be in lowercase.");
            return false;
        }
        if (!name || !email || !password || !panNo) {
            toast.error("Please fill in all required fields.");
            return false;
        }
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address.");
            return false;
        }
        if (!passwordRegex.test(password)) {
            toast.error("Password must be at least 6 characters long and contain at least one special character.");
            return false;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match.");
            return false;
        }
        if (!panNoRegex.test(panNo)) {
            toast.error("PAN number must contain only numbers.");
            return false;
        }
        if (!panImage) {
            toast.error("PAN image is required.");
            return false;
        }
        return true;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        const toastId = toast.loading('Uploading PAN image and registering. Please wait...');

        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("panNo", panNo);
            formData.append("panImage", panImage);

            const { data } = await axios.post(`${backendUrl}/api/operator/auth/signup`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.update(toastId, {
                    render: "Operator registration complete! Your account is being verified. Once verified, you will receive a confirmation email.",
                    type: "success",
                    isLoading: false,
                    autoClose: 5000
                });
                setSuppressUnauthorizedToast(true);
                navigate('/operator/login');
            } else {
                toast.update(toastId, {
                    render: data.message,
                    type: "error",
                    isLoading: false,
                    autoClose: 5000
                });
            }
        } catch (error) {
            toast.update(toastId, {
                render: error.response?.data?.message || error.message,
                type: "error",
                isLoading: false,
                autoClose: 5000
            });
        }
    };

    return (
        <div className='flex items-center justify-center min-h-screen pt-10 px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
            <div className='bg-slate-900 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm'>
                <h2 className='text-3xl font-semibold text-white text-center mb-3'>Register Operator</h2>
                <p className='text-center text-sm mb-6'>Create an Operator Account</p>
                <form onSubmit={onSubmitHandler} noValidate>
                    {/* Name Input */}
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <FaUser />
                        <input
                            onChange={e => setName(e.target.value)}
                            value={name}
                            className='bg-transparent outline-none w-full text-white'
                            type="text"
                            placeholder='Full Name'
                            required
                        />
                    </div>

                    {/* Email Input */}
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

                    {/* Password Input */}
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <FaLock />
                        <input
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                            className='bg-transparent outline-none w-full text-white'
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

                    {/* Confirm Password Input */}
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <FaLock />
                        <input
                            onChange={e => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                            className='bg-transparent outline-none w-full text-white'
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

                    {/* PAN Number Input */}
                    <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5C]'>
                        <FaIdCard />
                        <input
                            onChange={e => setPanNo(e.target.value)}
                            value={panNo}
                            className='bg-transparent outline-none w-full text-white'
                            type="text"
                            placeholder='Business PAN Number'
                            maxLength={10}
                            required
                        />
                    </div>

                    {/* PAN Image Input */}
                    <div className='mb-4 flex flex-col gap-2 w-full px-5 py-2.5 rounded-lg bg-[#333A5C]'>
                        <label className='text-indigo-300'>Upload PAN Image (Max 1MB)</label>
                        <input
                            onChange={e => {
                                const file = e.target.files[0];
                                if (file) {
                                    // Validate file type
                                    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
                                    if (!allowedTypes.includes(file.type)) {
                                        toast.error('Only PNG, JPG, and JPEG formats are allowed.');
                                        e.target.value = '';
                                        setPanImage(null);
                                        return;
                                    }

                                    // Validate file size
                                    if (file.size > 1024 * 1024) {
                                        toast.error('PAN image size must be less than 1MB.');
                                        e.target.value = '';
                                        setPanImage(null);
                                        return;
                                    }
                                    setPanImage(file);
                                }
                            }}
                            className='bg-transparent outline-none w-full text-indigo-300'
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            required
                        />
                    </div>

                    <button className='w-full py-2.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-full font-medium text-neutral-50 hover:text-primary ease-in-out duration-300'>
                        Sign Up
                    </button>
                </form>
                <p className='text-gray-400 text-center text-xs mt-4'>
                    Already have an Account? <Link to="/operator/login" className='text-blue-400 underline'>Login here</Link>
                </p>
                <div className="mt-6 text-center">
                    <Link to="/" className="text-blue-400 underline">Back to Home</Link>
                </div>
            </div>
        </div>
    );
};

export default OperatorSignUp;