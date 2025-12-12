import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { UserAppContext } from '../../context/UserAppContext';
import { TrackingContext } from '../../context/TrackingContext';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { FaBus, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
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
    iconUrl: '/bus-icon.png', // Use a local icon from public folder
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Fallback to a colored marker if the bus icon fails to load
const createBusIcon = () => {
    try {
        return busIcon;
    } catch (error) {
        console.error("Failed to load bus icon, using fallback", error);
        return new L.Icon.Default({
            className: 'bus-marker-icon',
            imagePath: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/'
        });
    }
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

const LiveTracking = () => {
    const { backendUrl } = useContext(UserAppContext);
    const { socket, isConnected, subscribeToBus, unsubscribeFromBus } = useContext(TrackingContext);
    const { bookingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [busInfo, setBusInfo] = useState(null);
    const [busLocation, setBusLocation] = useState(null);
    const [disconnected, setDisconnected] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);
    const refreshTimerRef = useRef(null);

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

    // Listen for location updates
    const handleLocationUpdate = (data) => {
        console.log('Received location update:', data);
        if (data.busId === busInfo.busId) {
            setBusLocation({
                lat: data.latitude,
                lng: data.longitude,
                speed: data.speed || 0,
                timestamp: data.timestamp
            });
            setDisconnected(false);
            setLastUpdateTime(new Date());

            // Remove toast notification for location updates
        }
    };

    // Subscribe to bus location updates
    useEffect(() => {
        if (!isConnected || !busInfo?.busId) {
            return;
        }

        console.log(`Subscribing to updates for bus ID: ${busInfo.busId}`);

        // Subscribe to bus updates
        subscribeToBus(busInfo.busId);
        setLoading(false);

        // Listen for bus status
        const handleBusStatus = (data) => {
            console.log('Received bus status:', data);
            if (data.busId === busInfo.busId) {
                setBusInfo(prev => ({
                    ...prev,
                    isActive: data.isActive
                }));

                // If bus is active and has location, update it
                if (data.isActive && data.lastLocation) {
                    setBusLocation({
                        lat: data.lastLocation.latitude,
                        lng: data.lastLocation.longitude,
                        speed: data.speed || 0,
                        timestamp: data.lastUpdated
                    });
                    setDisconnected(false);
                    setLastUpdateTime(new Date());
                } else {
                    setDisconnected(!data.isActive);
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

        // Listen for status updates
        const handleStatusUpdate = (data) => {
            console.log('Received status update:', data);
            if (data.busId === busInfo.busId) {
                setBusInfo(prev => ({
                    ...prev,
                    isActive: data.isActive
                }));

                if (!data.isActive) {
                    setDisconnected(true);
                    toast.warning('Bus tracking has stopped');
                } else if (data.isActive && disconnected) {
                    setDisconnected(false);
                    toast.success('Bus tracking has started');
                }
            }
        };

        // Listen for connection errors
        const handleError = (error) => {
            console.error('Socket error:', error);
            setError(error.message || 'An error occurred with the tracking service');
            toast.error(error.message || 'An error occurred with the tracking service');
        };

        // Register event listeners
        socket.on('bus:status', handleBusStatus);
        socket.on('bus:location-update', handleLocationUpdate);
        socket.on('bus:tracking-stopped', handleTrackingStopped);
        socket.on('bus:status-update', handleStatusUpdate);
        socket.on('error', handleError);

        // Request immediate status update
        socket.emit('user:request-status', { busId: busInfo.busId });

        // Cleanup function
        return () => {
            if (busInfo?.busId) {
                console.log(`Unsubscribing from bus ${busInfo.busId}`);
                unsubscribeFromBus(busInfo.busId);
            }

            if (refreshTimerRef.current) {
                clearInterval(refreshTimerRef.current);
            }

            // Remove event listeners
            socket.off('bus:status', handleBusStatus);
            socket.off('bus:location-update', handleLocationUpdate);
            socket.off('bus:tracking-stopped', handleTrackingStopped);
            socket.off('bus:status-update', handleStatusUpdate);
            socket.off('error', handleError);
        };
    }, [isConnected, busInfo?.busId, socket, subscribeToBus, unsubscribeFromBus, disconnected]);

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
                                    </div>
                                </div>

                                {busLocation && (
                                    <div>
                                        <h2 className="text-lg font-semibold mb-4">Current Location</h2>
                                        <div className="space-y-3">
                                            <div>
                                                <span className="text-gray-600 text-sm">Coordinates:</span>
                                                <p className="font-medium">
                                                    {busLocation.lat.toFixed(6)}, {busLocation.lng.toFixed(6)}
                                                </p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 text-sm">Speed:</span>
                                                <p className="font-medium">{busLocation.speed.toFixed(1)} km/h</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600 text-sm">Last Updated:</span>
                                                <p className="font-medium">{formatTime(busLocation.timestamp)}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
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
                                {busLocation ? (
                                    <MapContainer
                                        center={[busLocation.lat, busLocation.lng]}
                                        zoom={15}
                                        style={{ height: '100%', width: '100%' }}
                                    >
                                        <TileLayer
                                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <Marker
                                            position={[busLocation.lat, busLocation.lng]}
                                            icon={createBusIcon()}
                                        >
                                            <Popup>
                                                <div>
                                                    <p className="font-bold">{busInfo?.busName}</p>
                                                    <p>{busInfo?.route}</p>
                                                    <p>Speed: {busLocation.speed.toFixed(1)} km/h</p>
                                                    <p>Updated: {formatTime(busLocation.timestamp)}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                        <CenterMapView position={{ lat: busLocation.lat, lng: busLocation.lng }} />
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LiveTracking; 