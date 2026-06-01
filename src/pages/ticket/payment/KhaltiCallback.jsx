/**
 * Khalti Payment Callback Handler
 * Handles the redirect from Khalti after payment
 */

import React, { useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { UserAppContext } from '../../../context/UserAppContext';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import { IoCheckmarkCircle, IoCloseCircle, IoTimeOutline } from 'react-icons/io5';

const KhaltiCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { backendUrl } = useContext(UserAppContext);
    
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('processing');
    const [ticketId, setTicketId] = useState(null);
    const [bookingId, setBookingId] = useState('');
    const [transactionId, setTransactionId] = useState('');
    const [verificationAttempted, setVerificationAttempted] = useState(false);

    useEffect(() => {
        // Parse URL parameters
        const searchParams = new URLSearchParams(location.search);
        const pidx = searchParams.get('pidx');
        const paymentStatus = searchParams.get('status');
        const purchaseOrderId = searchParams.get('purchase_order_id');

        console.log('→ Payment callback received');
        console.log(`  PIDX: ${pidx}`);
        console.log(`  Status: ${paymentStatus}`);

        if (!pidx) {
            toast.error('Invalid payment response');
            setStatus('failed');
            setLoading(false);
            return;
        }

        if (!verificationAttempted) {
            verifyPayment(pidx, paymentStatus, purchaseOrderId);
        }
    }, [location, verificationAttempted]);

    const verifyPayment = async (pidx, paymentStatus, purchaseOrderId) => {
        try {
            setLoading(true);
            setVerificationAttempted(true);

            axios.defaults.withCredentials = true;

            console.log('→ Verifying payment with backend...');

            const reservationId = localStorage.getItem('khalti_reservation_id');

            const response = await axios.post(
                `${backendUrl}/api/khalti/verify`,
                {
                    pidx,
                    status: paymentStatus,
                    purchase_order_id: purchaseOrderId,
                    reservationId
                },
                { timeout: 15000 }
            );

            console.log('✓ Verification response received');

            if (response.data.success) {
                // Payment successful
                setStatus('success');
                setTicketId(response.data.ticketId);
                setBookingId(response.data.bookingId);
                setTransactionId(response.data.transactionId);

                // Store for reference
                localStorage.setItem('khalti_ticket_id', response.data.ticketId);
                localStorage.setItem('khalti_booking_id', response.data.bookingId);

                // Clean up
                localStorage.removeItem('khalti_payment_url');
                localStorage.removeItem('khalti_pidx');
                localStorage.removeItem('khalti_reservation_id');

                toast.success('Payment successful!');

                // Redirect to invoice after 2 seconds
                setTimeout(() => {
                    navigate('/bus-tickets/invoice', {
                        state: {
                            ticketId: response.data.ticketId,
                            bookingId: response.data.bookingId
                        }
                    });
                }, 2000);

            } else {
                // Payment failed
                setStatus('failed');
                setBookingId(response.data.bookingId || '');
                
                toast.error(response.data.message || 'Payment verification failed');
            }

        } catch (error) {
            console.error('✗ Payment verification failed:', error);
            
            setStatus('failed');
            
            if (error.response?.data) {
                toast.error(error.response.data.message || 'Verification failed');
                setBookingId(error.response.data.bookingId || '');
            } else {
                toast.error('Unable to verify payment. Please contact support.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='w-full space-y-12 pb-16'>
            <TopLayout
                bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
                title={"Payment Verification"}
            />

            <RootLayout className="space-y-8 w-full pb-16 min-h-[50vh] flex items-center justify-center">
                <div className="w-full max-w-md mx-4 p-8 bg-white rounded-2xl shadow-lg text-center space-y-6">
                    
                    {loading ? (
                        <>
                            <LoadingSpinner size="large" />
                            <h2 className="text-xl font-semibold text-neutral-700">
                                Verifying Payment
                            </h2>
                            <p className="text-neutral-500">
                                Please wait while we confirm your payment...
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-amber-600">
                                <IoTimeOutline className="text-lg" />
                                <span>This may take a few seconds</span>
                            </div>
                        </>
                    ) : status === 'success' ? (
                        <>
                            <div className="text-green-500 text-6xl animate-bounce">
                                <IoCheckmarkCircle />
                            </div>
                            <h2 className="text-2xl font-bold text-green-600">
                                Payment Successful!
                            </h2>
                            <p className="text-lg text-neutral-600">
                                Your ticket has been booked successfully
                            </p>
                            
                            {bookingId && (
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <p className="text-sm text-gray-600">Booking ID</p>
                                    <p className="text-lg font-bold text-green-700">{bookingId}</p>
                                </div>
                            )}

                            {transactionId && (
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">Transaction ID</p>
                                    <p className="text-sm font-mono text-gray-700">{transactionId}</p>
                                </div>
                            )}

                            <p className="text-sm text-neutral-500">
                                Redirecting to your ticket...
                            </p>

                            <div className="flex gap-2">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse delay-75"></div>
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse delay-150"></div>
                            </div>
                        </>
                    ) : status === 'failed' ? (
                        <>
                            <div className="text-red-500 text-6xl">
                                <IoCloseCircle />
                            </div>
                            <h2 className="text-2xl font-bold text-red-600">
                                Payment Failed
                            </h2>
                            <p className="text-lg text-neutral-600">
                                {location.search.includes('User+canceled') 
                                    ? 'You canceled the payment'
                                    : 'Your payment could not be processed'}
                            </p>

                            {bookingId && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Reference ID</p>
                                    <p className="text-lg font-semibold text-gray-800">{bookingId}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Use this ID when contacting support
                                    </p>
                                </div>
                            )}

                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-left">
                                <p className="text-sm text-gray-700 mb-2">
                                    Your reservation has expired. Please make a new booking to try again.
                                </p>
                                <div className="space-y-1 text-sm">
                                    <p className="text-blue-600 font-medium">
                                        <i className="fas fa-phone-alt mr-2"></i>
                                        +977 9800000000
                                    </p>
                                    <p className="text-blue-600 font-medium">
                                        <i className="fas fa-envelope mr-2"></i>
                                        support@ticketmaster.com
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/bus-tickets')}
                                className="w-full h-12 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Book New Ticket
                            </button>
                        </>
                    ) : null}
                </div>
            </RootLayout>
        </div>
    );
};

export default KhaltiCallback;
