import React, { useState, useEffect, useContext, useRef } from 'react';
import { OperatorAppContext } from '../../../context/OperatorAppContext';
import { TrackingContext } from '../../../context/TrackingContext';
import OperatorLayout from '../../../layout/operator/OperatorLayout';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBus, FaLocationArrow, FaStopCircle, FaInfoCircle } from 'react-icons/fa';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import { useParams } from "react-router-dom";
import io from "socket.io-client";

const OperatorLiveTracking = () => {
    const { backendUrl } = useContext(OperatorAppContext);
    const { startTracking, stopTracking, updateLocation, activeTracking, isConnected, trackingError } = useContext(TrackingContext);
    const [socket, setSocket] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [error, setError] = useState(null);
    const [socketEvents, setSocketEvents] = useState([]);
    const [locationPermission, setLocationPermission] = useState("unknown");
    const [useFallbackLocation, setUseFallbackLocation] = useState(false);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiResponse, setApiResponse] = useState(null);
    const [selectedBus, setSelectedBus] = useState(null);
    const locationTimeoutRef = useRef(null);
    const watchIdRef = useRef(null);
    const { busId } = useParams();
    const [updateFrequency, setUpdateFrequency] = useState(10); // Default to 10 seconds

    // Initialize socket connection
    useEffect(() => {
        // Connect to tracking server
        const trackingServerUrl = 'http://localhost:8000';

        const newSocket = io(trackingServerUrl, {
            withCredentials: true,
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket);

        // Set up event listeners
        newSocket.on('connect', () => {
            console.log('Operator connected to tracking server:', newSocket.id);

            // If we already have an active bus tracking session, re-register it
            if (isTracking && selectedBus) {
                console.log('Re-registering active bus tracking session');
                newSocket.emit('operator:start-tracking', {
                    busId: selectedBus._id,
                    busName: selectedBus.busName || selectedBus.name,
                    route: selectedBus.route || 'Unknown Route'
                });
            }
        });

        newSocket.on('error', (error) => {
            console.error('Socket error:', error);
            toast.error(`Tracking error: ${error.message || 'Unknown error'}`);
        });

        newSocket.on('tracking:started', (data) => {
            console.log('Tracking started confirmation:', data);
            toast.success('Tracking session established with server');
        });

        newSocket.on('tracking:stopped', (data) => {
            console.log('Tracking stopped confirmation:', data);
        });

        newSocket.on('location:updated', (data) => {
            console.log('Location update confirmation:', data);
        });

        // Clean up on unmount
        return () => {
            if (newSocket) {
                console.log('Cleaning up socket connection');

                // If tracking is active, stop it before disconnecting
                if (isTracking && selectedBus) {
                    newSocket.emit('operator:stop-tracking', { busId: selectedBus._id });
                }

                newSocket.disconnect();
            }
        };
    }, []);

    // Fetch verified buses
    useEffect(() => {
        const fetchBuses = async () => {
            try {
                setLoading(true);
                axios.defaults.withCredentials = true;
                const response = await axios.get(`${backendUrl}/api/operator/bus/buses`);

                // Store full response for debugging
                setApiResponse(response.data);
                console.log('API Response:', response.data);

                // First, log all potential fields that could indicate verification status
                if (Array.isArray(response.data) && response.data.length > 0) {
                    console.log('Sample bus fields:', Object.keys(response.data[0]));
                    console.log('Sample bus data:', response.data[0]);
                }

                // Process buses based on verification status
                let busesToShow = [];

                if (Array.isArray(response.data)) {
                    // Check for fields that actually exist in the data
                    busesToShow = response.data.filter(bus => {
                        // Look at the most likely fields that would indicate verification
                        return (
                            bus.status === 'verified' ||
                            bus.verified === true ||
                            bus.isVerified === true ||
                            bus.busStatus === 'verified' ||
                            // This is the likely field based on your current database structure
                            bus.verificationStatus === 'verified'
                        );
                    });

                    console.log('Filtered buses for tracking:', busesToShow);

                    // If we still have zero buses, log a special message with more details
                    if (busesToShow.length === 0 && response.data.length > 0) {
                        console.log('No verified buses found. Sample bus verification fields:');
                        const sampleBus = response.data[0];
                        console.log('- status:', sampleBus.status);
                        console.log('- verified:', sampleBus.verified);
                        console.log('- isVerified:', sampleBus.isVerified);
                        console.log('- busStatus:', sampleBus.busStatus);
                        console.log('- verificationStatus:', sampleBus.verificationStatus);
                    }
                } else if (response.data.buses && Array.isArray(response.data.buses)) {
                    // Similar check for nested buses property
                    busesToShow = response.data.buses.filter(bus =>
                        bus.status === 'verified' ||
                        bus.verified === true ||
                        bus.isVerified === true ||
                        bus.busStatus === 'verified' ||
                        bus.verificationStatus === 'verified'
                    );
                } else {
                    console.error('Unexpected response format:', response.data);
                    toast.error('Unexpected data format from server');
                }

                setBuses(busesToShow);
            } catch (error) {
                toast.error('Failed to load buses. Please try again.');
                console.error('Error fetching buses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBuses();
    }, [backendUrl]);

    // Fallback location near Kathmandu center
    const FALLBACK_LOCATION = {
        latitude: 27.700769,
        longitude: 85.300140,
        isFallback: true
    };

    const checkAndRequestGeolocationPermission = async () => {
        try {
            if (!navigator.geolocation) {
                setLocationPermission("unavailable");
                setError("Geolocation is not supported by your browser");
                setUseFallbackLocation(true);
                return false;
            }

            // Check if permission is already granted
            const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
            setLocationPermission(permissionStatus.state);

            // Listen for permission changes
            permissionStatus.addEventListener('change', () => {
                setLocationPermission(permissionStatus.state);
                if (permissionStatus.state === 'granted') {
                    updateCurrentPosition();
                } else if (permissionStatus.state === 'denied') {
                    setError("Location permission was denied. Please enable location access.");
                    setUseFallbackLocation(true);
                }
            });

            return permissionStatus.state === 'granted';
        } catch (err) {
            console.error("Error checking geolocation permission:", err);
            setError("Unable to check location permission: " + err.message);
            return false;
        }
    };

    const updateCurrentPosition = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setUseFallbackLocation(true);
            return;
        }

        setError(null);

        // Set a timeout to use fallback location if geolocation takes too long
        if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current);
        locationTimeoutRef.current = setTimeout(() => {
            if (!currentLocation) {
                console.log("Location retrieval timed out, using fallback location");
                setCurrentLocation(FALLBACK_LOCATION);
                setUseFallbackLocation(true);
            }
        }, 10000); // Changed to 10 seconds timeout

        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current);
                setCurrentLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed || 0,
                    timestamp: position.timestamp
                });
                setUseFallbackLocation(false);
                setError(null);

                // Send the location to the server if tracking is active
                if (isTracking && socket) {
                    socket.emit("operator:update-location", {
                        busId: busId,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        speed: position.coords.speed || 0,
                        timestamp: new Date().toISOString()
                    });
                }
            },
            (err) => {
                console.error("Error getting location:", err);

                if (err.code === 1) {
                    setError("Location permission denied. Please enable location access in your browser settings.");
                    setLocationPermission("denied");
                } else if (err.code === 2) {
                    setError("Location unavailable. Please try again or check your device's GPS.");
                } else if (err.code === 3) {
                    setError("Location request timed out. Please try again.");
                } else {
                    setError(`Location error: ${err.message}`);
                }

                // If there's an error getting the real location and we need one, use the fallback
                if (isTracking && !currentLocation) {
                    setCurrentLocation(FALLBACK_LOCATION);
                    setUseFallbackLocation(true);
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleStartTracking = async (bus) => {
        // Store the selected bus
        setSelectedBus(bus);

        // Request permission if not already granted
        await checkAndRequestGeolocationPermission();

        setIsTracking(true);
        updateCurrentPosition();

        // Show toast notification
        toast.success(`Started location sharing for ${bus.busName || bus.name}`);

        // Initialize tracking with the server
        if (socket && isConnected) {
            socket.emit("operator:start-tracking", {
                busId: bus._id,
                busName: bus.busName || bus.name,
                route: bus.route || 'Unknown Route'
            });
        }

        // Start watching position for continuous updates
        if (navigator.geolocation) {
            // Clear existing watch if any
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }

            // Using 10 seconds (10000ms) update interval for location updates
            watchIdRef.current = navigator.geolocation.watchPosition(
                (position) => {
                    const newLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        speed: position.coords.speed || 0,
                        timestamp: position.timestamp
                    };
                    setCurrentLocation(newLocation);
                    setUseFallbackLocation(false);

                    // Send the location update if we're connected
                    if (socket && isConnected) {
                        socket.emit("operator:update-location", {
                            busId: bus._id,
                            latitude: newLocation.latitude,
                            longitude: newLocation.longitude,
                            speed: newLocation.speed || 0,
                            timestamp: new Date().toISOString()
                        });
                    }
                },
                (err) => {
                    console.error("Watching position error:", err);
                    // If we have persistent errors watching the position,
                    // fall back to the static location if needed
                    if (useFallbackLocation && socket && isConnected) {
                        socket.emit("operator:update-location", {
                            busId: bus._id,
                            latitude: FALLBACK_LOCATION.latitude,
                            longitude: FALLBACK_LOCATION.longitude,
                            speed: 0,
                            timestamp: new Date().toISOString(),
                            isFallback: true
                        });
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
            setUpdateFrequency(10); // Set the actual update frequency being used
        }

        // Don't need the fast fallback, change to also use 10 seconds for consistency
        setTimeout(() => {
            if (!currentLocation && isTracking) {
                setCurrentLocation({
                    ...FALLBACK_LOCATION,
                    speed: 0
                });
                setUseFallbackLocation(true);
                if (socket && isConnected) {
                    socket.emit("operator:update-location", {
                        busId: bus._id,
                        latitude: FALLBACK_LOCATION.latitude,
                        longitude: FALLBACK_LOCATION.longitude,
                        speed: 0,
                        timestamp: new Date().toISOString(),
                        isFallback: true
                    });
                }
            }
        }, 10000); // Changed to 10 seconds
    };

    const handleStopTracking = () => {
        setIsTracking(false);

        // Send stop tracking command to server
        if (socket && isConnected && selectedBus) {
            socket.emit("operator:stop-tracking", { busId: selectedBus._id });
        }

        if (watchIdRef.current && navigator.geolocation) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (locationTimeoutRef.current) {
            clearTimeout(locationTimeoutRef.current);
            locationTimeoutRef.current = null;
        }

        // Show toast notification
        toast.info(`Stopped location sharing for ${selectedBus?.busName || selectedBus?.name || 'this bus'}`);
    };

    // Add a function to check tracking status and update UI if needed
    const checkTrackingStatus = () => {
        // Check if context says we're tracking but local state doesn't match
        if (activeTracking && !isTracking) {
            console.log('Detected active tracking session, updating UI state');
            setIsTracking(true);
            if (!currentLocation) {
                // Try to find the bus in our list
                const matchingBus = buses.find(bus => bus._id === activeTracking.busId);
                if (matchingBus) {
                    setCurrentLocation(null);
                }
            }
            updateCurrentPosition();
        }
        // Check if context says we're not tracking but local state thinks we are
        else if (!activeTracking && isTracking) {
            console.log('No active tracking session in context, updating UI state');
            setIsTracking(false);
            handleStopTracking();
        }
    };

    // Add this effect to check tracking status whenever activeTracking changes
    useEffect(() => {
        checkTrackingStatus();
    }, [activeTracking, buses]);

    // Clean up on component unmount
    useEffect(() => {
        return () => {
            // Stop tracking if active when component unmounts
            if (isTracking) {
                handleStopTracking();
            }
        };
    }, [isTracking]);

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleTimeString();
    };

    // return (
    //     <OperatorLayout>
    //         <div className="container mx-auto py-6">
    //             <h1 className="text-2xl font-bold text-gray-800 mb-6">Live Location Tracking</h1>

    //             {trackingError && (
    //                 <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
    //                     <p>{trackingError}</p>
    //                 </div>
    //             )}

    //             {!isConnected && (
    //                 <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-6">
    //                     <p className="flex items-center">
    //                         <FaInfoCircle className="mr-2" />
    //                         Not connected to tracking server. Attempting to reconnect...
    //                     </p>
    //                 </div>
    //             )}

    //             {isTracking ? (
    //                 <div className="bg-white rounded-xl shadow-md p-6">
    //                     <div className="flex justify-between items-start mb-4">
    //                         <div>
    //                             <h1 className="text-2xl font-bold text-gray-800 mb-2">Bus Location Management</h1>
    //                             <h2 className="text-lg text-green-600">
    //                                 Actively sharing location for {selectedBus?.busName || selectedBus?.name || 'Unknown Bus'}
    //                                 {selectedBus?.busNumber ? ` (${selectedBus.busNumber})` : ''}
    //                             </h2>
    //                         </div>
    //                         <button
    //                             onClick={handleStopTracking}
    //                             className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center"
    //                         >
    //                             <FaStopCircle className="mr-2" />
    //                             Stop Sharing Location
    //                         </button>
    //                     </div>

    //                     <div className="mt-4">
    //                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    //                             <div>
    //                                 <div className="bg-gray-50 p-4 rounded-lg">
    //                                     <h3 className="font-semibold text-gray-700 mb-3">Bus Information</h3>
    //                                     <div className="space-y-2">
    //                                         <div>
    //                                             <span className="text-gray-600 text-sm block">Bus Name:</span>
    //                                             <p className="font-medium">
    //                                                 {selectedBus?.busName || selectedBus?.name || 'Unknown'}
    //                                                 {selectedBus?.busNumber ? ` (${selectedBus.busNumber})` : ''}
    //                                             </p>
    //                                         </div>
    //                                         <div>
    //                                             <span className="text-gray-600 text-sm block">Status:</span>
    //                                             <p className="font-medium text-green-600">Location sharing active</p>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             </div>

    //                             {currentLocation && (
    //                                 <div className="bg-white p-4 rounded-lg border border-gray-200">
    //                                     <h3 className="font-semibold text-gray-700 mb-3">Current Location</h3>
    //                                     <div className="grid grid-cols-1 gap-4">
    //                                         <div>
    //                                             <span className="text-gray-600 text-sm block">Coordinates:</span>
    //                                             <p className="font-medium">
    //                                                 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
    //                                             </p>
    //                                         </div>

    //                                         <div>
    //                                             <span className="text-gray-600 text-sm block">Speed:</span>
    //                                             <p className="font-medium">
    //                                                 {currentLocation && currentLocation.speed !== undefined ? `${(currentLocation.speed || 0).toFixed(1)} km/h` : '0 km/h'}
    //                                             </p>
    //                                         </div>

    //                                         <div>
    //                                             <span className="text-gray-600 text-sm block">Last Updated:</span>
    //                                             <p className="font-medium">
    //                                                 {new Date().toLocaleTimeString()}
    //                                             </p>
    //                                         </div>
    //                                     </div>
    //                                 </div>
    //                             )}
    //                         </div>
    //                     </div>

    //                     <div className="mt-6 text-sm text-gray-600">
    //                         <p>Your location is being shared in real-time with passengers who have verified bookings for this bus. Make sure to stop sharing when your journey is complete.</p>
    //                     </div>

    //                     {/* Debug info section */}
    //                     <div className="mt-6 pt-5 border-t border-gray-200">
    //                         <details className="text-sm">
    //                             <summary className="font-medium text-gray-700 cursor-pointer">Connection Details (Debug)</summary>
    //                             <div className="mt-2 p-3 bg-gray-50 rounded">
    //                                 <p><span className="font-medium">Socket Connected:</span> {isConnected ? 'Yes' : 'No'}</p>
    //                                 <p><span className="font-medium">Tracking Active:</span> {isTracking ? 'Yes' : 'No'}</p>
    //                                 <p><span className="font-medium">Bus ID:</span> {selectedBus?._id || busId || 'None'}</p>
    //                                 <p><span className="font-medium">Location Interval Active:</span> {watchIdRef.current ? 'Yes' : 'No'}</p>
    //                                 <p><span className="font-medium">Update Frequency:</span> Every {updateFrequency} seconds</p>
    //                                 <div className="mt-2">
    //                                     <button
    //                                         onClick={handleStopTracking}
    //                                         className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded hover:bg-red-200"
    //                                     >
    //                                         Stop Tracking
    //                                     </button>
    //                                 </div>
    //                             </div>
    //                         </details>
    //                     </div>
    //                 </div>
    //             ) : (
    //                 <div className="bg-white rounded-lg shadow-md mb-6">
    //                     <div className="p-6 border-b">
    //                         <h2 className="text-xl font-semibold">Verified Buses</h2>
    //                         <p className="text-gray-600">Select a bus to start sharing its location</p>
    //                     </div>

    //                     {loading ? (
    //                         <div className="p-6 flex justify-center">
    //                             <LoadingSpinner />
    //                         </div>
    //                     ) : buses.length === 0 ? (
    //                         <div className="p-6">
    //                             <div className="text-center text-gray-500">
    //                                 <FaBus className="mx-auto text-4xl mb-3 text-gray-300" />
    //                                 <p>No verified buses found. Please verify your buses first.</p>
    //                             </div>

    //                             {apiResponse && (
    //                                 <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
    //                                     <h3 className="font-medium mb-2">Debugging Information:</h3>
    //                                     <p>Received {Array.isArray(apiResponse) ? apiResponse.length : 'unknown'} bus records</p>
    //                                     <p className="mt-2">Check the browser console for detailed response data</p>
    //                                 </div>
    //                             )}
    //                         </div>
    //                     ) : (
    //                         <div className="overflow-x-auto">
    //                             <table className="w-full">
    //                                 <thead className="bg-gray-50">
    //                                     <tr>
    //                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                                             Bus Name
    //                                         </th>
    //                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                                             Bus Number
    //                                         </th>
    //                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
    //                                             Action
    //                                         </th>
    //                                     </tr>
    //                                 </thead>
    //                                 <tbody className="bg-white divide-y divide-gray-200">
    //                                     {buses.map((bus) => (
    //                                         <tr key={bus._id} className="hover:bg-gray-50">
    //                                             <td className="px-6 py-4 whitespace-nowrap">
    //                                                 <div className="font-medium text-gray-900">{bus.busName || bus.name}</div>
    //                                             </td>
    //                                             <td className="px-6 py-4 whitespace-nowrap">
    //                                                 <div className="text-sm text-gray-900">{bus.busNumber || bus.number}</div>
    //                                             </td>
    //                                             <td className="px-6 py-4 whitespace-nowrap">
    //                                                 <button
    //                                                     onClick={() => handleStartTracking(bus)}
    //                                                     className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg flex items-center"
    //                                                 >
    //                                                     <FaLocationArrow className="mr-2" />
    //                                                     Share Location
    //                                                 </button>
    //                                             </td>
    //                                         </tr>
    //                                     ))}
    //                                 </tbody>
    //                             </table>
    //                         </div>
    //                     )}
    //                 </div>
    //             )}
    //         </div>
    //     </OperatorLayout>
    // );
};

export default OperatorLiveTracking; 