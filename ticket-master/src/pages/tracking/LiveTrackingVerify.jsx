import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAppContext } from '../../context/UserAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaSearch, FaMapMarkerAlt, FaClock, FaInfoCircle } from 'react-icons/fa';
import LoadingSpinner from '../../components/loading/LoadingSpinner';

const LiveTrackingVerify = () => {
    const { backendUrl } = useContext(UserAppContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        bookingId: '',
        travelDate: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeError, setTimeError] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
        setTimeError(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.bookingId.trim()) {
            setError('Please enter a booking ID');
            return;
        }

        if (!formData.travelDate) {
            setError('Please select a travel date');
            return;
        }

        setLoading(true);
        setError(null);
        setTimeError(false);

        try {
            axios.defaults.withCredentials = true;
            const response = await axios.get(`${backendUrl}/api/bookings/verify`, {
                params: {
                    bookingId: formData.bookingId,
                    travelDate: formData.travelDate
                }
            });

            if (response.data.success) {
                // If verification is successful, navigate to the tracking page
                navigate(`/live-tracking/${formData.bookingId}`, {
                    state: {
                        verified: true,
                        busId: response.data.busId,
                        bookingData: response.data.booking
                    }
                });
            } else {
                setError(response.data.message || 'Unable to verify booking information');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'An error occurred while verifying your booking';

            // Check if error is related to time validation
            if (errorMsg.includes('12 hours before') || errorMsg.includes('12 hours after')) {
                setTimeError(true);
            }

            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[90vh] pt-[8vh] flex flex-col items-center bg-gray-50">
            <div className="container max-w-xl mx-auto px-4 py-12">
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                    <div className="flex items-center justify-center mb-6">
                        <FaMapMarkerAlt className="text-primary text-3xl mr-3" />
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Live Bus Tracking</h1>
                    </div>

                    <p className="text-gray-600 mb-6 text-center">
                        Enter your booking details to track your bus in real-time
                    </p>

                    {error && (
                        <div className={`${timeError ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-600'} p-4 rounded-lg mb-6`}>
                            {timeError ? (
                                <>
                                    <p className="flex items-center mb-1">
                                        <FaClock className="inline-block mr-2" />
                                        <span className="font-medium">Time Restriction</span>
                                    </p>
                                    <p>
                                        Live tracking is only available 12 hours before your departure time and 12 hours after your arrival time.
                                    </p>
                                </>
                            ) : (
                                error
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="bookingId" className="block text-sm font-medium text-gray-700 mb-1">
                                Booking ID
                            </label>
                            <input
                                type="text"
                                id="bookingId"
                                name="bookingId"
                                value={formData.bookingId}
                                onChange={handleChange}
                                placeholder="Enter your booking ID"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                disabled={loading}
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="travelDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Travel Date
                            </label>
                            <input
                                type="date"
                                id="travelDate"
                                name="travelDate"
                                value={formData.travelDate}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full flex items-center justify-center bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/80 transition duration-200 disabled:bg-gray-400"
                            disabled={loading}
                        >
                            {loading ? (
                                <LoadingSpinner size="sm" />
                            ) : (
                                <>
                                    <FaSearch className="mr-2" />
                                    Track My Bus
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-sm text-gray-500 text-center">
                        <p>
                            Note: Live tracking is only available for buses that are currently sharing their location, for confirmed bookings, and within 12 hours before departure or after arrival.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveTrackingVerify; 