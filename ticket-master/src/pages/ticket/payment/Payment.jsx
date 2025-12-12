import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserAppContext } from '../../../context/UserAppContext';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { backendUrl } = useContext(UserAppContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [paymentInitiated, setPaymentInitiated] = useState(false);
    const [expiryTime, setExpiryTime] = useState(10 * 60); // 10 minutes in seconds
    const [expiryDisplay, setExpiryDisplay] = useState('');

    // Extract data from location state
    const { ticketDetails, passengerInfo, reservation } = location.state || {};

    // Countdown timer for reservation expiry
    useEffect(() => {
        if (!loading && reservation) {
            const timer = setInterval(() => {
                setExpiryTime(prevTime => {
                    if (prevTime <= 0) {
                        clearInterval(timer);
                        // Release seats and redirect
                        releaseReservation();
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [loading, reservation]);

    // Format seconds to MM:SS
    useEffect(() => {
        const minutes = Math.floor(expiryTime / 60);
        const seconds = expiryTime % 60;
        setExpiryDisplay(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, [expiryTime]);

    // Release reservation and redirect when timer expires
    const releaseReservation = async () => {
        try {
            if (reservation && reservation.id) {
                await axios.post(`${backendUrl}/api/reservation/release`, {
                    reservationId: reservation.id
                });
            }
            toast.error('Reservation expired. Please try again.');
            navigate('/bus-tickets');
        } catch (error) {
            console.error('Error releasing reservation:', error);
            navigate('/bus-tickets');
        }
    };

    useEffect(() => {
        // Check if we're returning from Khalti payment URL
        const isReturningFromKhalti = location.state?.returningFromKhalti;

        if (isReturningFromKhalti) {
            // If returning from Khalti, redirect back to booking page
            toast.info('Payment was not completed. Please try again.');
            navigate('/bus-tickets');
            return;
        }

        // Validate that required data is available
        if (!ticketDetails || !passengerInfo || !reservation) {
            setError('Booking information is missing. Please try again.');
            setLoading(false);
            return;
        }

        // Only initiate payment if it hasn't been initiated yet
        if (!paymentInitiated) {
            initiatePayment();
        }
    }, [location.state, backendUrl, navigate, paymentInitiated]);

    const initiatePayment = async () => {
        try {
            setLoading(true);
            setError(null);

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
                    date: ticketDetails.date || location.state.date,
                },
                pickupPointId: passengerInfo.pickupPointId,
                dropPointId: passengerInfo.dropPointId,
            };

            // Send request to backend to initiate Khalti payment
            const response = await axios.post(`${backendUrl}/api/payment/initiate`, paymentData);

            // If successful, redirect to Khalti payment page
            if (response.data.success) {
                setPaymentInitiated(true);
                // Store payment state in localStorage
                localStorage.setItem('paymentInitiated', 'true');
                localStorage.setItem('paymentData', JSON.stringify(paymentData));
                localStorage.setItem('reservationId', reservation.id);
                localStorage.setItem('reservationExpiry', new Date(Date.now() + expiryTime * 1000).toISOString());
                // Redirect to Khalti payment URL
                window.location.href = response.data.paymentUrl;
            } else {
                // Handle error
                setError(response.data.message || 'Payment initiation failed. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Payment initiation error:', error);
            setError('Payment service is currently unavailable. Please try again later.');
            setLoading(false);
        }
    };

    // If data is missing, redirect back to ticket page
    useEffect(() => {
        if (error) {
            toast.error(error);
            // Redirect after a short delay
            const timer = setTimeout(() => {
                navigate('/bus-tickets');
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [error, navigate]);

    return (
        <div className='w-full space-y-12 pb-16'>
            {/* Top Layout */}
            <TopLayout
                bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
                title={"Processing Payment"}
            />

            <RootLayout className="space-y-12 w-full pb-16 min-h-[50vh] flex items-center justify-center">
                {loading ? (
                    <div className="text-center space-y-4">
                        <LoadingSpinner size="large" />
                        <p className="text-lg text-neutral-700">
                            Initializing payment gateway. Please wait...
                        </p>
                        {reservation && (
                            <div className="mt-3 text-amber-600 font-medium">
                                <p>Reservation expires in: {expiryDisplay}</p>
                                <p className="text-sm text-neutral-500 mt-1">
                                    Please complete your payment before the reservation expires
                                </p>
                            </div>
                        )}
                    </div>
                ) : error ? (
                    <div className="text-center space-y-4">
                        <div className="text-red-500 text-xl">
                            <i className="fas fa-exclamation-circle text-5xl"></i>
                        </div>
                        <p className="text-lg text-red-500">{error}</p>
                        <p className="text-neutral-500">You will be redirected shortly...</p>
                    </div>
                ) : null}
            </RootLayout>
        </div>
    );
};

export default Payment; 