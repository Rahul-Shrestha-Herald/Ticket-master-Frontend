import React, { useState, useContext } from 'react';
import { UserAppContext } from '../../context/UserAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaTag, FaTicketAlt, FaComments, FaPaperPlane } from 'react-icons/fa';

const SupportRequestForm = ({ className, onSuccess }) => {
    const { backendUrl } = useContext(UserAppContext);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        category: '',
        bookingId: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when field is updated
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: ''
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Validate name
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Validate phone
        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10,}$/.test(formData.phone.replace(/[^0-9]/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        // Validate category
        if (!formData.category) {
            newErrors.category = 'Please select a category';
        }

        // Validate message
        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        // Validate terms checkbox
        if (!agreeTerms) {
            newErrors.terms = 'You must agree to the privacy policy';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await axios.post(`${backendUrl}/api/support`, formData);

            if (response.data.success) {
                toast.success('Your support request has been submitted successfully');

                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    category: '',
                    bookingId: '',
                    message: ''
                });
                setAgreeTerms(false);

                // Call success callback if provided
                if (onSuccess) {
                    onSuccess();
                }
            } else {
                toast.error(response.data.message || 'Failed to submit support request');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'An error occurred while submitting your request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form
            className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 ${className}`}
            onSubmit={handleSubmit}
        >
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <span className="bg-primary/10 p-2 rounded-full mr-3">
                    <FaPaperPlane className="text-primary h-5 w-5" />
                </span>
                Submit Your Request
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700">
                        <FaUser className="mr-2 text-gray-400" />
                        Full Name<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 outline-none`}
                        placeholder="Enter your full name"
                    />
                    {errors.name &&
                        <p className="text-sm text-red-500 flex items-start mt-1">
                            <span className="inline-block w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-1 mt-0.5">
                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                            </span>
                            {errors.name}
                        </p>
                    }
                </div>
                <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        Email Address<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 outline-none`}
                        placeholder="Enter your email address"
                    />
                    {errors.email &&
                        <p className="text-sm text-red-500 flex items-start mt-1">
                            <span className="inline-block w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-1 mt-0.5">
                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                            </span>
                            {errors.email}
                        </p>
                    }
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700">
                        <FaPhone className="mr-2 text-gray-400" />
                        Phone Number<span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-gray-50 border ${errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 outline-none`}
                        placeholder="Enter your phone number"
                    />
                    {errors.phone &&
                        <p className="text-sm text-red-500 flex items-start mt-1">
                            <span className="inline-block w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-1 mt-0.5">
                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                            </span>
                            {errors.phone}
                        </p>
                    }
                </div>
                <div className="space-y-2">
                    <label htmlFor="category" className="flex items-center text-sm font-medium text-gray-700">
                        <FaTag className="mr-2 text-gray-400" />
                        Issue Category<span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="relative">
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 bg-gray-50 border ${errors.category ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 outline-none appearance-none`}
                        >
                            <option value="">Select category</option>
                            <option value="booking">Booking Issue</option>
                            <option value="payment">Payment Issue</option>
                            <option value="cancellation">Cancellation/Refund</option>
                            <option value="technical">Technical Issue</option>
                            <option value="other">Other</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
                        </div>
                    </div>
                    {errors.category &&
                        <p className="text-sm text-red-500 flex items-start mt-1">
                            <span className="inline-block w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-1 mt-0.5">
                                <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                            </span>
                            {errors.category}
                        </p>
                    }
                </div>
            </div>

            <div className="mb-6 space-y-2">
                <label htmlFor="bookingId" className="flex items-center text-sm font-medium text-gray-700">
                    <FaTicketAlt className="mr-2 text-gray-400" />
                    Booking ID <span className="text-xs text-gray-500 ml-1">(if applicable)</span>
                </label>
                <input
                    type="text"
                    id="bookingId"
                    name="bookingId"
                    value={formData.bookingId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 outline-none"
                    placeholder="Enter your booking ID if you have one"
                />
            </div>

            <div className="mb-6 space-y-2">
                <label htmlFor="message" className="flex items-center text-sm font-medium text-gray-700">
                    <FaComments className="mr-2 text-gray-400" />
                    Message<span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 bg-gray-50 border ${errors.message ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 outline-none resize-none`}
                    placeholder="Please describe your issue in detail"
                ></textarea>
                {errors.message &&
                    <p className="text-sm text-red-500 flex items-start mt-1">
                        <span className="inline-block w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-1 mt-0.5">
                            <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                        </span>
                        {errors.message}
                    </p>
                }
            </div>

            <div className="mb-8">
                <div className="flex items-center">
                    <div className="relative flex items-center">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={agreeTerms}
                            onChange={(e) => {
                                setAgreeTerms(e.target.checked);
                                if (e.target.checked && errors.terms) {
                                    setErrors({
                                        ...errors,
                                        terms: ''
                                    });
                                }
                            }}
                            className={`form-checkbox h-5 w-5 rounded border-2 text-primary focus:ring-primary transition-all duration-200 ${errors.terms ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        <span className={`absolute left-0 right-0 bottom-0 block h-5 w-5 overflow-hidden rounded pointer-events-none ${agreeTerms ? 'border-primary' : 'border-transparent'}`}></span>
                    </div>
                    <label htmlFor="terms" className={`ml-3 text-sm ${errors.terms ? 'text-red-500' : 'text-gray-600'}`}>
                        I agree to the processing of my personal data as per the <a href="/privacy-policy" className="text-primary hover:underline font-medium transition-colors">Privacy Policy</a>.
                    </label>
                </div>
                {errors.terms &&
                    <p className="text-sm text-red-500 flex items-start mt-2 ml-8">
                        <span className="inline-block w-4 h-4 bg-red-100 rounded-full flex items-center justify-center mr-1 mt-0.5">
                            <span className="inline-block w-1 h-1 bg-red-500 rounded-full"></span>
                        </span>
                        {errors.terms}
                    </p>
                }
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 active:bg-primary/80 transition duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center w-full md:w-auto"
                >
                    <FaPaperPlane className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    <span className="ml-1">{isSubmitting ? '' : '→'}</span>
                </button>
            </div>
        </form>
    );
};

export default SupportRequestForm; 