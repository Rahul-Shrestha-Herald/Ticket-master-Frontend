import React, { createContext, useState, useEffect, useContext } from 'react'
import PassengerData from './passengerdata/PassengerData'
import TopLayout from '../../../../layout/toppage/TopLayout'
import RootLayout from '../../../../layout/RootLayout'
import BookingStatus from './bookingstatus/BookingStatus'
import { useLocation, useNavigate } from 'react-router-dom'
import ReservationTimer from '../../../../components/modals/ReservationTimer'
import { UserAppContext } from '../../../../context/UserAppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

// Create a context for sharing checkout data
export const CheckoutContext = createContext()

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { backendUrl } = useContext(UserAppContext);
  const [checkoutData, setCheckoutData] = useState({
    pickupPointId: '',
    dropPointId: '',
    passengerName: '',
    passengerEmail: '',
    passengerPhone: '',
    alternatePhone: ''
  });

  // Extract booking data from state passed from Detail component
  const bookingData = location.state || {};

  // Set pickup and drop point IDs directly from the booking data
  useEffect(() => {
    if (bookingData.pickupPointId && bookingData.dropPointId) {
      setCheckoutData(prev => ({
        ...prev,
        pickupPointId: bookingData.pickupPointId,
        dropPointId: bookingData.dropPointId
      }));
    }
  }, [bookingData]);

  // Log received data for debugging
  useEffect(() => {
    if (!bookingData.busId || !bookingData.selectedSeats) {
      toast.error("No booking information available. Please select seats first.");
      navigate('/bus-tickets');
    }

    // Verify reservation when component mounts
    const verifyReservation = async () => {
      try {
        if (bookingData.reservation && bookingData.reservation.id) {
          const response = await axios.get(`${backendUrl}/api/bus/reservation/${bookingData.reservation.id}`);
          if (!response.data.success) {
            toast.error("Your seat reservation has expired. You'll be redirected to select seats again.");
            setTimeout(() => navigate('/bus-tickets'), 2000);
          }
        } else {
          // No reservation data found
          toast.error("No seat reservation found. You'll be redirected to select seats.");
          setTimeout(() => navigate('/bus-tickets'), 2000);
        }
      } catch (error) {
        toast.error("Your seat reservation has expired. You'll be redirected to select seats again.");
        setTimeout(() => navigate('/bus-tickets'), 2000);
      }
    };

    if (bookingData.busId && bookingData.selectedSeats) {
      verifyReservation();
    }
  }, [location.state, bookingData, navigate, backendUrl]);

  // Function to update checkout data
  const updateCheckoutData = (newData) => {
    setCheckoutData(prev => ({ ...prev, ...newData }));
  };

  // Context value to be shared with child components
  const contextValue = {
    bookingData,
    checkoutData,
    updateCheckoutData
  };

  return (
    <CheckoutContext.Provider value={contextValue}>
      <div className='w-full space-y-12 pb-16'>
        {/* Top Layout */}
        <TopLayout
          bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
          title={"Checkout"}
        />

        <RootLayout className="space-y-12 w-full pb-16">
          {!bookingData || !bookingData.busId ? (
            <div className="w-full text-center py-10">
              <h2 className="text-xl text-neutral-700 font-medium">
                No booking information available. Please select seats first.
              </h2>
            </div>
          ) : (
            <>
              {/* Reservation Timer */}
              {bookingData.reservation && (
                <>
                  {/* Mobile Reservation Timer with Box */}
                  <div className="block md:hidden w-full sticky top-0 z-10 bg-white py-2 shadow-sm left-0 right-0">
                    <div className="w-full max-w-full px-4">
                      <ReservationTimer
                        reservationId={bookingData.reservation.id}
                        expirationTime={bookingData.reservation.expirationTime}
                        backendUrl={backendUrl}
                      />
                    </div>
                  </div>

                  {/* Desktop Reservation Timer (No Box) */}
                  <div className="hidden md:block w-full max-w-3xl mx-auto">
                    <ReservationTimer
                      reservationId={bookingData.reservation.id}
                      expirationTime={bookingData.reservation.expirationTime}
                      backendUrl={backendUrl}
                    />
                  </div>
                </>
              )}
              <div className="w-full grid grid-cols-1 md:grid-cols-7 items-start gap-6 md:gap-10 lg:gap-20 xl:gap-44 relative">
                {/* Passenger Detail */}
                <PassengerData />

                {/* Ticket Report Status */}
                <BookingStatus />
              </div>
            </>
          )}
        </RootLayout>
      </div>
    </CheckoutContext.Provider>
  )
}

export default Checkout
