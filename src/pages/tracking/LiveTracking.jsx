import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { UserAppContext } from '../../context/UserAppContext';
import { TrackingContext } from '../../context/TrackingContext';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { FaBus, FaArrowLeft, FaExclamationTriangle, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import LoadingSpinner from '../../components/loading/LoadingSpinner';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="48" height="48">
            <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
        </svg>
    `),
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48]
});

// Custom user location icon
const userIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#10b981" width="40" height="40">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Fallback to a colored marker if the bus icon fails to load
const createBusIcon = () => {
    try {
        return busIcon;
    } catch (error) {
        console.error("Failed to load bus icon, using fallback", error);
        return new L.Icon.Default();
    }
};

const createUserIcon = () => {
    try {
        return userIcon;
    } catch (error) {
        console.error("Failed to load user icon, using fallback", error);
        return new L.Icon.Default();
    }
};

// Component to fit map bounds to show both markers and route
const FitBounds = ({ userLocation, busLocation }) => {
    const map = useMap();

    useEffect(() => {
        if (userLocation && busLocation) {
            const bounds = L.latLngBounds([
                [userLocation.lat, userLocation.lng],
                [busLocation.lat, busLocation.lng]
            ]);
            map.fitBounds(bounds, { padding: [50, 50] });
        } else if (busLocation) {
            map.setView([busLocation.lat, busLocation.lng], 15);
        } else if (userLocation) {
            map.setView([userLocation.lat, userLocation.lng], 15);
        }
    }, [userLocation, busLocation, map]);

    return null;
};

// Component to center map view on marker
const CenterMapView = ({ position }) => {
    const map = useMap();

    useEffect(() => {
        if (position && position.lat && position.lng) {
            map.setView(position, map.getZoom());
        }
    }, [position, map]);

    return null;
};

// Calculate distance between two points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
};

const LiveTracking = () => {
    const { backendUrl } = useContext(UserAppContext);
    const { socket, isConnected, subscribeToBus, unsubscribeFromBus } = useContext(TrackingContext);
    const { bookingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [busInfo, setBusInfo] = useState(null);
    const [busLocation, setBusLocation] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locationPermission, setLocationPermission] = useState('prompt');
    const [disconnected, setDisconnected] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);
    const [distance, setDistance] = useState(null);
    const refreshTimerRef = useRef(null);
    const watchIdRef = useRef(null);

    // Protect from direct access (without verification)
    useEffect(() => {
        if (!location.state?.verified) {
            navigate('/live-tracking');
            return;
        }

        // Initialize bus information from location state
        if (location.state?.busId && location.state?.bookingData) {
            setBusInfo({
                busId: location.state.busId,
                busName: location.state.bookingData.busName || 'Unknown Bus',
                route: `${location.state.bookingData.fromLocation || ''} to ${location.state.bookingData.toLocation || ''}`,
                isActive: false
            });
        }
    }, [location, navigate]);

    // Get user's current location
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocationPermission('unavailable');
            toast.warning('Geolocation is not supported by your browser');
            return;
        }

        // Request permission and get current position
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
                setLocationPermission('granted');
            },
            (error) => {
                console.error('Error getting user location:', error);
                setLocationPermission('denied');
                if (error.code === 1) {
                    toast.info('Location permission denied. You can still track the bus.');
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        // Watch user position for continuous updates
        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                });
            },
            (error) => {
                console.error('Error watching user location:', error);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
        );

        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    // Calculate distance when both locations are available
    useEffect(() => {
        if (userLocation && busLocation) {
            const dist = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                busLocation.lat,
                busLocation.lng
            );
            setDistance(dist);
        } else {
            setDistance(null);
        }
    }, [userLocation, busLocation]);

    // Auto-refresh timer to request location updates
    useEffect(() => {
        if (busInfo?.busId && isConnected && !disconnected) {
            // Clear any existing timer
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }

            // Set up a timer to request fresh location data every 10 seconds
            refreshTimerRef.current = setInterval(() => {
                console.log('Requesting fresh location data...');
                // Request an update by re-subscribing
                socket.emit('user:refresh-location', { busId: busInfo.busId });

                // If it's been more than 2 minutes since the last update, show a notification
                if (lastUpdateTime && (new Date() - new Date(lastUpdateTime) > 2 * 60 * 1000)) {
                    // No toast notification
                }
            }, 10000); // 10 seconds interval instead of 30
        }

        return () => {
            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [busInfo?.busId, isConnected, disconnected, lastUpdateTime]);

    // Listen for location updates - memoized to prevent recreating on every render
    const handleLocationUpdate = useCallback((data) => {
        console.log('Received location update:', data);
        if (data.busId === busInfo?.busId) {
            setBusLocation({
                lat: data.latitude,
                lng: data.longitude,
                speed: data.speed || 0,
                timestamp: data.lastUpdated || data.timestamp
            });
            setDisconnected(false);
            setLastUpdateTime(new Date());
            
            // Update bus info to mark as active
            setBusInfo(prev => ({
                ...prev,
                isActive: true
            }));
        }
    }, [busInfo?.busId]);

    // Subscribe to bus location updates
    useEffect(() => {
        if (!isConnected || !busInfo?.busId || !socket) {
            return;
        }

        console.log(`Subscribing to updates for bus ID: ${busInfo.busId}`);

        // Subscribe to bus updates
        subscribeToBus(busInfo.busId);
        setLoading(false);

        // Listen for tracking status
        const handleTrackingStatus = (data) => {
            console.log('Received tracking status:', data);
            if (data.busId === busInfo.busId) {
                setBusInfo(prev => ({
                    ...prev,
                    isActive: data.isActive
                }));
                
                if (!data.isActive) {
                    setDisconnected(true);
                } else {
                    setDisconnected(false);
                }
            }
        };

        // Listen for tracking stopped
        const handleTrackingStopped = (data) => {
            console.log('Tracking stopped event:', data);
            if (data.busId === busInfo.busId) {
                setDisconnected(true);
                setBusInfo(prev => ({
                    ...prev,
                    isActive: false
                }));
                toast.warning('Bus tracking has been stopped by the operator');
            }
        };

        // Listen for connection errors
        const handleError = (error) => {
            console.error('Socket error:', error);
            setError(error.message || 'An error occurred with the tracking service');
            toast.error(error.message || 'An error occurred with the tracking service');
        };

        // Register event listeners with correct event names
        socket.on('location:updated', handleLocationUpdate);
        socket.on('tracking:status', handleTrackingStatus);
        socket.on('tracking:stopped', handleTrackingStopped);
        socket.on('error', handleError);

        // Request immediate status update
        socket.emit('user:request-status', { busId: busInfo.busId });

        // Cleanup function
        return () => {
            console.log(`Cleaning up subscriptions for bus ${busInfo.busId}`);
            
            // Remove event listeners first
            socket.off('location:updated', handleLocationUpdate);
            socket.off('tracking:status', handleTrackingStatus);
            socket.off('tracking:stopped', handleTrackingStopped);
            socket.off('error', handleError);
            
            // Then unsubscribe
            if (busInfo?.busId) {
                unsubscribeFromBus(busInfo.busId);
            }

            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }
        };
    }, [isConnected, busInfo?.busId, socket, subscribeToBus, unsubscribeFromBus, handleLocationUpdate]);

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = new Date(timestamp);
        return date.toLocaleTimeString();
    };

    return (
        <div className="min-h-[90vh] pt-[8vh] flex flex-col bg-gray-50">
            <div className="container mx-auto px-4 py-6">
                <button
                    onClick={() => navigate('/live-tracking')}
                    className="mb-4 flex items-center text-primary hover:text-primary/80"
                >
                    <FaArrowLeft className="mr-2" /> Back to verification
                </button>

                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Live Bus Tracking</h1>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg my-4">
                            <p className="flex items-center">
                                <FaExclamationTriangle className="mr-2" />
                                {error}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h2 className="text-lg font-semibold mb-4">Bus Information</h2>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-gray-600 text-sm">Bus Name:</span>
                                            <p className="font-medium">{busInfo?.busName || 'Unknown'} {busInfo?.busNumber ? `(${busInfo.busNumber})` : ''}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-sm">Route:</span>
                                            <p className="font-medium">{busInfo?.route || 'Unknown'}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-sm">Booking ID:</span>
                                            <p className="font-medium">{bookingId}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 text-sm">Status:</span>
                                            {busInfo?.isActive ? (
                                                <p className="font-medium text-green-600">Live Tracking Active</p>
                                            ) : (
                                                <p className="font-medium text-red-600">Tracking Not Available</p>
                                            )}
                                        </div>
                                        {distance !== null && (
                                            <div>
                                                <span className="text-gray-600 text-sm flex items-center">
                                                    <FaRoute className="mr-1" /> Distance:
                                                </span>
                                                <p className="font-medium text-blue-600">
                                                    {distance < 1 
                                                        ? `${(distance * 1000).toFixed(0)} meters` 
                                                        : `${distance.toFixed(2)} km`}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold mb-4">Location Details</h2>
                                    <div className="space-y-3">
                                        {busLocation && (
                                            <>
                                                <div>
                                                    <span className="text-gray-600 text-sm flex items-center">
                                                        <FaBus className="mr-1" /> Bus Location:
                                                    </span>
                                                    <p className="font-medium text-xs">
                                                        {busLocation.lat.toFixed(6)}, {busLocation.lng.toFixed(6)}
                                                    </p>
                                                    <p className="text-sm text-gray-600">Speed: {busLocation.speed.toFixed(1)} km/h</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600 text-sm">Last Updated:</span>
                                                    <p className="font-medium">{formatTime(busLocation.timestamp)}</p>
                                                </div>
                                            </>
                                        )}
                                        {userLocation && (
                                            <div>
                                                <span className="text-gray-600 text-sm flex items-center">
                                                    <FaMapMarkerAlt className="mr-1" /> Your Location:
                                                </span>
                                                <p className="font-medium text-xs">
                                                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                                                </p>
                                                <p className="text-xs text-gray-500">Accuracy: ±{userLocation.accuracy.toFixed(0)}m</p>
                                            </div>
                                        )}
                                        {!userLocation && locationPermission === 'denied' && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                                                <p className="text-xs text-yellow-700">
                                                    Enable location to see distance and route
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {disconnected && (
                                <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg mb-6">
                                    <p className="flex items-center">
                                        <FaExclamationTriangle className="mr-2" />
                                        Live tracking has been disconnected. The operator is not currently sharing the bus location.
                                    </p>
                                </div>
                            )}

                            <div className="w-full h-[60vh] rounded-lg overflow-hidden border border-gray-300">
                                {busLocation || userLocation ? (
                                    <MapContainer
                                        center={busLocation ? [busLocation.lat, busLocation.lng] : [userLocation.lat, userLocation.lng]}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        
                                        {/* Fit bounds to show both markers */}
                                        <FitBounds userLocation={userLocation} busLocation={busLocation} />
                                        
                                        {/* User location marker */}
                                        {userLocation && (
                                            <Marker
                                                position={[userLocation.lat, userLocation.lng]}
                                                icon={createUserIcon()}
                                            >
                                                <Popup>
                                                    <div>
                                                        <p className="font-bold">Your Location</p>
                                                        <p className="text-xs">Lat: {userLocation.lat.toFixed(6)}</p>
                                                        <p className="text-xs">Lng: {userLocation.lng.toFixed(6)}</p>
                                                        <p className="text-xs">Accuracy: ±{userLocation.accuracy.toFixed(0)}m</p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        )}
                                        
                                        {/* Bus location marker */}
                                        {busLocation && (
                                            <Marker
                                                position={[busLocation.lat, busLocation.lng]}
                                                icon={createBusIcon()}
                                            >
                                                <Popup>
                                                    <div>
                                                        <p className="font-bold">{busInfo?.busName}</p>
                                                        <p className="text-xs">{busInfo?.route}</p>
                                                        <p className="text-xs">Speed: {busLocation.speed.toFixed(1)} km/h</p>
                                                        <p className="text-xs">Updated: {formatTime(busLocation.timestamp)}</p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        )}
                                        
                                        {/* Route line between user and bus */}
                                        {userLocation && busLocation && (
                                            <Polyline
                                                positions={[
                                                    [userLocation.lat, userLocation.lng],
                                                    [busLocation.lat, busLocation.lng]
                                                ]}
                                                pathOptions={{
                                                    color: '#3b82f6',
                                                    weight: 4,
                                                    opacity: 0.7,
                                                    dashArray: '10, 10',
                                                    lineCap: 'round',
                                                    lineJoin: 'round'
                                                }}
                                            />
                                        )}
                                    </MapContainer>
                                ) : (
                                    <div className="h-full w-full flex flex-col items-center justify-center bg-gray-100">
                                        <FaBus className="text-gray-400 text-5xl mb-4" />
                                        <p className="text-gray-500 text-center">
                                            {busInfo?.isActive
                                                ? "Waiting for location data..."
                                                : "Bus location is not currently being shared."}
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Map Legend */}
                            {(userLocation || busLocation) && (
                                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Map Legend</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                        {userLocation && (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                    <FaMapMarkerAlt className="text-white text-xs" />
                                                </div>
                                                <span className="text-gray-700">Your Location</span>
                                            </div>
                                        )}
                                        {busLocation && (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <FaBus className="text-white text-xs" />
                                                </div>
                                                <span className="text-gray-700">Bus Location</span>
                                            </div>
                                        )}
                                        {userLocation && busLocation && (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-1 bg-blue-500" style={{ borderTop: '2px dashed #3b82f6' }}></div>
                                                <span className="text-gray-700">Route Path</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveTracking; 