import React, { useState, useEffect } from 'react';
import { FaChair } from 'react-icons/fa';
import { GiSteeringWheel } from 'react-icons/gi';
import { toast } from 'react-toastify';

/**
 * SeatSelector - User-facing component to select seats for booking
 * Displays the exact layout configured by the operator
 */
const SeatSelector = ({ seatLayout, selectedSeats = [], onSeatSelect, bookedSeats = [] }) => {
  const [localSelectedSeats, setLocalSelectedSeats] = useState(selectedSeats);

  useEffect(() => {
    setLocalSelectedSeats(selectedSeats);
  }, [selectedSeats]);

  if (!seatLayout || !seatLayout.seats || seatLayout.seats.length === 0) {
    return (
      <div className="bg-white border-2 border-gray-300 rounded-xl p-8 text-center">
        <p className="text-gray-500">No seat layout available for this bus.</p>
      </div>
    );
  }

  const { rows, cols, seats } = seatLayout;

  const getSeatAtPosition = (row, col) => {
    return seats.find((s) => s.row === row && s.col === col);
  };

  const isSeatBooked = (seatId) => {
    return bookedSeats.includes(seatId);
  };

  const isSeatSelected = (seatId) => {
    return localSelectedSeats.includes(seatId);
  };

  const handleSeatClick = (seat) => {
    // Check if seat is available
    if (seat.status === 'damaged') {
      toast.warning('This seat is not available');
      return;
    }

    // Check if seat is already booked
    if (isSeatBooked(seat.seatId)) {
      toast.warning('This seat is already booked');
      return;
    }

    // Toggle selection
    let newSelection;
    if (isSeatSelected(seat.seatId)) {
      newSelection = localSelectedSeats.filter(id => id !== seat.seatId);
      toast.info(`Seat ${seat.label} deselected`);
    } else {
      newSelection = [...localSelectedSeats, seat.seatId];
      toast.success(`Seat ${seat.label} selected`);
    }

    setLocalSelectedSeats(newSelection);
    if (onSeatSelect) {
      onSeatSelect(newSelection);
    }
  };

  const getSeatStatus = (seat) => {
    if (seat.status === 'damaged') return 'damaged';
    if (isSeatBooked(seat.seatId)) return 'booked';
    if (isSeatSelected(seat.seatId)) return 'selected';
    return 'available';
  };

  const getSeatClassName = (status) => {
    switch (status) {
      case 'booked':
        return 'border-red-500 bg-red-500 text-white cursor-not-allowed';
      case 'selected':
        return 'border-orange-500 bg-orange-500 text-white cursor-pointer hover:bg-orange-600';
      case 'damaged':
        return 'border-orange-400 bg-white text-orange-600 cursor-not-allowed opacity-50';
      case 'available':
      default:
        return 'border-gray-400 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 hover:border-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-medium">Click on the available seats to reserve them.</p>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border-2 border-gray-400 bg-white flex items-center justify-center">
              <FaChair className="text-gray-600 text-xs" />
            </div>
            <span className="text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border-2 border-red-500 bg-red-500 flex items-center justify-center">
              <FaChair className="text-white text-xs" />
            </div>
            <span className="text-gray-700">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border-2 border-orange-500 bg-orange-500 flex items-center justify-center">
              <FaChair className="text-white text-xs" />
            </div>
            <span className="text-gray-700">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded border-2 border-orange-400 bg-white flex items-center justify-center">
              <FaChair className="text-orange-600 text-xs" />
            </div>
            <span className="text-gray-700">Damaged/Not Available</span>
          </div>
        </div>
      </div>

      {/* Bus Layout */}
      <div className="bg-white border-2 border-gray-300 rounded-xl p-6 overflow-x-auto">
        <div className="inline-flex flex-col gap-4 min-w-max">
          {/* Top section: Driver at front right */}
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <p className="text-xs font-semibold text-gray-600 mb-2">Front of Bus</p>
            </div>
            {/* Driver position - front right */}
            <div className="flex flex-col justify-center items-center px-6 py-3 bg-gray-100 rounded-lg border-2 border-gray-300">
              <GiSteeringWheel className="text-3xl text-red-600 mb-1" />
              <span className="text-xs font-semibold text-gray-600">Driver</span>
            </div>
          </div>

          {/* Horizontal divider */}
          <div className="h-px bg-gray-300 w-full"></div>

          {/* Seat grid */}
          <div className="flex flex-col gap-2">
            {[...Array(rows)].map((_, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-2">
                {[...Array(cols)].map((_, colIndex) => {
                  const seat = getSeatAtPosition(rowIndex, colIndex);

                  if (!seat) {
                    // Empty space
                    return <div key={`empty-${rowIndex}-${colIndex}`} className="w-12 h-12" />;
                  }

                  const status = getSeatStatus(seat);
                  const isClickable = status === 'available' || status === 'selected';

                  return (
                    <button
                      key={seat.seatId}
                      type="button"
                      onClick={() => isClickable && handleSeatClick(seat)}
                      disabled={!isClickable}
                      className={`
                        w-12 h-12 rounded border-2 flex flex-col items-center justify-center
                        text-xs font-bold transition-all duration-150
                        ${isClickable ? 'hover:scale-105' : ''}
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400
                        ${getSeatClassName(status)}
                      `}
                      title={`${seat.label} - ${status.charAt(0).toUpperCase() + status.slice(1)}`}
                    >
                      <FaChair className={`text-xs mb-0.5 ${
                        status === 'booked' || status === 'selected' ? 'text-white' : 
                        status === 'damaged' ? 'text-orange-600' : 'text-gray-600'
                      }`} />
                      <span>{seat.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Back of bus indicator */}
          <div className="text-center">
            <p className="text-xs text-gray-500">Back of Bus</p>
          </div>
        </div>
      </div>

      {/* Selected Seats Summary */}
      {localSelectedSeats.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-800 mb-2">Selected Seats</h3>
          <div className="flex flex-wrap gap-2">
            {localSelectedSeats.map(seatId => {
              const seat = seats.find(s => s.seatId === seatId);
              return seat ? (
                <span
                  key={seatId}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                >
                  {seat.label}
                </span>
              ) : null;
            })}
          </div>
          <p className="text-sm text-green-700 mt-2">
            Total: {localSelectedSeats.length} seat{localSelectedSeats.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default SeatSelector;
