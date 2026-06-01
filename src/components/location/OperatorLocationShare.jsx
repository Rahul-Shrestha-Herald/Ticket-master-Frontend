import React, { useState, useEffect, useRef, useContext } from 'react';
import { OperatorAppContext } from '../../context/OperatorAppContext';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaStop, FaPlay, FaTachometerAlt, FaCompass } from 'react-icons/fa';

const OperatorLocationShare = ({ busId, busName }) => {
    const { backendUrl } = useContext(OperatorAppContext);
    const [isSharing, setIsSharing] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [speed, setSpeed] = useState(0);
    const [heading, setHeading] = useState(0);
    const [error, setError] = useState(null);
    
    const socketRef = useRef(null);
    const watchIdRef = useRef(null);
    const lastPositionRef = useRef(null);
    const lastTimeRef = useRef(null);

    useEffect(() => {
        // Initialize socket connection
        const socketUrl = backendUrl.replace('/api', '');
        socketRef.current = io(`${socketUrl}/location`, {
            transports: ['websocket', 'polling']
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to location socket');
        });

        socketRef.current.on('tracking:started', (data) => {
            console.log('Tracking started:', data);
            toast.success('Location sharing started');
        });

        socketRef.current.on('tracking:stopped', (data) => {
            console.log('Tracking stopped:', data);
            toast.info('Location sharing stopped');
        });

        socketRef.current.on('error', (data) => {
            console.error('Socket error:', data);
            toast.error(data.message);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, [backendUrl]);

    const calculateSpeed = (lat1, lon1, lat2, lon2, timeDiff) => {
        // Haversine formula to calculate distance
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // Distance in km
        
        const timeInHours = timeDiff / (1000 * 60 * 60);
        return distance / timeInHours; // Speed in km/h
    };

    const calculateHeading = (lat1, lon1, lat2, lon2) => {
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
        const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
                  Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
        const heading = Math.atan2(y, x) * 180 / Math.PI;
        return (heading + 360) % 360; // Normalize to 0-360
    };

    const startSharing = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            toast.error('Geolocation not supported');
            return;
        }

        setError(null);
        
        // Start watching position
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                const currentTime = Date.now();

                // Calculate speed and heading if we have a previous position
                let calculatedSpeed = 0;
                let calculatedHeading = heading;

                if (lastPositionRef.current && lastTimeRef.current) {
                    const timeDiff = currentTime - lastTimeRef.current;
                    if (timeDiff > 0) {
                        calculatedSpeed = calculateSpeed(
                            lastPositionRef.current.latitude,
                            lastPositionRef.current.longitude,
                            latitude,
                            longitude,
                            timeDiff
                        );
                        
                        calculatedHeading = calculateHeading(
                            lastPositionRef.current.latitude,
                            lastPositionRef.current.longitude,
                            latitude,
                            longitude
                        );
                    }
                }

                lastPositionRef.current = { latitude, longitude };
                lastTimeRef.current = currentTime;

                setCurrentLocation({ latitude, longitude, accuracy });
                setSpeed(calculatedSpeed);
                setHeading(calculatedHeading);

                // Emit location update via socket
                if (socketRef.current && socketRef.current.connected) {
                    socketRef.current.emit('operator:update-location', {
                        busId,
                        latitude,
                        longitude,
                        speed: calculatedSpeed,
                        heading: calculatedHeading,
                        accuracy,
                        timestamp: new Date().toISOString()
                    });
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                setError(error.message);
                toast.error(`Location error: ${error.message}`);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        // Notify socket that sharing has started
        if (socketRef.current) {
            socketRef.current.emit('operator:start-tracking', { 
                busId,
                busName 
            });
        }

        setIsSharing(true);
    };

    const stopSharing = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (socketRef.current) {
            socketRef.current.emit('operator:stop-tracking', { busId });
        }

        setIsSharing(false);
        setCurrentLocation(null);
        setSpeed(0);
        lastPositionRef.current = null;
        lastTimeRef.current = null;
        toast.info('Location sharing stopped');
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Live Location Sharing</h3>
                    <p className="text-sm text-gray-600">{busName}</p>
                </div>
                <div>
                    {!isSharing ? (
                        <button
                            onClick={startSharing}
                            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <FaPlay />
                            <span>Start Sharing</span>
                        </button>
                    ) : (
                        <button
                            onClick={stopSharing}
                            className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <FaStop />
                            <span>Stop Sharing</span>
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {isSharing && currentLocation && (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 text-green-700 mb-2">
                            <FaMapMarkerAlt className="text-xl" />
                            <span className="font-semibold">Sharing Location</span>
                        </div>
                        <p className="text-sm text-gray-600">
                            Your location is being shared in real-time with passengers
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 text-gray-700 mb-2">
                                <FaMapMarkerAlt />
                                <span className="text-sm font-medium">Coordinates</span>
                            </div>
                            <p className="text-xs text-gray-600">
                                Lat: {currentLocation.latitude.toFixed(6)}
                            </p>
                            <p className="text-xs text-gray-600">
                                Lon: {currentLocation.longitude.toFixed(6)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Accuracy: ±{currentLocation.accuracy.toFixed(0)}m
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 text-gray-700 mb-2">
                                <FaTachometerAlt />
                                <span className="text-sm font-medium">Speed</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-600">
                                {speed.toFixed(1)} <span className="text-sm">km/h</span>
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center space-x-2 text-gray-700 mb-2">
                                <FaCompass />
                                <span className="text-sm font-medium">Heading</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-600">
                                {heading.toFixed(0)}°
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                {heading >= 337.5 || heading < 22.5 ? 'North' :
                                 heading >= 22.5 && heading < 67.5 ? 'Northeast' :
                                 heading >= 67.5 && heading < 112.5 ? 'East' :
                                 heading >= 112.5 && heading < 157.5 ? 'Southeast' :
                                 heading >= 157.5 && heading < 202.5 ? 'South' :
                                 heading >= 202.5 && heading < 247.5 ? 'Southwest' :
                                 heading >= 247.5 && heading < 292.5 ? 'West' : 'Northwest'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Keep this page open to continue sharing your location. 
                            Passengers can track your bus in real-time on the map.
                        </p>
                    </div>
                </div>
            )}

            {!isSharing && !error && (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <FaMapMarkerAlt className="text-5xl text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Location sharing is currently off</p>
                    <p className="text-sm text-gray-500">
                        Click "Start Sharing" to allow passengers to track this bus in real-time
                    </p>
                </div>
            )}
        </div>
    );
};

export default OperatorLocationShare;
