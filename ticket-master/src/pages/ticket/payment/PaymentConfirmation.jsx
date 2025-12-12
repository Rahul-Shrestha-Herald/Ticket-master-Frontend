import React, { useEffect, useState, useContext, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { UserAppContext } from '../../../context/UserAppContext';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import axios from 'axios';
import { IoTimeOutline } from 'react-icons/io5';

const PaymentConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { backendUrl } = useContext(UserAppContext);
    const [countdown, setCountdown] = useState('00:00');
    const [paymentData, setPaymentData] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState('');
    const [bookingId, setBookingId] = useState('');
    const [loading, setLoading] = useState(false);

    // Use refs to store timer and time left to avoid re-renders
    const timerRef = useRef(null);
    const timeLeftRef = useRef(600); // Default 10 minutes in seconds
    // Track toast notifications to prevent duplicates
    const toastDisplayedRef = useRef({
        initial: false,
        fiveMinutes: false,
        twoMinutes: false,
        oneMinute: false
    });

    // Add a new ref to track if payment has been initiated
    const paymentInitiatedRef = useRef(false);

    // Extract data from location state
    const { ticketDetails, passengerInfo, reservation } = location.state || {};

    // Format time as MM:SS (without triggering re-renders)
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get color class based on time left (without using state)
    const getTimerColorClass = () => {
        const timeLeft = timeLeftRef.current;
        if (timeLeft < 60) return 'text-red-600'; // Less than 1 minute
        if (timeLeft < 180) return 'text-amber-600'; // Less than 3 minutes
        return 'text-green-600';
    };

    useEffect(() => {
        // Fetch the current reservation status to get the exact remaining time
        const checkReservation = async () => {
            if (!reservation || !reservation.id || !backendUrl) return;

            try {
                const response = await axios.get(`${backendUrl}/api/bus/reservation/${reservation.id}`);
                if (response.data.success) {
                    // Get the server-provided remaining time
                    const remainingTime = response.data.data.timeRemaining;
                    timeLeftRef.current = remainingTime;

                    // Update display once
                    setCountdown(formatTime(remainingTime));

                    // Store the exact expiry time in localStorage for consistency
                    const expiryTime = new Date(Date.now() + remainingTime * 1000);
                    localStorage.setItem('reservationExpiry', expiryTime.toISOString());

                    // Show initial toast notification
                    if (!toastDisplayedRef.current.initial) {
                        toast.info("Please complete your payment before the reservation expires", {
                            position: "top-right",
                            autoClose: 5000
                        });
                        toastDisplayedRef.current.initial = true;
                    }
                } else {
                    // Reservation expired or doesn't exist
                    navigate('/bus-tickets');
                }
            } catch (error) {
                console.error('Error checking reservation:', error);
                navigate('/bus-tickets');
            }
        };

        checkReservation();

        // Set up timer DOM updates outside of React's render cycle to avoid scrolling issues
        const setupTimer = () => {
            // Clear any existing timer
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            // Setup timer that updates DOM directly without state updates
            timerRef.current = setInterval(() => {
                // Decrement the time left
                timeLeftRef.current -= 1;

                // Check toast notification thresholds without causing re-renders
                if (timeLeftRef.current === 300 && !toastDisplayedRef.current.fiveMinutes) { // 5 minutes
                    toast.warning("Only 5 minutes left to complete your payment!", {
                        position: "top-right",
                        autoClose: 5000,
                        style: { backgroundColor: '#FEFCE8', color: '#92400E' }
                    });
                    toastDisplayedRef.current.fiveMinutes = true;
                } else if (timeLeftRef.current === 120 && !toastDisplayedRef.current.twoMinutes) { // 2 minutes
                    toast.warning("Only 2 minutes left to complete your payment!", {
                        position: "top-right",
                        autoClose: 5000,
                        style: { backgroundColor: '#FEF3C7', color: '#9A3412' }
                    });
                    toastDisplayedRef.current.twoMinutes = true;
                } else if (timeLeftRef.current === 60 && !toastDisplayedRef.current.oneMinute) { // 1 minute
                    toast.error("FINAL WARNING: Only 1 minute left to complete payment!", {
                        position: "top-right",
                        autoClose: 10000,
                        style: { backgroundColor: '#FEE2E2', color: '#B91C1C', fontWeight: 'bold' }
                    });
                    toastDisplayedRef.current.oneMinute = true;
                }

                // Direct DOM updates instead of state changes to avoid re-renders
                const timerElement = document.getElementById('reservation-timer');
                if (timerElement) {
                    timerElement.textContent = formatTime(timeLeftRef.current);

                    // Update color class directly
                    timerElement.className = `font-bold text-xl ${getTimerColorClass()}`;
                }

                // Check if time expired
                if (timeLeftRef.current <= 0) {
                    clearInterval(timerRef.current);
                    toast.error("Your reservation time has expired. Please try booking again.", {
                        position: "top-right",
                        autoClose: 5000
                    });
                    releaseReservation();
                }
            }, 1000);
        };

        // Start the timer
        setupTimer();

        // Cleanup
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [reservation, backendUrl, navigate]);

    useEffect(() => {
        // Only initiate payment if not already done and we have the necessary data
        if (!paymentInitiatedRef.current && backendUrl && ticketDetails && passengerInfo && reservation) {
            initiatePayment();
        }
    }, [backendUrl, ticketDetails, passengerInfo, reservation]);

    // Check localStorage for existing payment data on component mount
    useEffect(() => {
        // Check if we already have a payment URL for this reservation
        const existingReservationId = localStorage.getItem('reservationId');
        const storedPaymentUrl = localStorage.getItem('paymentUrl');

        if (reservation?.id && existingReservationId === reservation.id && storedPaymentUrl) {
            console.log('Found existing payment URL in localStorage');
            setPaymentUrl(storedPaymentUrl);

            // Also try to get booking ID if available
            const storedBookingId = localStorage.getItem('bookingId');
            if (storedBookingId) {
                setBookingId(storedBookingId);
            }

            // Try to parse payment data if available
            try {
                const storedPaymentData = localStorage.getItem('paymentData');
                if (storedPaymentData) {
                    setPaymentData(JSON.parse(storedPaymentData));
                }
            } catch (e) {
                console.error('Error parsing stored payment data:', e);
            }
        }
    }, [reservation]);

    const releaseReservation = async () => {
        try {
            if (reservation && reservation.id) {
                await axios.post(`${backendUrl}/api/reservation/release`, {
                    reservationId: reservation.id
                });
            }
            navigate('/bus-tickets');
        } catch (error) {
            console.error('Error releasing reservation:', error);
            navigate('/bus-tickets');
        }
    };

    const initiatePayment = async () => {
        try {
            // Don't attempt if we don't have required data or if payment was already initiated
            if (paymentInitiatedRef.current || !ticketDetails?.totalPrice || !reservation?.id || !passengerInfo?.name || !backendUrl) {
                return;
            }

            // Mark as initiated to prevent multiple calls
            paymentInitiatedRef.current = true;
            setLoading(true);

            // Create an object with the data needed for payment
            const paymentData = {
                amount: ticketDetails.totalPrice,
                reservationId: reservation.id,
                passengerInfo: {
                    name: passengerInfo.name,
                    email: passengerInfo.email,
                    phone: passengerInfo.phone,
                    alternatePhone: passengerInfo.alternatePhone,
                },
                ticketInfo: {
                    busId: ticketDetails.busId,
                    busName: ticketDetails.busName,
                    busNumber: ticketDetails.busNumber,
                    fromLocation: ticketDetails.fromLocation,
                    toLocation: ticketDetails.toLocation,
                    departureTime: ticketDetails.departureTime,
                    arrivalTime: ticketDetails.arrivalTime,
                    selectedSeats: ticketDetails.selectedSeats,
                    pickupPoint: ticketDetails.pickupPoint,
                    dropPoint: ticketDetails.dropPoint,
                    date: ticketDetails.date || location.state?.date,
                },
                pickupPointId: passengerInfo.pickupPointId,
                dropPointId: passengerInfo.dropPointId,
            };

            // Check if a payment for this reservation exists in localStorage
            const existingPaymentData = localStorage.getItem('paymentData');
            const existingReservationId = localStorage.getItem('reservationId');

            if (existingPaymentData && existingReservationId === reservation.id) {
                console.log('Using existing payment data from localStorage');
                try {
                    // Try to use the existing payment data if it's for the same reservation
                    setPaymentData(JSON.parse(existingPaymentData));

                    // Check if we have a payment URL stored
                    const storedPaymentUrl = localStorage.getItem('paymentUrl');
                    if (storedPaymentUrl) {
                        setPaymentUrl(storedPaymentUrl);
                        setLoading(false);
                        return;
                    }
                } catch (e) {
                    // If parsing fails, continue with the new payment request
                    console.error('Error parsing stored payment data:', e);
                }
            }

            // Send request to backend to initiate Khalti payment
            const response = await axios.post(`${backendUrl}/api/payment/initiate`, paymentData);

            // If successful, store payment URL but don't redirect yet
            if (response.data.success) {
                setPaymentData(paymentData);
                setPaymentUrl(response.data.paymentUrl);
                setBookingId(response.data.bookingId || '');

                // Store payment state in localStorage
                localStorage.setItem('paymentInitiated', 'true');
                localStorage.setItem('paymentData', JSON.stringify(paymentData));
                localStorage.setItem('reservationId', reservation.id);
                localStorage.setItem('paymentUrl', response.data.paymentUrl);

                // If the response includes a message about using an existing payment session
                if (response.data.message?.includes('existing payment session')) {
                    toast.info('Using your existing payment session', {
                        position: "top-right",
                        autoClose: 3000
                    });
                }
            } else {
                toast.error(response.data.message || 'Payment initiation failed. Please try again.');
                // Reset the initiated flag if there was an error so we can try again
                paymentInitiatedRef.current = false;
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            if (error.response) {
                console.log('Error response data:', error.response.data);
                toast.error(error.response.data.message || 'Payment service error. Please try again.');
            } else {
                toast.error('Network error. Please check your connection and try again.');
            }
            // Reset the initiated flag if there was an error so we can try again
            paymentInitiatedRef.current = false;
        } finally {
            setLoading(false);
        }
    };

    const handlePayNow = () => {
        // Only redirect to payment URL if we have one and we're not already loading
        if (paymentUrl && !loading) {
            // Set loading to prevent multiple clicks
            setLoading(true);
            window.location.href = paymentUrl;
        } else if (!paymentUrl) {
            toast.error('Payment gateway not available. Please try again.');
        }
    };

    return (
        <div className='w-full space-y-12 pb-16'>
            <TopLayout
                bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
                title={"Confirm Your Booking Details"}
            />

            <RootLayout className="space-y-8 w-full pb-16">
                <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-4 md:p-6 lg:p-8">
                    <div className="space-y-4 md:space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 md:pb-4 gap-2">
                            <h2 className="text-xl md:text-2xl font-bold text-neutral-800">Booking Confirmation</h2>
                            <div className="text-left sm:text-right">
                                <p className="text-xs md:text-sm text-gray-500">Booking ID</p>
                                <p className="font-medium text-primary">{bookingId}</p>
                            </div>
                        </div>

                        {/* Timer - Sticky on mobile only */}
                        <div className="sticky top-0 left-0 right-0 z-20 bg-white pt-2 pb-3 -mx-4 px-4 md:static md:pt-0 md:pb-0 md:mx-0 md:px-0 md:bg-transparent">
                            <div className="bg-neutral-100 rounded-lg p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="flex items-center">
                                    <IoTimeOutline className="text-lg md:text-xl mr-2" />
                                    <p className="font-medium text-sm md:text-base text-neutral-700">Reservation expires in:</p>
                                </div>
                                <p id="reservation-timer" className={`font-bold text-lg md:text-xl ${getTimerColorClass()}`}>{countdown}</p>
                            </div>
                            <div className="bg-amber-100 border-l-4 border-amber-500 p-2 md:p-3 rounded mt-2">
                                <p className="text-amber-800 text-sm md:text-base font-semibold flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    Please complete your payment before the reservation expires
                                </p>
                            </div>
                        </div>

                        {/* Journey Details */}
                        <div className="space-y-3 md:space-y-4">
                            <h3 className="text-base md:text-lg font-semibold text-neutral-700">Journey Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">From</p>
                                    <p className="text-sm md:text-base font-medium">{ticketDetails?.fromLocation}</p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">To</p>
                                    <p className="text-sm md:text-base font-medium">{ticketDetails?.toLocation}</p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Date</p>
                                    <p className="text-sm md:text-base font-medium">{new Date(ticketDetails?.date).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Time</p>
                                    <p className="text-sm md:text-base font-medium">{ticketDetails?.departureTime}</p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Bus</p>
                                    <p className="text-sm md:text-base font-medium">{ticketDetails?.busName} ({ticketDetails?.busNumber})</p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Seats</p>
                                    <p className="text-sm md:text-base font-medium">{Array.isArray(ticketDetails?.selectedSeats) ? ticketDetails.selectedSeats.join(', ') : ticketDetails?.selectedSeats}</p>
                                </div>
                            </div>
                        </div>
                        <hr className="my-3 md:my-4 border-gray-300" />

                        {/* Pickup/Drop Details */}
                        <div className="space-y-3 md:space-y-4">
                            <h3 className="text-base md:text-lg font-semibold text-neutral-700">Pickup & Drop Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Pickup Point</p>
                                    <p className="text-sm md:text-base font-medium">{ticketDetails?.pickupPoint}</p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Drop Point</p>
                                    <p className="text-sm md:text-base font-medium">{ticketDetails?.dropPoint}</p>
                                </div>
                            </div>
                        </div>
                        <hr className="my-3 md:my-4 border-gray-300" />

                        {/* Passenger Details */}
                        <div className="space-y-3 md:space-y-4">
                            <h3 className="text-base md:text-lg font-semibold text-neutral-700">Passenger Details</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Name</p>
                                    <p className="text-sm md:text-base font-medium">{passengerInfo?.name}</p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Phone</p>
                                    <p className="text-sm md:text-base font-medium">{passengerInfo?.phone}</p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Email</p>
                                    <p className="text-sm md:text-base font-medium">{passengerInfo?.email}</p>
                                </div>
                                <div>
                                    <p className="text-xs md:text-sm text-gray-500">Secondary Phone</p>
                                    <p className="text-sm md:text-base font-medium">{passengerInfo?.alternatePhone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-neutral-50 p-3 md:p-4 rounded-lg border-t border-b border-neutral-200">
                            <div className="flex items-center justify-between font-bold">
                                <p className="text-base md:text-lg">Total Amount</p>
                                <p className="text-lg md:text-xl text-primary">NPR {ticketDetails?.totalPrice}</p>
                            </div>
                        </div>

                        {/* Pay Now Button */}
                        <div className="flex justify-center pt-3 md:pt-4">
                            <button
                                onClick={handlePayNow}
                                disabled={loading || !paymentUrl}
                                className="w-full max-w-md h-11 md:h-14 bg-primary hover:bg-primary/90 text-white font-bold text-base md:text-lg rounded-lg flex items-center justify-center gap-x-2 disabled:bg-gray-400"
                            >
                                {loading ? 'Preparing Payment...' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </RootLayout>
        </div>
    );
};

export default PaymentConfirmation;