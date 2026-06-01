import React, { useState, useEffect, useContext } from 'react';
import { UserAppContext } from '../../../context/UserAppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import { FaEye, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
    
    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [paginatedBookings, setPaginatedBookings] = useState([]);

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

    // Apply pagination whenever filtered bookings or page changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        setPaginatedBookings(filteredBookings.slice(startIndex, endIndex));
    }, [filteredBookings, currentPage, itemsPerPage]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, dateRangeFilter]);

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
        setCurrentPage(1);
    };

    // Pagination handlers
    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('...');
                pages.push(totalPages);
            }
        }
        
        return pages;
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

    return (
        <div className="min-h-screen bg-gray-50 pt-[8vh]">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">My Bookings</h1>
                    <p className="text-gray-600">View and manage all your bus ticket bookings</p>
                </div>

                    {/* Filters Section */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                                <FaFilter className="mr-2" /> Filters
                            </h2>
                            <button
                                onClick={resetFilters}
                                className="text-sm text-primary hover:text-primary/80 font-medium"
                            >
                                Reset All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="success">Success</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                <select
                                    value={dateRangeFilter}
                                    onChange={handleDateRangeFilterChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Booking ID</label>
                                <input
                                    type="text"
                                    name="bookingId"
                                    value={searchQuery.bookingId}
                                    onChange={handleSearchChange}
                                    placeholder="Enter booking ID..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Route</label>
                                <input
                                    type="text"
                                    name="route"
                                    value={searchQuery.route}
                                    onChange={handleSearchChange}
                                    placeholder="e.g., Kathmandu to Pokhara"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Date</label>
                                <input
                                    type="text"
                                    name="date"
                                    value={searchQuery.date}
                                    onChange={handleSearchChange}
                                    placeholder="e.g., Jan 15, 2024"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Search Seats</label>
                                <input
                                    type="text"
                                    name="seats"
                                    value={searchQuery.seats}
                                    onChange={handleSearchChange}
                                    placeholder="e.g., A1, A2"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Bookings List */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : error ? (
                        <div className="bg-red-50 text-red-600 p-6 rounded-lg text-center">
                            <p>{error}</p>
                        </div>
                    ) : filteredBookings.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-md p-12 text-center">
                            <FaSearch className="text-6xl text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Bookings Found</h3>
                            <p className="text-gray-500 mb-6">
                                {bookings.length === 0
                                    ? "You haven't made any bookings yet."
                                    : "No bookings match your search criteria."}
                            </p>
                            {bookings.length === 0 && (
                                <button
                                    onClick={() => navigate('/bus-tickets')}
                                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    Book Your First Ticket
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Results info and items per page selector */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <p className="text-sm text-gray-600">
                                    Showing {filteredBookings.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} booking(s)
                                </p>
                                
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm text-gray-600">Show:</label>
                                    <select
                                        value={itemsPerPage}
                                        onChange={handleItemsPerPageChange}
                                        className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                        <option value={100}>100</option>
                                    </select>
                                    <span className="text-sm text-gray-600">per page</span>
                                </div>
                            </div>

                            {/* Bookings list */}
                            {paginatedBookings.map((booking) => {
                                const status = booking.paymentStatus || booking.status || 'pending';
                                const fromLocation = getNestedProperty(booking, 'ticketInfo.fromLocation') || booking.fromLocation;
                                const toLocation = getNestedProperty(booking, 'ticketInfo.toLocation') || booking.toLocation;
                                const busName = getNestedProperty(booking, 'ticketInfo.busName') || booking.busName;
                                const journeyDate = getNestedProperty(booking, 'ticketInfo.date') || booking.journeyDate || booking.date;
                                const selectedSeats = getNestedProperty(booking, 'ticketInfo.selectedSeats') || booking.selectedSeats || [];
                                const price = booking.price || getNestedProperty(booking, 'ticketInfo.totalPrice') || booking.totalPrice;
                                const bookingId = booking.bookingId || booking._id;

                                return (
                                    <div key={booking._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h3 className="text-lg font-semibold text-gray-800">{busName}</h3>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                                                        {formatStatus(status)}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Route</p>
                                                        <p className="font-medium text-gray-800">{fromLocation} → {toLocation}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Journey Date</p>
                                                        <p className="font-medium text-gray-800">{formatDate(journeyDate)}</p>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Seats</p>
                                                        <p className="font-medium text-gray-800">
                                                            {Array.isArray(selectedSeats) ? selectedSeats.join(', ') : selectedSeats}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                                                        <p className="font-medium text-gray-800">NPR {price}</p>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-gray-500">Booking ID: {bookingId}</p>
                                            </div>

                                            <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                                                <button
                                                    onClick={() => handleViewInvoice(booking._id)}
                                                    className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                                >
                                                    <FaEye className="mr-2" /> View Invoice
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </p>
                                    
                                    <div className="flex items-center space-x-2">
                                        {/* Previous button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className={`px-3 py-2 rounded-lg flex items-center space-x-1 ${
                                                currentPage === 1
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <FaChevronLeft className="text-xs" />
                                            <span className="text-sm">Previous</span>
                                        </button>
                                        
                                        {/* Page numbers */}
                                        <div className="hidden sm:flex items-center space-x-1">
                                            {getPageNumbers().map((page, index) => (
                                                page === '...' ? (
                                                    <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                                                        ...
                                                    </span>
                                                ) : (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={`px-3 py-2 rounded-lg text-sm ${
                                                            currentPage === page
                                                                ? 'bg-primary text-white'
                                                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                        
                                        {/* Next button */}
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className={`px-3 py-2 rounded-lg flex items-center space-x-1 ${
                                                currentPage === totalPages
                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                            }`}
                                        >
                                            <span className="text-sm">Next</span>
                                            <FaChevronRight className="text-xs" />
                                        </button>
                                    </div>
                                    
                                    {/* Mobile page selector */}
                                    <div className="sm:hidden flex items-center space-x-2">
                                        <label className="text-sm text-gray-600">Go to page:</label>
                                        <select
                                            value={currentPage}
                                            onChange={(e) => handlePageChange(Number(e.target.value))}
                                            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                                        >
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                <option key={page} value={page}>
                                                    {page}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
            </div>
        </div>
    );
   
};

export default UserBookings; 