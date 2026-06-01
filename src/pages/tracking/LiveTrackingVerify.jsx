import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserAppContext } from '../../context/UserAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    FaSearch, FaMapMarkerAlt, FaClock, FaBusAlt,
    FaArrowRight, FaCalendarAlt, FaChair, FaTicketAlt
} from 'react-icons/fa';
import { MdMyLocation } from 'react-icons/md';
import LoadingSpinner from '../../components/loading/LoadingSpinner';

const LiveTrackingVerify = () => {
    const { backendUrl, isLoggedin, userData } = useContext(UserAppContext);
    const navigate = useNavigate();

    // Manual form state
    const [formData, setFormData] = useState({ bookingId: '', travelDate: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [timeError, setTimeError] = useState(false);

    // User bookings state
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [trackingCard, setTrackingCard] = useState(null); // which card is being verified

    // Fetch user's confirmed bookings
    useEffect(() => {
        if (!isLoggedin) return;
        const fetchBookings = async () => {
            setBookingsLoading(true);
            try {
                const { data } = await axios.get(`${backendUrl}/api/user/bookings`);
                if (data.success) {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    // Keep only confirmed+paid bookings whose journey date is today or future
                    const upcoming = data.bookings
                        .filter(b => {
                            if (b.status !== 'confirmed' || b.paymentStatus !== 'paid') return false;
                            const raw = b.journeyDate || b.ticketInfo?.date || b.bookingDate;
                            if (!raw) return false;
                            const d = new Date(raw);
                            d.setHours(0, 0, 0, 0);
                            return d >= today;
                        })
                        .sort((a, b) => {
                            const da = new Date(a.journeyDate || a.ticketInfo?.date || a.bookingDate);
                            const db = new Date(b.journeyDate || b.ticketInfo?.date || b.bookingDate);
                            return da - db; // nearest first
                        });

                    // All upcoming bookings, nearest first
                    setBookings(upcoming);
                }
            } catch (_) {}
            finally { setBookingsLoading(false); }
        };
        fetchBookings();
    }, [isLoggedin, backendUrl]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(null);
        setTimeError(false);
    };

    // Verify and navigate — shared by both card click and manual form
    const verifyAndNavigate = async (bookingId, travelDate) => {
        setLoading(true);
        setError(null);
        setTimeError(false);
        try {
            axios.defaults.withCredentials = true;
            const response = await axios.get(`${backendUrl}/api/bookings/verify`, {
                params: { bookingId, travelDate }
            });
            if (response.data.success) {
                navigate(`/live-tracking/${bookingId}`, {
                    state: {
                        verified: true,
                        busId: response.data.busId,
                        bookingData: response.data.booking
                    }
                });
            } else {
                setError(response.data.message || 'Unable to verify booking');
                setTrackingCard(null);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'An error occurred while verifying your booking';
            if (msg.includes('12 hours')) setTimeError(true);
            setError(msg);
            toast.error(msg);
            setTrackingCard(null);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        if (!formData.bookingId.trim()) { setError('Please enter a booking ID'); return; }
        if (!formData.travelDate) { setError('Please select a travel date'); return; }
        await verifyAndNavigate(formData.bookingId, formData.travelDate);
    };

    const handleCardTrack = async (booking) => {
        const travelDate = booking.journeyDate
            ? new Date(booking.journeyDate).toISOString().split('T')[0]
            : new Date(booking.ticketInfo?.date || booking.bookingDate).toISOString().split('T')[0];
        setTrackingCard(booking._id);
        await verifyAndNavigate(booking.bookingId, travelDate);
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

    return (
        <div className="min-h-[90vh] pt-[8vh] bg-neutral-50">
            <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                        <MdMyLocation className="text-primary text-2xl" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-800">Live Bus Tracking</h1>
                    <p className="text-neutral-500 text-sm">Track your bus in real-time using your booking</p>
                </div>

                {/* ── My Bookings cards ─────────────────────────────── */}
                {isLoggedin && (
                    <div className="space-y-3">
                        <h2 className="text-sm font-semibold text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                            <FaTicketAlt className="text-primary" /> Your Confirmed Bookings
                        </h2>

                        {bookingsLoading ? (
                            <div className="flex justify-center py-8"><LoadingSpinner size="sm" /></div>
                        ) : bookings.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center text-neutral-400 text-sm">
                                No confirmed bookings found. Book a ticket to use live tracking.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {bookings.map(b => {
                                    const from = b.fromLocation || b.ticketInfo?.fromLocation || 'N/A';
                                    const to   = b.toLocation   || b.ticketInfo?.toLocation   || 'N/A';
                                    const date = b.journeyDate  || b.ticketInfo?.date          || b.bookingDate;
                                    const bus  = b.ticketInfo?.busName  || 'Bus';
                                    const seats = (b.selectedSeats || b.ticketInfo?.selectedSeats || []).join(', ') || 'N/A';
                                    const dep  = b.ticketInfo?.departureTime || '';
                                    const isTracking = trackingCard === b._id;

                                    return (
                                        <div
                                            key={b._id}
                                            onClick={() => !loading && handleCardTrack(b)}
                                            className="bg-white rounded-2xl border border-neutral-200 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
                                        >
                                            {/* Top accent */}
                                            <div className="h-1 w-full bg-gradient-to-r from-primary to-blue-400" />

                                            <div className="p-4 flex items-center gap-4">
                                                {/* Bus icon */}
                                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                                                    <FaBusAlt className="text-primary text-xl" />
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-semibold text-neutral-800 text-sm">{from}</span>
                                                        <FaArrowRight className="text-primary text-xs shrink-0" />
                                                        <span className="font-semibold text-neutral-800 text-sm">{to}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                            <FaCalendarAlt className="text-neutral-400" /> {formatDate(date)}
                                                            {dep && ` · ${dep}`}
                                                        </span>
                                                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                                                            <FaChair className="text-neutral-400" /> {seats}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-neutral-400 mt-0.5">{bus} · {b.bookingId}</p>
                                                </div>

                                                {/* Track button */}
                                                <button
                                                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl group-hover:bg-primary/90 transition-colors disabled:opacity-60"
                                                    disabled={loading}
                                                >
                                                    {isTracking
                                                        ? <LoadingSpinner size="xs" />
                                                        : <><MdMyLocation size={14} /> Track</>
                                                    }
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Divider ───────────────────────────────────────── */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-neutral-200" />
                    <span className="text-xs text-neutral-400 uppercase tracking-widest">or enter manually</span>
                    <div className="flex-1 h-px bg-neutral-200" />
                </div>

                {/* ── Manual form ───────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-5">
                    <h2 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                        <FaSearch className="text-primary" /> Track by Booking ID
                    </h2>

                    {error && (
                        <div className={`${timeError ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-red-50 border-red-200 text-red-600'} border rounded-xl p-4 text-sm`}>
                            {timeError ? (
                                <p className="flex items-start gap-2">
                                    <FaClock className="mt-0.5 shrink-0" />
                                    Live tracking is only available 12 hours before departure and 12 hours after arrival.
                                </p>
                            ) : error}
                        </div>
                    )}

                    <form onSubmit={handleManualSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Booking ID</label>
                            <input
                                type="text"
                                name="bookingId"
                                value={formData.bookingId}
                                onChange={handleChange}
                                placeholder="e.g. BK-4198791301"
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-neutral-600 mb-1.5">Travel Date</label>
                            <input
                                type="date"
                                name="travelDate"
                                value={formData.travelDate}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
                        >
                            {loading ? <LoadingSpinner size="sm" /> : <><FaSearch size={13} /> Track My Bus</>}
                        </button>
                    </form>

                    <p className="text-xs text-neutral-400 text-center leading-relaxed">
                        Tracking is available for confirmed bookings within 12 hours of departure or arrival.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LiveTrackingVerify;
