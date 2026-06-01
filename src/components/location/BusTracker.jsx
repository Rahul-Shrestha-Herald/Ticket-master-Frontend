import React, { useState, useEffect, useRef, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaTachometerAlt, FaClock, FaBus } from 'react-icons/fa';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom bus icon
const busIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="40" height="40">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
    `),
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

// Component to update map center
const MapUpdater = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const BusTracker = ({ busId, busName, busNumber, backendUrl }) => {
    const [busLocation, setBusLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    
    const socketRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        // Fetch initial location
        fetchBusLocation();

        // Setup socket connection for real-time updates
        const socketUrl = backendUrl.replace('/api', '');
        socketRef.current = io(`${socketUrl}/location`, {
            transports: ['websocket', 'polling']
        });

        socketRef.current.on('connect', () => {
            console.log('Connected to location tracking');
            // Subscribe to this bus updates
            socketRef.current.emit('user:subscribe', { busId });
            setIsTracking(true);
        });

        socketRef.current.on('tracking:started', (data) => {
            console.log('Tracking started:', data);
        });

        socketRef.current.on('location:updated', (data) => {
            console.log('Location updated:', data);
            setBusLocation({
                latitude: data.latitude,
                longitude: data.longitude,
                speed: data.speed,
                heading: data.heading,
                accuracy: data.accuracy
            });
            setLastUpdate(new Date(data.lastUpdated));
            setError(null);
        });

        socketRef.current.on('tracking:stopped', () => {
            toast.info('Bus has stopped sharing location');
            setError('Location sharing has been stopped by the operator');
        });

        socketRef.current.on('error', (data) => {
            console.error('Socket error:', data);
            toast.error(data.message);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.emit('user:unsubscribe', { busId });
                socketRef.current.disconnect();
            }
        };
    }, [busId, backendUrl]);

    const fetchBusLocation = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${backendUrl}/location/bus/${busId}`);
            const data = await response.json();

            if (data.success) {
                setBusLocation({
                    latitude: data.data.latitude,
                    longitude: data.data.longitude,
                    speed: data.data.speed,
                    heading: data.data.heading,
                    accuracy: data.data.accuracy
                });
                setLastUpdate(new Date(data.data.lastUpdated));
                setError(null);
            } else {
                setError(data.message);
            }
        } catch (err) {
            console.error('Error fetching bus location:', err);
            setError('Failed to fetch bus location');
        } finally {
            setLoading(false);
        }
    };

    const getTimeSinceUpdate = () => {
        if (!lastUpdate) return 'Unknown';
        const seconds = Math.floor((new Date() - lastUpdate) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading bus location...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !busLocation) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-96">
                    <div className="text-center">
                        <FaBus className="text-6xl text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Bus location not available</p>
                        <p className="text-sm text-gray-500">{error}</p>
                        <button
                            onClick={fetchBusLocation}
                            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const center = busLocation ? [busLocation.latitude, busLocation.longitude] : [27.7172, 85.3240]; // Default to Kathmandu

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold">{busName}</h3>
                        <p className="text-sm opacity-90">{busNumber}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {isTracking && (
                            <span className="flex items-center space-x-1 bg-green-500 px-3 py-1 rounded-full text-xs">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                <span>Live</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Info Bar */}
            {busLocation && (
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                                <FaTachometerAlt className="text-sm" />
                                <span className="text-xs font-medium">Speed</span>
                            </div>
                            <p className="text-lg font-bold text-blue-600">
                                {busLocation.speed.toFixed(1)} km/h
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                                <FaClock className="text-sm" />
                                <span className="text-xs font-medium">Updated</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-700">
                                {getTimeSinceUpdate()}
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1 text-gray-600 mb-1">
                                <FaMapMarkerAlt className="text-sm" />
                                <span className="text-xs font-medium">Accuracy</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-700">
                                ±{busLocation.accuracy.toFixed(0)}m
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Map */}
            <div className="h-96 relative">
                {busLocation ? (
                    <MapContainer
                        center={center}
                        zoom={15}
                        style={{ height: '100%', width: '100%' }}
                        ref={mapRef}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <MapUpdater center={center} />
                        <Marker position={center} icon={busIcon}>
                            <Popup>
                                <div className="text-center">
                                    <p className="font-semibold">{busName}</p>
                                    <p className="text-sm text-gray-600">{busNumber}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Speed: {busLocation.speed.toFixed(1)} km/h
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Updated: {getTimeSinceUpdate()}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-100">
                        <p className="text-gray-500">No location data available</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 text-center">
                <p className="text-xs text-gray-600">
                    Location updates automatically in real-time
                </p>
            </div>
        </div>
    );
};

export default BusTracker;
