import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { UserAppContext } from './UserAppContext';

export const TrackingContext = createContext();

export const TrackingProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeTracking, setActiveTracking] = useState(null);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [trackingError, setTrackingError] = useState(null);
    const { backendUrl } = useContext(UserAppContext);

    // Connect to socket server
    useEffect(() => {
        // Use port 8000 for tracking server - ensure this matches the server
        const trackingServerUrl = 'http://localhost:8000';
        console.log('Connecting to tracking server at:', trackingServerUrl);

        const newSocket = io(trackingServerUrl, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);

        // Socket event listeners
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsConnected(true);
            setTrackingError(null);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
            setTrackingError(`Connection error: ${error.message}`);
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
            setTrackingError(error.message || 'An error occurred with the tracking server');
        });

        // Add listeners for tracking status
        newSocket.on('tracking:started', (data) => {
            console.log('Tracking started event received:', data);
            if (data.busId) {
                setActiveTracking({ busId: data.busId });
            }
        });

        newSocket.on('tracking:stopped', (data) => {
            console.log('Tracking stopped event received:', data);
            // Automatically clear tracking state when server confirms it's stopped
            if (activeTracking && activeTracking.busId === data.busId) {
                setActiveTracking(null);
            }
        });

        // Listen for server restart requests
        newSocket.on('tracking:request-restart', () => {
            console.log('Server requested tracking restart');
            if (activeTracking) {
                console.log('Restarting tracking for bus:', activeTracking.busId);
                newSocket.emit('operator:start-tracking', activeTracking);
            }
        });

        // Cleanup on unmount
        return () => {
            if (newSocket) {
                console.log('Cleaning up socket connection');
                newSocket.disconnect();
            }
        };
    }, [backendUrl]);

    // Operator functions
    const startTracking = (busData) => {
        if (!socket) {
            console.error('Socket not initialized');
            setTrackingError('Socket connection not established');
            return false;
        }

        if (!isConnected) {
            console.error('Socket not connected');
            setTrackingError('Socket connection not established');
            return false;
        }

        try {
            console.log('Starting tracking for bus:', busData);
            socket.emit('operator:start-tracking', busData);
            setActiveTracking(busData);
            return true;
        } catch (err) {
            console.error('Error starting tracking:', err);
            setTrackingError('Failed to start tracking: ' + (err.message || 'Unknown error'));
            return false;
        }
    };

    const stopTracking = () => {
        if (!socket) {
            console.error('Socket not initialized');
            setTrackingError('Socket connection not established');
            return false;
        }

        if (!isConnected) {
            console.error('Socket not connected');
            setTrackingError('Socket connection not established');
            return false;
        }

        if (!activeTracking) {
            console.error('No active tracking session');
            setTrackingError('No active tracking session');
            return false;
        }

        try {
            console.log('Stopping tracking for bus:', activeTracking.busId);
            socket.emit('operator:stop-tracking', { busId: activeTracking.busId });
            setActiveTracking(null);
            return true;
        } catch (err) {
            console.error('Error stopping tracking:', err);
            setTrackingError('Failed to stop tracking: ' + (err.message || 'Unknown error'));
            return false;
        }
    };

    const updateLocation = (latitude, longitude, speed = 0) => {
        if (!socket || !isConnected || !activeTracking) {
            setTrackingError('No active tracking session');
            return false;
        }

        const locationData = {
            busId: activeTracking.busId,
            latitude,
            longitude,
            speed
        };

        console.log('Sending location update:', locationData);
        socket.emit('operator:update-location', locationData);
        setCurrentLocation({ latitude, longitude, speed });
        return true;
    };

    // User functions
    const subscribeToBus = (busId) => {
        if (!socket || !isConnected) {
            console.error('Socket not connected when trying to subscribe to bus:', busId);
            setTrackingError('Socket connection not established');
            return false;
        }

        console.log('Subscribing to bus updates for:', busId);
        socket.emit('user:subscribe', { busId });
        return true;
    };

    const unsubscribeFromBus = (busId) => {
        if (!socket || !isConnected) {
            setTrackingError('Socket connection not established');
            return false;
        }

        socket.emit('user:unsubscribe', { busId });
        return true;
    };

    // Context value
    const value = {
        socket,
        isConnected,
        activeTracking,
        currentLocation,
        trackingError,
        startTracking,
        stopTracking,
        updateLocation,
        subscribeToBus,
        unsubscribeFromBus,
    };

    return (
        <TrackingContext.Provider value={value}>
            {children}
        </TrackingContext.Provider>
    );
};

export default TrackingProvider; 