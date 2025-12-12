import React, { useState, useEffect, useContext } from 'react';
import { UserAppContext } from '../../../context/UserAppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import RootLayout from '../../../layout/RootLayout';
import TopLayout from '../../../layout/toppage/TopLayout';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import { FaDownload, FaEye, FaSearch, FaFilter } from 'react-icons/fa';

const UserBookings = () => {
    const { backendUrl, userData } = useContext(UserAppContext);
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState({
        bookingId: '',
        route: '',
        date: '',
        seats: '',
        amount: ''
    });
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRangeFilter, setDateRangeFilter] = useState('all');

    useEffect(() => {
        const fetchUserBookings = async () => {
            try {
                setLoading(true);
                // Set withCredentials to true to send cookies with the request
                axios.defaults.withCredentials = true;
                const response = await axios.get(`${backendUrl}/api/user/bookings`);

                if (response.data.success) {
                    setBookings(response.data.bookings);
                    setFilteredBookings(response.data.bookings);
                } else {
                    setError('Failed to fetch bookings.');
                    toast.error('Failed to fetch your bookings.');
                }
            } catch (error) {
                console.error('Error fetching bookings:', error);
                setError('Error fetching your bookings. Please try again later.');
                toast.error('Error fetching your bookings. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserBookings();
    }, [backendUrl]);

    // Apply filters whenever search query or status filter changes
    useEffect(() => {
        filterBookings();
    }, [searchQuery, statusFilter, bookings]);

    // Function to filter bookings based on search query and status filter
    const filterBookings = () => {
        let filtered = [...bookings];

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => {
                const status = booking.paymentStatus || booking.status || 'pending';
                if (statusFilter === 'success') {
                    return status === 'confirmed' || status === 'paid';
                } else if (statusFilter === 'failed') {
                    return status === 'canceled' || status === 'refunded' || status === 'pending';
                }
                return true;
            });
        }

        // Filter by date range
        if (dateRangeFilter !== 'all') {
            filtered = filtered.filter(booking => {
                const journeyDate = getNestedProperty(booking, 'ticketInfo.date') || booking.journeyDate || booking.date;
                if (!journeyDate) return false;

                const bookingDate = new Date(journeyDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // Calculate start of week (Sunday)
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());

                // Calculate start of month
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

                // Calculate start of year
                const startOfYear = new Date(today.getFullYear(), 0, 1);

                switch (dateRangeFilter) {
                    case 'today':
                        // Check if the booking date is today
                        const todayEnd = new Date(today);
                        todayEnd.setHours(23, 59, 59, 999);
                        return bookingDate >= today && bookingDate <= todayEnd;

                    case 'week':
                        // Check if the booking date is in this week
                        const endOfWeek = new Date(startOfWeek);
                        endOfWeek.setDate(startOfWeek.getDate() + 7);
                        return bookingDate >= startOfWeek && bookingDate < endOfWeek;

                    case 'month':
                        // Check if the booking date is in this month
                        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                        endOfMonth.setHours(23, 59, 59, 999);
                        return bookingDate >= startOfMonth && bookingDate <= endOfMonth;

                    case 'year':
                        // Check if the booking date is in this year
                        const endOfYear = new Date(today.getFullYear(), 11, 31);
                        endOfYear.setHours(23, 59, 59, 999);
                        return bookingDate >= startOfYear && bookingDate <= endOfYear;

                    default:
                        return true;
                }
            });
        }

        // Filter by search queries
        if (searchQuery.bookingId) {
            filtered = filtered.filter(booking =>
                (booking.bookingId || booking._id || '').toString().toLowerCase().includes(searchQuery.bookingId.toLowerCase())
            );
        }

        if (searchQuery.route) {
            filtered = filtered.filter(booking => {
                const fromLocation = getNestedProperty(booking, 'ticketInfo.fromLocation') || booking.fromLocation || '';
                const toLocation = getNestedProperty(booking, 'ticketInfo.toLocation') || booking.toLocation || '';
                const route = `${fromLocation} to ${toLocation}`.toLowerCase();
                return route.includes(searchQuery.route.toLowerCase());
            });
        }

        if (searchQuery.date) {
            filtered = filtered.filter(booking => {
                const journeyDate = getNestedProperty(booking, 'ticketInfo.date') || booking.journeyDate || booking.date || '';
                if (!journeyDate) return false;

                const formattedDate = formatDate(journeyDate).toLowerCase();
                return formattedDate.includes(searchQuery.date.toLowerCase());
            });
        }

        if (searchQuery.seats) {
            filtered = filtered.filter(booking => {
                const seats = getNestedProperty(booking, 'ticketInfo.selectedSeats') || booking.selectedSeats || [];
                const seatsStr = Array.isArray(seats) ? seats.join(', ') : seats.toString();
                return seatsStr.toLowerCase().includes(searchQuery.seats.toLowerCase());
            });
        }

        if (searchQuery.amount) {
            filtered = filtered.filter(booking => {
                const price = booking.price || getNestedProperty(booking, 'ticketInfo.totalPrice') || booking.totalPrice || 0;
                return price.toString().includes(searchQuery.amount);
            });
        }

        setFilteredBookings(filtered);
    };

    // Handle search input changes
    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        setSearchQuery(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle status filter change
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    // Handle date range filter change
    const handleDateRangeFilterChange = (e) => {
        setDateRangeFilter(e.target.value);
    };

    // Reset all filters
    const resetFilters = () => {
        setSearchQuery({
            bookingId: '',
            route: '',
            date: '',
            seats: '',
            amount: ''
        });
        setStatusFilter('all');
        setDateRangeFilter('all');
    };

    const handleViewInvoice = (ticketId) => {
        // Set verified payment info in localStorage for the invoice page to use
        localStorage.setItem('ticketId', ticketId);
        localStorage.setItem('paymentVerified', 'true');

        // Navigate to invoice page with required state
        navigate('/bus-tickets/invoice', {
            state: {
                ticketId,
                paymentVerified: true
            }
        });
    };

    // Helper function to format date string
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status color based on status
    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed':
            case 'paid':
                return 'bg-green-100 text-green-800';
            case 'canceled':
            case 'refunded':
            case 'pending':
            default:
                return 'bg-red-100 text-red-800';
        }
    };

    // Function to format the status display text
    const formatStatus = (status) => {
        switch (status) {
            case 'confirmed':
            case 'paid':
                return 'Success';
            case 'canceled':
            case 'refunded':
            case 'pending':
                return 'Failed';
            default:
                return 'Failed'; // Default to Failed
        }
    };

    // Function to safely get nested properties
    const getNestedProperty = (obj, path, defaultValue = 'N/A') => {
        const travel = path.split('.');
        let result = obj;

        for (const key of travel) {
            if (result === null || result === undefined || !result.hasOwnProperty(key)) {
                return defaultValue;
            }
            result = result[key];
        }

        return result || defaultValue;
    };

   
};

export default UserBookings; 