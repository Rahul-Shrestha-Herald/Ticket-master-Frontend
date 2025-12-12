import React, { useState, useContext, useEffect } from 'react';
import { UserAppContext } from '../../context/UserAppContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPencilAlt, FaCalendarAlt, FaMapMarkerAlt, FaHome, FaPhone, FaTicketAlt, FaSignOutAlt, FaTrash, FaExclamationTriangle, FaKey, FaEye, FaEyeSlash } from 'react-icons/fa';

const Profile = () => {
    const navigate = useNavigate();
    const { userData, backendUrl, getUserData, setIsLoggedin, setUserData } = useContext(UserAppContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);

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

   
};

export default Profile; 