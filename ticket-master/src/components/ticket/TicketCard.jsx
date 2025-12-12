import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBus, FaCalendar, FaClock, FaMoneyBillWave, FaUser } from 'react-icons/fa';
import { MdOutlineChair } from 'react-icons/md';
import { UserAppContext } from '../../context/UserAppContext';
import { toast } from 'react-toastify';

const TicketCard = ({
  busId,
  icon: Icon,
  busName,
  routeFrom,
  routeTo,
  arrivalTime,
  departureTime,
  price,
  availableSeats,
  amenities = [],
  date
}) => {
  const navigate = useNavigate();
  const { isLoggedin } = useContext(UserAppContext);

  const handleReserveClick = (e) => {
    e.preventDefault();

    if (!isLoggedin) {
      toast.error("Please login to reserve seats");
      navigate('/login');
      return;
    }

    // If user is logged in, proceed to details page
    navigate(`/bus-tickets/detail/${busId}?date=${date}`);
  };

  return (
    <div className="w-full rounded-xl p-3 sm:p-5 border-2 border-neutral-300 space-y-3 sm:space-y-5">
      {/* Bus info & Route Details */}
      <div className="space-y-3 sm:space-y-5 w-full border-b border-neutral-300/60 pb-3 sm:pb-4">
        {/* Bus Info */}
        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
          <div className="flex items-center gap-x-2">
            <FaBus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <p className="text-base sm:text-lg text-neutral-700 font-semibold truncate">{busName}</p>
          </div>
          <div className="flex items-center gap-x-2 sm:gap-x-4">
            {/* Date Badge */}
            <div className="flex items-center gap-x-1 bg-neutral-200/65 w-fit rounded-full px-1.5 py-0.5">
              <FaCalendar className="w-3 h-3 text-primary" />
              <p className="text-xs text-neutral-600 font-normal">{date}</p>
            </div>
            <div className="flex items-center gap-x-1 bg-neutral-200/65 w-fit rounded-full px-1.5 py-0.5">
              <MdOutlineChair className="w-4 h-4 text-primary -rotate-90" />
              <p className="text-xs text-neutral-600 font-normal">37 Seats</p>
            </div>
          </div>
        </div>

        {/* Route Section */}
        <div className="space-y-3 sm:space-y-5">
          <div className="w-full flex items-center justify-between gap-x-2.5">
            <h1 className="text-lg sm:text-2xl text-neutral-600 font-semibold">{arrivalTime}</h1>
            <div className="flex-1 border-dashed border border-neutral-300 relative min-w-[40px]">
              <p className="absolute w-10 h-10 sm:w-14 sm:h-14 p-0.5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-50 border-dashed border border-neutral-400 rounded-full flex items-center justify-center">
                <Icon className="w-5 h-5 sm:w-8 sm:h-8 text-primary" />
              </p>
            </div>
            <h1 className="text-lg sm:text-2xl text-neutral-600 font-semibold">{departureTime}</h1>
          </div>
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-x-5">
            <p className="text-sm sm:text-base text-neutral-500 font-normal">
              <span className="text-primary inline sm:hidden">From - </span>
              {routeFrom}
            </p>
            <p className="text-sm sm:text-base text-neutral-500 font-normal">
              <span className="text-primary inline sm:hidden">To - </span>
              {routeTo}
            </p>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="flex items-center gap-x-2 gap-y-1 flex-wrap">
            {amenities.map((amenity, index) => (
              <span key={index} className="bg-primary/10 px-2 py-1 rounded-full text-xs text-neutral-600">
                {amenity}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Price, Seats, and Reserve Button */}
      <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
        <h1 className="text-lg sm:text-xl text-neutral-700 font-semibold">
          Rs. {price} <span className="text-xs sm:text-sm text-neutral-500 font-normal">/ per seat</span>
        </h1>
        <h1 className="text-sm text-neutral-600 font-normal flex items-center justify-start sm:justify-center gap-x-1.5">
          <span className="text-base sm:text-lg text-green-700 font-bold pt-0.5">
            {availableSeats} Seats Available
          </span>
        </h1>
        <Link
          onClick={handleReserveClick}
          className="w-full sm:w-fit px-5 py-1.5 bg-primary hover:bg-transparent border-2 border-primary hover:border-primary rounded-xl text-sm font-normal text-neutral-50 flex items-center justify-center gap-x-2 hover:text-primary ease-in-out duration-300"
        >
          Reserve Seat
        </Link>
      </div>
    </div>
  );
};

export default TicketCard;

