import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoTimeOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import axios from 'axios';

const ReservationTimer = ({ reservationId, expirationTime, backendUrl }) => {
    const [timeLeft, setTimeLeft] = useState(600); // Default 10 minutes in seconds
    const [timer, setTimer] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Calculate initial time left if expirationTime is provided
        if (expirationTime) {
            const expiry = new Date(expirationTime);
            const now = new Date();
            const initialTimeLeft = Math.max(0, Math.floor((expiry - now) / 1000));
            setTimeLeft(initialTimeLeft);
        }

        // Set up the timer
        const timerId = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    // Time's up, clear the interval and redirect
                    clearInterval(timerId);
                    handleExpiration();
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        setTimer(timerId);

        // Cleanup on unmount
        return () => {
            if (timerId) clearInterval(timerId);
        };
    }, [expirationTime]);

    // Check reservation status when the component mounts
    useEffect(() => {
        const checkReservation = async () => {
            try {
                if (reservationId) {
                    const response = await axios.get(`${backendUrl}/api/bus/reservation/${reservationId}`);
                    if (response.data.success) {
                        const remainingTime = response.data.data.timeRemaining;
                        setTimeLeft(remainingTime);
                    } else {
                        // Reservation expired or doesn't exist
                        handleExpiration();
                    }
                }
            } catch (error) {
                // Handle error - reservation likely expired
                handleExpiration();
            }
        };

        checkReservation();
    }, [reservationId, backendUrl]);

    const handleExpiration = async () => {
        toast.error("Your seat reservation has expired. You'll be redirected to ticket booking page.");

        // Try to release seats on the server
        try {
            if (reservationId) {
                await axios.delete(`${backendUrl}/api/bus/reservation/${reservationId}`);
            }
        } catch (error) {
        }

        // Redirect after a small delay to allow toast to be seen
        setTimeout(() => {
            navigate('/bus-tickets');
        }, 3000);
    };

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Determine color class based on time left
    const getColorClass = () => {
        if (timeLeft < 60) return 'text-red-600'; // Less than 1 minute
        if (timeLeft < 180) return 'text-yellow-600'; // Less than 3 minutes
        return 'text-green-600';
    };

    return (
        <div className="bg-neutral-100 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center">
                <IoTimeOutline className="text-xl mr-2" />
                <div>
                    <p className="text-sm text-neutral-600">Reservation expires in:</p>
                </div>
            </div>
            <div className={`font-medium text-lg ${getColorClass()}`}>
                {formatTime(timeLeft)}
            </div>
        </div>
    );
};

export default ReservationTimer; 