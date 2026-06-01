import React, { useState, useContext, useEffect, useRef } from 'react';
import { UserAppContext } from '../../context/UserAppContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPencilAlt, FaCalendarAlt, FaMapMarkerAlt, FaHome, FaPhone, FaTicketAlt, FaSignOutAlt, FaTrash, FaExclamationTriangle, FaKey, FaEye, FaEyeSlash, FaCamera } from 'react-icons/fa';

const Profile = () => {
    const navigate = useNavigate();
    const { userData, backendUrl, getUserData, setIsLoggedin, setUserData } = useContext(UserAppContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const fileInputRef = useRef(null);

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

    const [formData, setFormData] = useState({
        dateOfBirth: '',
        permanentAddress: '',
        temporaryAddress: '',
        contactNumber: ''
    });

    useEffect(() => {
        if (userData) {
            setFormData({
                dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
                permanentAddress: userData.permanentAddress || '',
                temporaryAddress: userData.temporaryAddress || '',
                contactNumber: userData.contactNumber || ''
            });
        }
    }, [userData]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
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
            axios.defaults.withCredentials = true;
            const { data } = await axios.put(`${backendUrl}/api/user/profile`, formData);

            if (data.success) {
                toast.success('Profile updated successfully');
                await getUserData(); // Refresh user data
                setIsEditing(false);
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
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
            const { data } = await axios.post(`${backendUrl}/api/user/verify-password`, {
                password: passwordData.currentPassword
            });

            if (data.success) {
                setPasswordStep(2); // Move to enter new password step
            } else {
                toast.error(data.message || 'Current password is incorrect');
            }
        } catch (error) {
            // If the verify endpoint doesn't exist or fails, we'll handle it when changing the password
            setPasswordStep(2); // Move forward anyway for this implementation
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
            const { data } = await axios.put(`${backendUrl}/api/user/change-password`, {
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

    const logout = async () => {
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
            data.success && setIsLoggedin(false);
            data.success && setUserData(false);
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleProfilePictureChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be smaller than 2MB');
            return;
        }

        setUploadingPicture(true);
        try {
            const formData = new FormData();
            formData.append('profilePicture', file);
            axios.defaults.withCredentials = true;
            const { data } = await axios.post(`${backendUrl}/api/user/profile-picture`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (data.success) {
                toast.success('Profile picture updated');
                await getUserData();
            } else {
                toast.error(data.message || 'Failed to upload picture');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload picture');
        } finally {
            setUploadingPicture(false);
            // Reset input so same file can be re-selected
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'delete-account') {
            toast.error('Please type "delete-account" correctly to confirm deletion');
            return;
        }

        setDeleteLoading(true);
        try {
            axios.defaults.withCredentials = true;
            const { data } = await axios.delete(`${backendUrl}/api/user/account`);

            if (data.success) {
                toast.success('Your account has been deleted successfully');
                setIsLoggedin(false);
                setUserData(false);
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

    if (!userData) {
        return (
            <div className="h-screen flex items-center justify-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-[8vh]">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
                        <p className="text-gray-600">Manage your account information</p>
                    </div>
                    <Link
                        to="/"
                        className="flex items-center text-primary hover:text-primary/80 font-medium"
                    >
                        <FaArrowLeft className="mr-2" /> Back to Home
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="text-center mb-6">
                                {/* Avatar with upload overlay */}
                                <div className="relative w-24 h-24 mx-auto mb-4">
                                    {userData.profilePicture ? (
                                        <img
                                            src={userData.profilePicture}
                                            alt="Profile"
                                            className="w-24 h-24 rounded-full object-cover border-2 border-primary/20"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center">
                                            <span className="text-3xl font-bold text-primary">
                                                {userData.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingPicture}
                                        className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shadow-md hover:bg-primary/90 transition-colors disabled:opacity-60"
                                        title="Change profile picture"
                                    >
                                        {uploadingPicture ? (
                                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <FaCamera className="text-xs" />
                                        )}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleProfilePictureChange}
                                    />
                                </div>
                                <h2 className="text-xl font-semibold text-gray-800">{userData.name}</h2>
                                <p className="text-sm text-gray-600">{userData.email}</p>
                            </div>

                            <div className="space-y-2">
                                <Link
                                    to="/bookings"
                                    className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <FaTicketAlt className="mr-3" /> My Bookings
                                </Link>

                                <button
                                    onClick={() => setShowPasswordModal(true)}
                                    className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    <FaKey className="mr-3" /> Change Password
                                </button>

                                <button
                                    onClick={logout}
                                    className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FaSignOutAlt className="mr-3" /> Logout
                                </button>

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <FaTrash className="mr-3" /> Delete Account
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                                {!isEditing && (
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="flex items-center text-primary hover:text-primary/80 font-medium"
                                    >
                                        <FaPencilAlt className="mr-2" /> Edit Profile
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-6">
                                    {/* Name (Read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            value={userData.name}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Email (Read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            value={userData.email}
                                            disabled
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                                        />
                                    </div>

                                    {/* Date of Birth */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <FaCalendarAlt className="mr-2" /> Date of Birth
                                        </label>
                                        <input
                                            type="date"
                                            name="dateOfBirth"
                                            value={formData.dateOfBirth}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                                !isEditing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                                            }`}
                                        />
                                    </div>

                                    {/* Contact Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <FaPhone className="mr-2" /> Contact Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="contactNumber"
                                            value={formData.contactNumber}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder="Enter your contact number"
                                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                                !isEditing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                                            }`}
                                        />
                                    </div>

                                    {/* Permanent Address */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <FaHome className="mr-2" /> Permanent Address
                                        </label>
                                        <textarea
                                            name="permanentAddress"
                                            value={formData.permanentAddress}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            rows="3"
                                            placeholder="Enter your permanent address"
                                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                                !isEditing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                                            }`}
                                        />
                                    </div>

                                    {/* Temporary Address */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                            <FaMapMarkerAlt className="mr-2" /> Temporary Address
                                        </label>
                                        <textarea
                                            name="temporaryAddress"
                                            value={formData.temporaryAddress}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            rows="3"
                                            placeholder="Enter your temporary address"
                                            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                                                !isEditing ? 'bg-gray-50 text-gray-600 cursor-not-allowed' : ''
                                            }`}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    {isEditing && (
                                        <div className="flex space-x-4">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setFormData({
                                                        dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().split('T')[0] : '',
                                                        permanentAddress: userData.permanentAddress || '',
                                                        temporaryAddress: userData.temporaryAddress || '',
                                                        contactNumber: userData.contactNumber || ''
                                                    });
                                                }}
                                                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h3>

                        {passwordStep === 1 ? (
                            <>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter your current password to continue
                                </p>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword.current ? 'text' : 'password'}
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => togglePasswordVisibility('current')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                        >
                                            {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={verifyCurrentPassword}
                                        disabled={passwordLoading}
                                        className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {passwordLoading ? 'Verifying...' : 'Continue'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            resetPasswordForm();
                                        }}
                                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-sm text-gray-600 mb-4">
                                    Enter your new password
                                </p>
                                <div className="space-y-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.new ? 'text' : 'password'}
                                                name="newPassword"
                                                value={passwordData.newPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                                                placeholder="Enter new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('new')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Confirm New Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                type={showPassword.confirm ? 'text' : 'password'}
                                                name="confirmPassword"
                                                value={passwordData.confirmPassword}
                                                onChange={handlePasswordChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent pr-10"
                                                placeholder="Confirm new password"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => togglePasswordVisibility('confirm')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                            >
                                                {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        onClick={submitPasswordChange}
                                        disabled={passwordLoading}
                                        className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {passwordLoading ? 'Changing...' : 'Change Password'}
                                    </button>
                                    <button
                                        onClick={() => setPasswordStep(1)}
                                        className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Back
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center text-red-600 mb-4">
                            <FaExclamationTriangle className="text-2xl mr-3" />
                            <h3 className="text-xl font-semibold">Delete Account</h3>
                        </div>

                        <p className="text-gray-700 mb-4">
                            This action cannot be undone. All your data including bookings and profile information will be permanently deleted.
                        </p>

                        <p className="text-sm text-gray-600 mb-4">
                            Type <span className="font-semibold">delete-account</span> to confirm:
                        </p>

                        <input
                            type="text"
                            value={deleteConfirmation}
                            onChange={(e) => setDeleteConfirmation(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                            placeholder="Type delete-account"
                        />

                        <div className="flex space-x-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading || deleteConfirmation !== 'delete-account'}
                                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete Account'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
   
};

export default Profile; 