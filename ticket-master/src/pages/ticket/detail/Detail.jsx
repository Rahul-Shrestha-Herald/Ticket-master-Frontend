import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import TopLayout from '../../../layout/toppage/TopLayout';
import RootLayout from '../../../layout/RootLayout';
import BusSeat from './seat/busseat/BusSeat';
import ToggleBtn from '../../../components/togglebtn/ToggleBtn';
import Amenities from './seat/amenities/Amenities';
import ReservationPolicy from './reservationpolicy/ReservationPolicy';
import BusImage from './busimage/BusImage';
import { UserAppContext } from '../../../context/UserAppContext';
import { toast } from 'react-toastify';

const Detail = () => {
  const { backendUrl } = useContext(UserAppContext);
  const { busId } = useParams();
  const location = useLocation();
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get date from query params or use today's date
  const searchParams = new URLSearchParams(location.search);
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchBusDetails = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/bus/${busId}`);
        setBusDetails(response.data);
      } catch (error) {
        toast.error('Error fetching bus details');
      } finally {
        setLoading(false);
      }
    };

    if (busId) {
      fetchBusDetails();
    }
  }, [busId, backendUrl]);

  return (
    <div className="w-full space-y-8 md:space-y-12 pb-8 md:pb-16">
      <TopLayout
        bgImg={"https://ts1.mm.bing.net/th?id=OIP.gNpTYgggmsWFW_ITmPOinwHaDf&pid=15.1"}
        title={"Bus Details"}
      />

      <RootLayout className="space-y-8 md:space-y-12 w-full pb-8 md:pb-16 px-4 md:px-0">
        <div className="w-full space-y-8">
          <BusSeat busId={busId} date={date} />
        </div>

        <div className="w-full flex flex-col items-center justify-center gap-6 md:gap-8 text-center">
          {loading ? (
            <p>Loading bus details...</p>
          ) : busDetails ? (
            <>
              <div className="w-full p-3 md:p-4 border rounded-lg bg-neutral-50 shadow-sm">
                <h2 className="text-xl md:text-2xl font-semibold text-neutral-700 mb-3 md:mb-4 text-left">Bus Information</h2>
                <div className="space-y-2 md:space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-dashed border-neutral-200 pb-2 md:pb-3">
                    <h3 className="text-base md:text-lg text-neutral-500 font-medium">Bus Name: {busDetails.busName}</h3>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-base md:text-lg text-neutral-500 font-medium">Bus Number: {busDetails.busNumber}</h3>
                  </div>
                </div>
              </div>

              <div className="w-full p-3 md:p-4 border rounded-lg bg-neutral-50 shadow-sm">
                <h2 className="text-xl md:text-2xl font-semibold text-neutral-700 mb-3 md:mb-4 text-left">Bus Description</h2>
                {busDetails.busDescription ? (
                  <p className="text-sm md:text-base text-neutral-500 font-normal text-justify">
                    {busDetails.busDescription}
                  </p>
                ) : (
                  <p>No bus description available.</p>
                )}
              </div>

              <div className="w-full flex items-center justify-center gap-4 md:gap-6 flex-col">
                <ToggleBtn
                  buttonText={"See Bus Details"}
                  buttonTextHidden={"Hide Bus Details"}
                >
                  <div className="w-full space-y-6 md:space-y-10">
                    <div className="w-full grid grid-cols-1 md:grid-cols-7 gap-6 md:gap-20">
                      <Amenities amenities={busDetails.amenities} />
                      <ReservationPolicy policies={busDetails.reservationPolicies} />
                    </div>
                    <BusImage images={busDetails.images} />
                  </div>
                </ToggleBtn>
              </div>
            </>
          ) : (
            <p>No bus details available</p>
          )}
        </div>
      </RootLayout>
    </div>
  );
};

export default Detail;