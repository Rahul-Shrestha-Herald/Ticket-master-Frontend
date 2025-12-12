import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserAppContext } from '../../../context/UserAppContext';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';

const PaymentCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { backendUrl } = useContext(UserAppContext);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('processing');
    const [ticketId, setTicketId] = useState(null);
    const [bookingId, setBookingId] = useState('');
    const [verificationAttempted, setVerificationAttempted] = useState(false);

    useEffect(() => {
        // Parse the URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const pidx = searchParams.get('pidx');
        const status = searchParams.get('status');
        const purchase_order_id = searchParams.get('purchase_order_id');

        if (!pidx) {
            toast.error('Invalid payment response. Missing transaction identifier.');
            setStatus('failed');
            setLoading(false);
            // Release reservation if payment was initiated
            releaseReservation();
            return;
        }

        // Only verify payment if it hasn't been attempted yet
        if (!verificationAttempted) {
            verifyPayment(pidx, status, purchase_order_id);
        }
    }, [location, backendUrl, navigate, verificationAttempted]);

    // Release reservation if payment failed
    const releaseReservation = async () => {
        try {
            const reservationId = localStorage.getItem('reservationId');
            if (reservationId) {
                await axios.post(`${backendUrl}/api/reservation/release`, {
                    reservationId
                });
                console.log('Reservation released');
            }
        } catch (error) {
            console.error('Error releasing reservation:', error);
        } finally {
            // Clear storage
            localStorage.removeItem('paymentInitiated');
            localStorage.removeItem('paymentVerified');
            localStorage.removeItem('paymentData');
            localStorage.removeItem('reservationId');
            localStorage.removeItem('reservationExpiry');
        }
    };

    // Mark reservation as confirmed (permanent) after successful payment
    const confirmReservation = async (ticketId, bookingId) => {
        try {
            const reservationId = localStorage.getItem('reservationId');
            if (reservationId) {
                await axios.post(`${backendUrl}/api/reservation/confirm`, {
                    reservationId,
                    ticketId,
                    bookingId
                });
                console.log('Reservation confirmed permanently');
            }
        } catch (error) {
            console.error('Error confirming reservation:', error);
        }
    };

    const verifyPayment = async (pidx, status, purchase_order_id) => {
        try {
            setLoading(true);
            setVerificationAttempted(true);

            // Check if reservation has expired
            const expiryTime = localStorage.getItem('reservationExpiry');
            if (expiryTime && new Date(expiryTime) < new Date()) {
                // Reservation expired
                setStatus('failed');

                // Instead of trying multiple sources, prioritize getting the booking ID directly 
                // from the database using the pidx which is the most reliable identifier
                try {
                    // Make a specific API call to get ticket info by transaction ID (pidx)
                    const ticketResponse = await axios.post(`${backendUrl}/api/payment/ticket-by-transaction`, {
                        pidx,
                        purchase_order_id
                    });

                    if (ticketResponse.data.success && ticketResponse.data.bookingId) {
                        setBookingId(ticketResponse.data.bookingId);
                        console.log('Retrieved correct booking ID from database:', ticketResponse.data.bookingId);
                    } else {
                        // Fallback to existing methods
                        fallbackGetBookingId(purchase_order_id);
                    }
                } catch (error) {
                    console.error('Error fetching ticket by transaction:', error);
                    // Fallback to existing methods
                    fallbackGetBookingId(purchase_order_id);
                }

                toast.error('Your reservation has expired. Please try again.');

                // Don't clear storage until AFTER we've extracted booking ID
                setTimeout(() => {
                    releaseReservation();
                }, 500);

                return;
            }

            const reservationId = localStorage.getItem('reservationId');
            if (!reservationId) {
                setStatus('failed');
                // Try to get booking ID from payment data if reservation is missing
                const paymentData = localStorage.getItem('paymentData');
                if (paymentData) {
                    try {
                        const parsedData = JSON.parse(paymentData);
                        if (parsedData.bookingId) {
                            setBookingId(parsedData.bookingId);
                        }
                    } catch (error) {
                        console.error('Error parsing payment data:', error);
                    }
                }
                toast.error('Reservation information is missing.');
                return;
            }

            const response = await axios.post(`${backendUrl}/api/payment/verify`, {
                pidx,
                status,
                purchase_order_id,
                reservationId
            });

            if (response.data.success) {
                try {
                    const { ticketId, bookingId, invoiceData } = response.data;

                    // Store booking ID in localStorage for reference
                    localStorage.setItem('bookingId', bookingId);
                    localStorage.setItem('ticketId', ticketId);
                    localStorage.setItem('paymentVerified', 'true');

                    // Clean up payment initiation data
                    localStorage.removeItem('paymentUrl');
                    localStorage.removeItem('paymentInitiated');
                    localStorage.removeItem('reservationExpiry');

                    // Set local state for rendering
                    setTicketId(ticketId);
                    setBookingId(bookingId);
                    setStatus('success');

                    toast.success('Payment successful! Redirecting to your ticket.');

                    // Navigate to invoice
                    setTimeout(() => {
                        navigate('/bus-tickets/invoice', {
                            state: {
                                ticketId: ticketId,
                                invoiceData: response.data.invoiceData,
                                paymentVerified: true
                            }
                        });
                    }, 2000);
                } catch (confirmError) {
                    console.error('Error during payment confirmation:', confirmError);
                    // Still show success to the user since payment completed
                    toast.success('Payment successful! Redirecting to your ticket.');
                    setStatus('success');
                }
            } else {
                // Payment verification failed
                setStatus('failed');
                if (response.data.bookingId) {
                    setBookingId(response.data.bookingId);
                } else {
                    // Try to get booking ID from payment data if not in response
                    const paymentData = localStorage.getItem('paymentData');
                    if (paymentData) {
                        try {
                            const parsedData = JSON.parse(paymentData);
                            if (parsedData.bookingId) {
                                setBookingId(parsedData.bookingId);
                            }
                        } catch (error) {
                            console.error('Error parsing payment data:', error);
                        }
                    }
                }
                releaseReservation();
                toast.error(response.data.message || 'Payment verification failed.');
            }
        } catch (error) {
            console.error('Payment verification error:', error);
            setStatus('failed');
            // Try to get booking ID from error response if available
            if (error.response && error.response.data && error.response.data.bookingId) {
                setBookingId(error.response.data.bookingId);
            } else {
                // Try to get booking ID from payment data if not in error response
                const paymentData = localStorage.getItem('paymentData');
                if (paymentData) {
                    try {
                        const parsedData = JSON.parse(paymentData);
                        if (parsedData.bookingId) {
                            setBookingId(parsedData.bookingId);
                        }
                    } catch (error) {
                        console.error('Error parsing payment data:', error);
                    }
                }
            }
            releaseReservation();
            toast.error('Failed to verify payment. Please contact support.');
        } finally {
            setLoading(false);
        }
    };

    // Add a helper function for the fallback logic (extract the existing code into a function)
    const fallbackGetBookingId = async (purchase_order_id) => {
        // First try from URL query parameters
        const searchParams = new URLSearchParams(location.search);
        const urlPurchaseOrderId = searchParams.get('purchase_order_id');

        // Then try from payment data in localStorage
        const paymentData = localStorage.getItem('paymentData');
        let paymentDataBookingId = '';

        if (paymentData) {
            try {
                const parsedData = JSON.parse(paymentData);
                if (parsedData.bookingId) {
                    paymentDataBookingId = parsedData.bookingId;
                    console.log('Found booking ID from paymentData:', paymentDataBookingId);
                }
            } catch (error) {
                console.error('Error parsing payment data:', error);
            }
        }

        // Try to fetch the proper bookingId format from the ticket collection
        try {
            // First check if we have a ticketId in localStorage
            const ticketId = localStorage.getItem('ticketId');
            if (ticketId) {
                const ticketResponse = await axios.get(`${backendUrl}/api/payment/ticket/${ticketId}`);
                if (ticketResponse.data.success && ticketResponse.data.ticket && ticketResponse.data.ticket.bookingId) {
                    setBookingId(ticketResponse.data.ticket.bookingId);
                    console.log('Set booking ID from ticket:', ticketResponse.data.ticket.bookingId);
                    return;
                }
            }

            // If that fails, try to find ticket using the purchase_order_id
            const orderIdToUse = purchase_order_id || urlPurchaseOrderId;
            if (orderIdToUse) {
                const ticketByOrderResponse = await axios.get(`${backendUrl}/api/payment/ticket-by-order/${orderIdToUse}`);
                if (ticketByOrderResponse.data.success && ticketByOrderResponse.data.ticket && ticketByOrderResponse.data.ticket.bookingId) {
                    setBookingId(ticketByOrderResponse.data.ticket.bookingId);
                    console.log('Set booking ID from ticket by order:', ticketByOrderResponse.data.ticket.bookingId);
                    return;
                }
            }

            // If we couldn't get from the backend, use the values we have
            if (paymentDataBookingId && paymentDataBookingId.startsWith('BK-')) {
                setBookingId(paymentDataBookingId);
            } else if (orderIdToUse) {
                setBookingId(orderIdToUse);
            }
        } catch (error) {
            console.error('Error fetching ticket information:', error);
            // Fallback to existing values if fetch fails
            if (paymentDataBookingId && paymentDataBookingId.startsWith('BK-')) {
                setBookingId(paymentDataBookingId);
            } else if (purchase_order_id) {
                setBookingId(purchase_order_id);
            }
        }
    };

    return (
        <div className='w-full space-y-12 pb-16'>
            {/* Top Layout */}
            <TopLayout
                bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
                title={"Payment Verification"}
            />

            <RootLayout className="space-y-6 md:space-y-8 w-full pb-8 md:pb-16 min-h-[50vh] flex items-center justify-center">
                <div className="w-full max-w-md mx-4 p-5 md:p-8 bg-white rounded-xl md:rounded-2xl shadow-md text-center space-y-4 md:space-y-6">
                    {loading ? (
                        <>
                            <LoadingSpinner size="large" />
                            <h2 className="text-lg md:text-xl font-semibold text-neutral-700">Verifying Payment</h2>
                            <p className="text-sm md:text-base text-neutral-500">Please wait while we verify your payment...</p>
                        </>
                    ) : status === 'success' ? (
                        <>
                            <div className="text-green-500 text-5xl md:text-6xl">
                                <i className="fas fa-check-circle"></i>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-green-600">Payment Successful!</h2>
                            <p className="text-base md:text-lg text-neutral-600">
                                Your ticket has been booked successfully.
                            </p>
                            <p className="text-sm md:text-base text-neutral-500">Ticket ID: {ticketId}</p>
                            <p className="text-sm md:text-base text-neutral-500">You will be redirected to your ticket shortly...</p>
                        </>
                    ) : status === 'failed' ? (
                        <>
                            <div className="text-red-500 text-5xl md:text-6xl">
                                <i className="fas fa-times-circle"></i>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold text-red-600">Payment Failed</h2>
                            <p className="text-base md:text-lg text-neutral-600">
                                {location.search.includes('status=User+canceled') ?
                                    'You canceled the payment process.' :
                                    'Your payment could not be processed.'}
                            </p>
                            {bookingId && (
                                <div className="mt-2 p-2 md:p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm md:text-base text-neutral-700">Reference ID: <span className="font-semibold">{bookingId}</span></p>
                                    <p className="text-xs text-neutral-500 mt-1">Please use this ID when contacting support</p>
                                </div>
                            )}
                            <div className="mt-2 p-3 md:p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm md:text-base text-neutral-700">
                                    {location.search.includes('status=User+canceled') ?
                                        'If you would like to try again, you will need to start a new booking as your reservation has expired.' :
                                        'Your reservation has expired. Please make a new booking to try again.'}
                                </p>
                                <p className="mt-2 text-sm md:text-base text-blue-600 font-medium">
                                    <i className="fas fa-phone-alt mr-2"></i> +977 9800000000
                                </p>
                                <p className="text-sm md:text-base text-blue-600 font-medium">
                                    <i className="fas fa-envelope mr-2"></i> support@ticket master.com
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-2">
                                <button
                                    onClick={() => navigate('/bus-tickets')}
                                    className="w-full h-10 md:h-12 text-sm md:text-base bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Book New Ticket
                                </button>
                            </div>
                        </>
                    ) : null}
                </div>
            </RootLayout>
        </div>
    );
};

export default PaymentCallback; 