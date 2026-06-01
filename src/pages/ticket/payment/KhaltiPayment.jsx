/**
 * New Khalti Payment Component
 * Modern implementation with better UX
 */

import React, { useContext, useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserAppContext } from '../../../context/UserAppContext';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import { IoTimeOutline, IoShieldCheckmarkOutline, IoCardOutline } from 'react-icons/io5';

const KhaltiPayment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { backendUrl } = useContext(UserAppContext);
    
    const [loading, setLoading] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState('10:00');
    
    const paymentInitiatedRef = useRef(false);
    const timerRef = useRef(null);
    const timeLeftRef = useRef(600); // 10 minutes

    // Extract data from location state
    const { ticketDetails, passengerInfo, reservation } = location.state || {};

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Timer color based on time left
    const getTimerColor = () => {
        if (timeLeftRef.current < 60) return 'text-red-600';
        if (timeLeftRef.current < 180) return 'text-amber-600';
        return 'text-green-600';
    };

    // Setup countdown timer
    useEffect(() => {
        if (!loading && reservation) {
            timerRef.current = setInterval(() => {
                timeLeftRef.current -= 1;
                
                const timerElement = document.getElementById('payment-timer');
                if (timerElement) {
                    timerElement.textContent = formatTime(timeLeftRef.current);
                    timerElement.className = `font-bold text-xl ${getTimerColor()}`;
                }

                if (timeLeftRef.current <= 0) {
                    clearInterval(timerRef.current);
                    toast.error('Reservation expired. Please try again.');
                    navigate('/bus-tickets');
                }
            }, 1000);

            return () => clearInterval(timerRef.current);
        }
    }, [loading, reservation, navigate]);

    // Validate data and initiate payment
    useEffect(() => {
        if (!ticketDetails || !passengerInfo || !reservation) {
            setError('Booking information is missing. Please try again.');
            return;
        }

        if (!paymentInitiatedRef.current) {
            initiatePayment();
        }
    }, [ticketDetails, passengerInfo, reservation]);

    const initiatePayment = async () => {
        try {
            if (paymentInitiatedRef.current) return;
            
            paymentInitiatedRef.current = true;
            setLoading(true);
            setError(null);

            // Set credentials for cookie-based auth
            axios.defaults.withCredentials = true;

            // Prepare payment data
            const paymentData = {
                amount: ticketDetails.totalPrice,
                reservationId: reservation.id,
                passengerInfo: {
                    name: passengerInfo.name,
                    email: passengerInfo.email,
                    phone: passengerInfo.phone,
                    alternatePhone: passengerInfo.alternatePhone || null
                },
                ticketInfo: {
                    busId: ticketDetails.busId,
                    busName: ticketDetails.busName,
                    busNumber: ticketDetails.busNumber,
                    fromLocation: ticketDetails.fromLocation,
                    toLocation: ticketDetails.toLocation,
                    departureTime: ticketDetails.departureTime,
                    arrivalTime: ticketDetails.arrivalTime,
                    date: ticketDetails.date,
                    selectedSeats: ticketDetails.selectedSeats,
                    pickupPoint: ticketDetails.pickupPoint,
                    dropPoint: ticketDetails.dropPoint
                },
                pickupPointId: passengerInfo.pickupPointId,
                dropPointId: passengerInfo.dropPointId
            };

            console.log('→ Initiating Khalti payment...');

            // Call new Khalti API endpoint
            const response = await axios.post(
                `${backendUrl}/api/khalti/initiate`,
                paymentData,
                { timeout: 15000 }
            );

            if (response.data.success) {
                console.log('✓ Payment session created');
                
                setPaymentUrl(response.data.paymentUrl);
                setBookingId(response.data.bookingId);

                // Store in localStorage
                localStorage.setItem('khalti_payment_url', response.data.paymentUrl);
                localStorage.setItem('khalti_pidx', response.data.pidx);
                localStorage.setItem('khalti_booking_id', response.data.bookingId);
                localStorage.setItem('khalti_reservation_id', reservation.id);

                if (response.data.message?.includes('Existing')) {
                    toast.info('Using existing payment session');
                }

                setLoading(false);
            } else {
                throw new Error(response.data.message || 'Payment initiation failed');
            }

        } catch (error) {
            console.error('✗ Payment initiation failed:', error);
            
            let errorMessage = 'Payment service is currently unavailable.';
            
            if (error.response?.data) {
                errorMessage = error.response.data.error || error.response.data.message || errorMessage;
            } else if (error.request) {
                errorMessage = 'Unable to connect to payment service. Check your connection.';
            }
            
            setError(errorMessage);
            setLoading(false);
            paymentInitiatedRef.current = false;
        }
    };

    const handlePayNow = () => {
        if (paymentUrl) {
            console.log('→ Redirecting to Khalti...');
            window.location.href = paymentUrl;
        } else {
            toast.error('Payment URL not available. Please try again.');
        }
    };

    // Show error and redirect
    useEffect(() => {
        if (error) {
            toast.error(error);
            const timer = setTimeout(() => {
                navigate('/bus-tickets');
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error, navigate]);

    return (
        <div className='w-full space-y-12 pb-16'>
            <TopLayout
                bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
                title={"Secure Payment"}
            />

            <RootLayout className="space-y-8 w-full pb-16">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 md:p-8">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                        <div className="flex items-center gap-3">
                            <IoCardOutline className="text-3xl text-primary" />
                            <div>
                                <h2 className="text-2xl font-bold text-neutral-800">Khalti Payment</h2>
                                <p className="text-sm text-gray-500">Secure payment gateway</p>
                            </div>
                        </div>
                        {bookingId && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Booking ID</p>
                                <p className="font-semibold text-primary">{bookingId}</p>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-12 space-y-4">
                            <LoadingSpinner size="large" />
                            <p className="text-lg text-neutral-700">Preparing secure payment...</p>
                            <p className="text-sm text-gray-500">Please wait while we connect to Khalti</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12 space-y-4">
                            <div className="text-red-500 text-5xl">
                                <i className="fas fa-exclamation-circle"></i>
                            </div>
                            <p className="text-lg text-red-500">{error}</p>
                            <p className="text-sm text-gray-500">Redirecting back...</p>
                        </div>
                    ) : (
                        <>
                            {/* Timer */}
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 mb-6 border border-amber-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <IoTimeOutline className="text-xl text-amber-600" />
                                        <span className="font-medium text-neutral-700">Time Remaining:</span>
                                    </div>
                                    <span id="payment-timer" className={`font-bold text-xl ${getTimerColor()}`}>
                                        {countdown}
                                    </span>
                                </div>
                                <p className="text-xs text-amber-700 mt-2">
                                    Complete your payment before the timer expires
                                </p>
                            </div>

                            {/* Booking Summary */}
                            <div className="space-y-4 mb-6">
                                <h3 className="text-lg font-semibold text-neutral-700">Booking Summary</h3>
                                
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-gray-500">From</p>
                                        <p className="font-medium">{ticketDetails?.fromLocation}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">To</p>
                                        <p className="font-medium">{ticketDetails?.toLocation}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Date</p>
                                        <p className="font-medium">
                                            {new Date(ticketDetails?.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Seats</p>
                                        <p className="font-medium">
                                            {ticketDetails?.selectedSeats?.join(', ')}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-primary/5 rounded-lg p-4 flex justify-between items-center">
                                    <span className="text-lg font-semibold">Total Amount</span>
                                    <span className="text-2xl font-bold text-primary">
                                        NPR {ticketDetails?.totalPrice}
                                    </span>
                                </div>
                            </div>

                            {/* Security Badge */}
                            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 rounded-lg p-3 mb-6">
                                <IoShieldCheckmarkOutline className="text-xl" />
                                <span>Secured by Khalti - Your payment is safe and encrypted</span>
                            </div>

                            {/* Pay Button */}
                            <button
                                onClick={handlePayNow}
                                disabled={!paymentUrl}
                                className="w-full h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-lg rounded-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                            >
                                <IoCardOutline className="text-2xl" />
                                Pay with Khalti
                            </button>

                            <p className="text-xs text-center text-gray-500 mt-4">
                                You will be redirected to Khalti's secure payment page
                            </p>
                        </>
                    )}
                </div>
            </RootLayout>
        </div>
    );
};

export default KhaltiPayment;
