import React from 'react';
import { IoWarningOutline } from 'react-icons/io5';

const ReservationWarningModal = ({ isOpen, onClose, onConfirm, selectedSeats }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 animate-fadeIn">
                <div className="flex items-center mb-4 text-yellow-500">
                    <IoWarningOutline className="text-2xl mr-2" />
                    <h3 className="text-lg font-medium">Seat Reservation</h3>
                </div>

                <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                        The selected seats {selectedSeats && `(${selectedSeats.join(', ')})`} will be reserved for 10 minutes. Do you want to continue?
                    </p>
                    <p className="text-sm text-gray-500">
                        You must complete your purchase within this time, or the seats will be released for others.
                    </p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReservationWarningModal; 