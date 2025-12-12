import React, { useContext, useState, useEffect } from 'react';
import { OperatorAppContext } from '../../../context/OperatorAppContext';
import OperatorLayout from '../../../layout/operator/OperatorLayout';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiUser, FiHome, FiEdit, FiLogOut, FiKey, FiTrash2, FiPhone, FiCalendar, FiMapPin, FiEye, FiEyeOff, FiAlertTriangle } from 'react-icons/fi';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import { useNavigate } from 'react-router-dom';

const OperatorProfile = () => {
    const navigate = useNavigate();
    const { backendUrl, operatorData, getOperatorData, setIsOperatorLoggedin, setSuppressUnauthorizedToast } = useContext(OperatorAppContext);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        panNo: '',
        contact: '',
        permanentAddress: ''
    });

    // Change password states
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordStep, setPasswordStep] = useState(1); // 1: Enter current, 2: Enter new
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [showPassword, setShowPassword] = useState({
        current: false,
        new: false,
        confirm: false
    });

    // Delete account states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (operatorData) {
            setProfileData({
                name: operatorData.name || '',
                email: operatorData.email || '',
                panNo: operatorData.panNo || '',
                contact: operatorData.contact || '',
                permanentAddress: operatorData.permanentAddress || ''
            });
        }
    }, [operatorData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData({
            ...passwordData,
            [name]: value
        });
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword({
            ...showPassword,
            [field]: !showPassword[field]
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put(`${backendUrl}/api/operator/profile`, {
                permanentAddress: profileData.permanentAddress,
                contact: profileData.contact
            });

            if (response.data.success) {
                toast.success("Profile updated successfully");
                getOperatorData(); // Refresh operator data
                setEditMode(false);
            } else {
                toast.error(response.data.message || "Failed to update profile");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred while updating profile");
        } finally {
            setLoading(false);
        }
    };

    const verifyCurrentPassword = async () => {
        if (!passwordData.currentPassword) {
            toast.error('Please enter your current password');
            return;
        }

        setPasswordLoading(true);
        try {
            // First just verify the current password without changing anything
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/operator/verify-password`, {
                password: passwordData.currentPassword
            });

            if (data.success) {
                setPasswordStep(2); // Move to enter new password step
            } else {
                toast.error(data.message || 'Current password is incorrect');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to verify password');
            // If the verify endpoint doesn't work, we don't move forward
        } finally {
            setPasswordLoading(false);
        }
    };

    const submitPasswordChange = async () => {
        // Validate new password
        if (!passwordData.newPassword) {
            toast.error('Please enter a new password');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setPasswordLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.put(`${backendUrl}/api/operator/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            if (data.success) {
                toast.success('Password changed successfully');
                setShowPasswordModal(false);
                resetPasswordForm();
            } else {
                toast.error(data.message || 'Failed to change password');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to change password');
        } finally {
            setPasswordLoading(false);
        }
    };

    const resetPasswordForm = () => {
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
        setPasswordStep(1);
        setShowPassword({
            current: false,
            new: false,
            confirm: false
        });
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'delete') {
            toast.error('Please type "delete" to confirm account deletion');
            return;
        }

        setDeleteLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.delete(`${backendUrl}/api/operator/account`);

            if (data.success) {
                toast.success('Your account has been deleted successfully');
                setSuppressUnauthorizedToast(true);
                setIsOperatorLoggedin(false);
                navigate('/');
            } else {
                toast.error(data.message || 'Failed to delete account');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to delete account');
        } finally {
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post(`${backendUrl}/api/operator/auth/logout`);
            setSuppressUnauthorizedToast(true);
            setIsOperatorLoggedin(false);
            toast.success("Operator logged out successfully!");
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        }
    };

    return (
        <OperatorLayout>
            <div className="max-w-5xl mx-auto rounded-xl shadow-md overflow-hidden bg-white">
                {/* Header Section */}
                <div className="bg-red-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center">
                        <div className="flex items-center mb-4 md:mb-0">
                            <div className="bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center text-3xl font-bold mr-4">
                                {profileData.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{profileData.name}</h2>
                                <p className="text-gray-600">{profileData.email}</p>
                                <span className="text-green-600 text-sm">Verified Account</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 md:ml-auto mt-4 md:mt-0">
                            <button
                                onClick={() => setShowPasswordModal(true)}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                <FiKey className="mr-2" /> Change Password
                            </button>
                            <button
                                onClick={toggleEditMode}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                <FiEdit className="mr-2" /> Edit Profile
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <FiTrash2 className="mr-2" /> Delete Account
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <>
                        {/* Profile Details */}
                        <div className="p-6">
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* PAN Number */}
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <FiCalendar className="mr-2" /> PAN Number
                                        </div>
                                        <div className="text-gray-800 font-medium">
                                            {profileData.panNo || 'Not provided'}
                                        </div>
                                    </div>

                                    {/* Contact */}
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <div className="flex items-center text-gray-700 mb-2">
                                            <FiPhone className="mr-2" /> Contact Number
                                        </div>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                name="contact"
                                                value={profileData.contact}
                                                onChange={handleChange}
                                                className="w-full p-2 border border-gray-300 rounded-lg"
                                                placeholder="Enter your contact number"
                                            />
                                        ) : (
                                            <div className="text-gray-800 font-medium">
                                                {profileData.contact || 'Not provided'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Permanent Address */}
                                <div className="mt-6 bg-gray-50 p-4 rounded-md">
                                    <div className="flex items-center text-gray-700 mb-4">
                                        <FiMapPin className="mr-2" /> Permanent Address
                                    </div>

                                    {editMode ? (
                                        <input
                                            type="text"
                                            name="permanentAddress"
                                            value={profileData.permanentAddress}
                                            onChange={handleChange}
                                            className="w-full p-2 border border-gray-300 rounded-lg"
                                            placeholder="Enter your full address"
                                        />
                                    ) : (
                                        <div className="text-gray-800 font-medium">
                                            {profileData.permanentAddress || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                {editMode && (
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                            disabled={loading}
                                        >
                                            {loading ? 'Updating...' : 'Update Profile'}
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Bottom Buttons */}
                        <div className="p-6 border-t">
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center w-full px-6 py-3 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors"
                            >
                                <FiLogOut className="mr-2" /> Logout
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold text-center text-gray-800 mb-4">Change Password</h3>

                        {passwordStep === 1 ? (
                            <div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.current ? "text" : "password"}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-2.5 text-gray-500"
                                            onClick={() => togglePasswordVisibility('current')}
                                        >
                                            {showPassword.current ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordModal(false)}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={verifyCurrentPassword}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        disabled={passwordLoading}
                                    >
                                        {passwordLoading ? 'Verifying...' : 'Next'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.new ? "text" : "password"}
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-2.5 text-gray-500"
                                            onClick={() => togglePasswordVisibility('new')}
                                        >
                                            {showPassword.new ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">Confirm Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.confirm ? "text" : "password"}
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-2.5 text-gray-500"
                                            onClick={() => togglePasswordVisibility('confirm')}
                                        >
                                            {showPassword.confirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setPasswordStep(1)}
                                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submitPasswordChange}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                        disabled={passwordLoading}
                                    >
                                        {passwordLoading ? 'Updating...' : 'Change Password'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex items-center justify-center text-red-600 mb-4">
                            <FiAlertTriangle size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-center text-gray-800 mb-2">Delete Account</h3>
                        <p className="text-gray-600 text-center mb-6">
                            This action cannot be undone. All your buses, routes, and schedules will be permanently deleted.
                        </p>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Type "delete" to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="delete"
                            />
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteAccount}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </OperatorLayout>
    );
};

export default OperatorProfile; 