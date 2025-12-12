import React, { useContext, useEffect, useState } from 'react'
import { FaArrowRightLong } from 'react-icons/fa6'
import { Link, useNavigate } from 'react-router-dom'
import { UserAppContext } from '../../../../../context/UserAppContext'
import { CheckoutContext } from '../Checkout'
import axios from 'axios'
import { toast } from 'react-toastify'

const BookingStatus = () => {
    const { backendUrl } = useContext(UserAppContext);
    const { bookingData, checkoutData } = useContext(CheckoutContext);
    const [ticketDetails, setTicketDetails] = useState({
        fromLocation: '',
        toLocation: '',
        departureTime: '',
        arrivalTime: '',
        busNumber: '',
        busName: '',
        selectedSeats: [],
        totalPrice: 0,
        pickupPoint: '',
        dropPoint: '',
        pickupTime: '',
        dropTime: ''
    });
    const [seatDisplayData, setSeatDisplayData] = useState([]);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { busId, selectedSeats, date, totalPrice, route, reservation } = bookingData || {};

    useEffect(() => {
        // Set initial values from bookingData if available
        if (route) {
            setTicketDetails(prev => ({
                ...prev,
                fromLocation: route.from || '',
                toLocation: route.to || '',
                departureTime: route.departureTime || '',
                arrivalTime: route.arrivalTime || '',
                totalPrice: totalPrice || 0,
                selectedSeats: selectedSeats || [],
                busName: route.busName || '',
                busNumber: route.busNumber || ''
            }));
        }
    }, [route, selectedSeats, totalPrice]);

    useEffect(() => {
        // Fetch seat display data based on seat IDs
        const fetchSeatData = async () => {
            if (!busId || !selectedSeats || selectedSeats.length === 0) return;

            try {
                const response = await axios.get(`${backendUrl}/api/bus/seat-display-data`, {
                    params: { busId, seatIds: JSON.stringify(selectedSeats) }
                });

                if (response.data.success) {
                    setSeatDisplayData(response.data.data.seatDisplayData || selectedSeats);
                } else {
                    // If API fails, just use the seat IDs directly for display
                    setSeatDisplayData(selectedSeats);
                }
            } catch (error) {
                // Fallback to using the raw seat IDs
                setSeatDisplayData(selectedSeats);
            }
        };

        fetchSeatData();
    }, [busId, selectedSeats, backendUrl]);

    useEffect(() => {
        const fetchTicketDetails = async () => {
            if (!busId || !selectedSeats || selectedSeats.length === 0) return;

            try {
                const response = await axios.get(`${backendUrl}/api/bus/ticket-details`, {
                    params: { busId, selectedSeats: JSON.stringify(selectedSeats), date }
                });

                if (response.data.success) {
                    const { busNumber } = response.data.data;

                    setTicketDetails(prev => ({
                        ...prev,
                        busNumber: busNumber || route?.busNumber || ''
                    }));
                }
            } catch (error) {
                // Fallback to use the bus number from route if available
                setTicketDetails(prev => ({
                    ...prev,
                    busNumber: route?.busNumber || ''
                }));
            }
        };

        fetchTicketDetails();
    }, [busId, selectedSeats, date, backendUrl, route]);

    // Update pickup and drop points when checkoutData changes
    useEffect(() => {
        const updatePickupDropPoints = async () => {
            if (!checkoutData.pickupPointId && !checkoutData.dropPointId) return;

            try {
                // Get route points data
                const response = await axios.get(`${backendUrl}/api/bus/route-points`, {
                    params: { busId, date }
                });

                if (response.data.success) {
                    const { pickupPoints, dropPoints } = response.data.data;

                    // Update pickup point
                    if (checkoutData.pickupPointId) {
                        const pickupPoint = pickupPoints.find(p => p.id === checkoutData.pickupPointId);
                        if (pickupPoint) {
                            setTicketDetails(prev => ({
                                ...prev,
                                pickupPoint: pickupPoint.name,
                                pickupTime: pickupPoint.time
                            }));
                        }
                    }

                    // Update drop point
                    if (checkoutData.dropPointId) {
                        const dropPoint = dropPoints.find(p => p.id === checkoutData.dropPointId);
                        if (dropPoint) {
                            setTicketDetails(prev => ({
                                ...prev,
                                dropPoint: dropPoint.name,
                                dropTime: dropPoint.time
                            }));
                        }
                    }
                }
            } catch (error) {
            }
        };

        updatePickupDropPoints();
    }, [checkoutData.pickupPointId, checkoutData.dropPointId, busId, date, backendUrl]);

    // Format time to include AM/PM
    const formatTime = (timeString) => {
        if (!timeString) return '';

        const date = new Date(`2000-01-01T${timeString}`);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    // Function to handle proceed to payment
    const handleProceedToPayment = (e) => {
        e.preventDefault();

        // Prevent multiple clicks
        if (isSubmitting) {
            return;
        }

        // Validate required fields
        if (!checkoutData.passengerName || checkoutData.passengerName.trim() === '') {
            toast.error('Please enter your full name');
            return;
        }

        if (!checkoutData.passengerEmail || checkoutData.passengerEmail.trim() === '') {
            toast.error('Please enter your email address');
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(checkoutData.passengerEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (!checkoutData.passengerPhone || checkoutData.passengerPhone.trim() === '') {
            toast.error('Please enter your phone number');
            return;
        }

        // Pickup and drop points are already validated in the detail page
        // and passed through location state, so we don't need to check them here

        if (!selectedPaymentMethod) {
            toast.error('Please select a payment method');
            return;
        }

        // Set submitting state to true to prevent multiple clicks
        setIsSubmitting(true);

        // Clear any existing payment state from localStorage
        localStorage.removeItem('paymentInitiated');
        localStorage.removeItem('paymentVerified');
        localStorage.removeItem('paymentData');
        localStorage.removeItem('reservationId');
        localStorage.removeItem('reservationExpiry');

        // Ensure reservation object has expiresAt property
        const enhancedReservation = {
            ...(reservation || {}),
            id: reservation?.id || null,
            expiresAt: reservation?.expiresAt || new Date(Date.now() + 10 * 60 * 1000).toISOString()
        };

        // All validations passed, navigate to payment confirmation page
        navigate('/bus-tickets/payment-confirmation', {
            state: {
                ticketDetails: {
                    ...ticketDetails,
                    busId,
                    selectedSeats,
                    date
                },
                passengerInfo: {
                    name: checkoutData.passengerName,
                    email: checkoutData.passengerEmail,
                    phone: checkoutData.passengerPhone,
                    alternatePhone: checkoutData.alternatePhone,
                    pickupPointId: checkoutData.pickupPointId,
                    dropPointId: checkoutData.dropPointId,
                    paymentMethod: selectedPaymentMethod
                },
                reservation: enhancedReservation,
                returningFromKhalti: false
            }
        });
    };

    // Subscribe to changes in payment method
    useEffect(() => {
        const handlePaymentMethodChange = (event) => {
            // Make sure to update the state even when the payment method is empty
            if (event.detail && event.detail.hasOwnProperty('paymentMethod')) {
                setSelectedPaymentMethod(event.detail.paymentMethod);
            }
        };

        window.addEventListener('paymentMethodSelected', handlePaymentMethodChange);

        return () => {
            window.removeEventListener('paymentMethodSelected', handlePaymentMethodChange);
        };
    }, []);

    // Reset submission state if component unmounts before navigation completes
    useEffect(() => {
        return () => {
            setIsSubmitting(false);
        };
    }, []);

    return (
        <div className='w-full col-span-1 md:col-span-3 static md:sticky md:top-20 space-y-5 md:space-y-7 mt-4 md:mt-0'>
            <div className="w-full bg-neutral-50 rounded-xl py-3 md:py-4 px-4 md:px-6 border border-neutral-200 shadow-sm space-y-4 md:space-y-5">
                <h1 className="text-base md:text-lg text-neutral-700 font-bold text-center border-b border-neutral-200 pb-3 md:pb-4">
                    Your Ticket Report Status
                </h1>

                <div className="space-y-4 md:space-y-5">
                    <div className="space-y-1.5 md:space-y-2 w-full">
                        <h1 className="text-sm md:text-base text-neutral-700 font-medium">
                            Bus Information
                        </h1>

                        <div className="w-full space-y-1.5 md:space-y-2 border-b border-dashed border-neutral-200 pb-2 md:pb-3">
                            <div className="w-full flex items-center justify-between">
                                <h3 className="text-xs md:text-sm text-neutral-500 font-medium">Bus Name:</h3>
                                <p className="text-xs md:text-sm text-neutral-600 font-semibold">{ticketDetails.busName}</p>
                            </div>
                            <div className="w-full flex items-center justify-between">
                                <h3 className="text-xs md:text-sm text-neutral-500 font-medium">Bus Number:</h3>
                                <p className="text-xs md:text-sm text-neutral-600 font-semibold">{ticketDetails.busNumber}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full space-y-1.5 md:space-y-2 border-b border-dashed border-neutral-200 pb-2 md:pb-3">
                        <div className="space-y-1.5 md:space-y-2 w-full">
                            <h1 className="text-sm md:text-base text-neutral-700 font-medium">
                                Your Destination
                            </h1>

                            <div className="space-y-0.5 w-full">
                                <div className="w-full flex items-center justify-between gap-x-3 md:gap-x-5">
                                    <p className="text-xs md:text-sm text-neutral-400 font-normal">
                                        From
                                    </p>
                                    <p className="text-xs md:text-sm text-neutral-400 font-normal">
                                        To
                                    </p>
                                </div>

                                <div className="w-full flex items-center justify-between gap-x-2 md:gap-x-4">
                                    <h1 className="text-xs md:text-sm text-neutral-600 font-normal">
                                        {ticketDetails.fromLocation} <span className='font-medium'>({formatTime(ticketDetails.departureTime)})</span>
                                    </h1>

                                    <div className="flex-1 border-dashed border border-neutral-300" />

                                    <h1 className="text-xs md:text-sm text-neutral-600 font-normal">
                                        {ticketDetails.toLocation} <span className='font-medium'>({formatTime(ticketDetails.arrivalTime)})</span>
                                    </h1>
                                </div>

                                {/* Pickup and Drop Point Section */}
                                <div className="w-full flex items-center justify-between gap-x-3 md:gap-x-5 mt-2 md:mt-3">
                                    <p className="text-xs md:text-sm text-neutral-400 font-normal">
                                        Pickup Point
                                    </p>
                                    <p className="text-xs md:text-sm text-neutral-400 font-normal">
                                        Drop Point
                                    </p>
                                </div>

                                <div className="w-full flex items-center justify-between gap-x-2 md:gap-x-4">
                                    <h1 className="text-xs md:text-sm text-neutral-600 font-normal">
                                        {ticketDetails.pickupPoint ? (
                                            <>
                                                {ticketDetails.pickupPoint}
                                                {ticketDetails.pickupTime && (
                                                    <span className='font-medium'> ({formatTime(ticketDetails.pickupTime)})</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-neutral-400">Not Selected</span>
                                        )}
                                    </h1>

                                    <div className="flex-1 border-dashed border border-neutral-300" />

                                    <h1 className="text-xs md:text-sm text-neutral-600 font-normal">
                                        {ticketDetails.dropPoint ? (
                                            <>
                                                {ticketDetails.dropPoint}
                                                {ticketDetails.dropTime && (
                                                    <span className='font-medium'> ({formatTime(ticketDetails.dropTime)})</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-neutral-400">Not Selected</span>
                                        )}
                                    </h1>
                                </div>

                                <div className="w-full flex items-center justify-between gap-x-2 md:gap-x-4 !mt-2 md:!mt-3">
                                    <h1 className="text-xs md:text-sm text-neutral-600 font-normal">
                                        Date:
                                    </h1>
                                    <p className="text-xs md:text-sm text-neutral-600 font-medium">
                                        {date ? new Date(date).toLocaleDateString('en-US', {
                                            weekday: 'short',
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : "Not Selected"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full space-y-1.5 md:space-y-2 border-b border-dashed border-neutral-200 pb-2 md:pb-3">
                        <div className="space-y-1.5 md:space-y-2 w-full">
                            <h1 className="text-sm md:text-base text-neutral-700 font-medium">
                                Your Seats
                            </h1>

                            <div className='w-full flex items-center gap-x-2 md:gap-x-3 flex-wrap'>
                                {selectedSeats && selectedSeats.length > 0 ? (
                                    selectedSeats.map((seat, index) => (
                                        <div
                                            key={index}
                                            className='w-7 h-7 md:w-9 md:h-9 bg-neutral-200/80 rounded-lg flex items-center justify-center text-sm md:text-base to-neutral-700 font-semibold'>
                                            {seat}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-xs md:text-sm text-neutral-500">No seats selected</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 md:space-y-2 w-full">
                        <h1 className="text-sm md:text-base text-neutral-700 font-medium">
                            Total Fare Amount
                        </h1>

                        <div className="flex items-center justify-between gap-x-2 md:gap-x-4">
                            <div className="flex gap-y-0.5 flex-col">
                                <h3 className="text-sm md:text-base text-neutral-500 font-medium">Total Price :</h3>
                                <span className='text-xs to-neutral-500 font-normal'>
                                    (Including all taxes)
                                </span>
                            </div>

                            {/* Calculate the total price  */}
                            <p className="text-sm md:text-base text-neutral-600 font-semibold">
                                NPR {ticketDetails.totalPrice || 0}
                            </p>

                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full px-1.5">
                <button
                    onClick={handleProceedToPayment}
                    disabled={isSubmitting}
                    className='w-full bg-primary hover:bg-primary/90 text-xs md:text-sm text-neutral-50 font-normal py-2 md:py-2.5 flex items-center justify-center uppercase rounded-lg transition disabled:bg-primary/60 disabled:cursor-not-allowed'>
                    {isSubmitting ? 'Processing...' : 'Proceed to Pay'}
                    {!isSubmitting && <FaArrowRightLong className="ml-2" />}
                </button>
            </div>
        </div>
    )
}

export default BookingStatus
