import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AdminAppContext } from '../../../context/AdminAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { DataGrid } from '@mui/x-data-grid';
import DataFilter from './DataFilter';
import TableController from './TableController';
import {
    Box,
    Button,
    Modal,
    IconButton,
    Typography,
    CircularProgress,
    Chip
} from '@mui/material';
import { FaEye, FaTicketAlt, FaPrint, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';

// Modal style (consistent with other management pages)
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 700,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 0,
    maxHeight: '90vh',
    overflowY: 'auto',
    borderRadius: '8px'
};

const BookingManagementView = () => {
    const { backendUrl, adminData } = useContext(AdminAppContext);
    const [bookings, setBookings] = useState([]);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [busFilter, setBusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Advanced date filtering
    const [dateRangeType, setDateRangeType] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    // Debounce search
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

    // Use debounce for search input to prevent too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500); // 500ms debounce time

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Fetch bookings whenever filters change
    useEffect(() => {
        if (backendUrl && adminData) {
            fetchBookings();
        }
    }, [debouncedSearchQuery, statusFilter, busFilter, dateRangeType]);

    // Fetch bookings when date range is manually selected and both dates are set
    useEffect(() => {
        if (dateRangeType === 'manual' && fromDate && toDate && backendUrl && adminData) {
            fetchBookings();
        }
    }, [fromDate, toDate, dateRangeType]);

    useEffect(() => {
        fetchBuses();
        fetchBookings();
    }, [backendUrl, adminData]);

    const fetchBuses = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/admin/buses`, {
                headers: { Authorization: `Bearer ${adminData?.token}` }
            });
            setBuses(response.data || []);
        } catch (error) {
            console.error('Error fetching buses:', error);
            toast.error('Failed to fetch buses');
        }
    };

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const params = {};

            if (debouncedSearchQuery) params.search = debouncedSearchQuery;
            if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
            if (busFilter && busFilter !== 'all') params.busId = busFilter;

            // Handle date filtering based on dateRangeType
            if (dateRangeType !== 'all') {
                const now = new Date();

                if (dateRangeType === 'today') {
                    const today = new Date().toISOString().split('T')[0];
                    params.startDate = today;
                    params.endDate = today;
                }
                else if (dateRangeType === 'this_week') {
                    const startOfWeek = new Date(now);
                    startOfWeek.setDate(now.getDate() - now.getDay());
                    const endOfWeek = new Date(startOfWeek);
                    endOfWeek.setDate(startOfWeek.getDate() + 6);

                    params.startDate = startOfWeek.toISOString().split('T')[0];
                    params.endDate = endOfWeek.toISOString().split('T')[0];
                }
                else if (dateRangeType === 'this_month') {
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

                    params.startDate = startOfMonth.toISOString().split('T')[0];
                    params.endDate = endOfMonth.toISOString().split('T')[0];
                }
                else if (dateRangeType === 'upcoming') {
                    const today = new Date().toISOString().split('T')[0];
                    params.startDate = today;
                }
                else if (dateRangeType === 'manual' && fromDate && toDate) {
                    params.startDate = fromDate;
                    params.endDate = toDate;
                }
            }

            console.log('Fetching bookings with params:', params);

            try {
                const response = await axios.get(`${backendUrl}/api/admin/bookings`, {
                    params,
                    headers: { Authorization: `Bearer ${adminData?.token}` }
                });

                console.log('API Response:', response.data);

                // Log the first booking object to examine its structure
                if (response.data && response.data.bookings && response.data.bookings.length > 0) {
                    console.log('First booking object structure:', JSON.stringify(response.data.bookings[0], null, 2));
                }

                let bookingsData = [];

                if (response.data && Array.isArray(response.data)) {
                    // Handle case where API returns a direct array of bookings
                    bookingsData = response.data.map(booking => normalizeBookingData(booking));
                } else if (response.data && response.data.bookings && Array.isArray(response.data.bookings)) {
                    // Handle case where API returns an object with a bookings array
                    bookingsData = response.data.bookings.map(booking => normalizeBookingData(booking));
                } else if (response.data && typeof response.data === 'object') {
                    // Handle case where API returns a single booking or unexpected format
                    console.log('Unexpected response format, trying to extract bookings:', response.data);

                    // If it's a single booking, wrap it in an array
                    if (response.data._id || response.data.bookingId) {
                        const singleBooking = normalizeBookingData(response.data);
                        bookingsData = [singleBooking];
                    } else {
                        // Try to find an array property that might contain bookings
                        const possibleBookingsArray = Object.values(response.data).find(val => Array.isArray(val));
                        if (possibleBookingsArray) {
                            bookingsData = possibleBookingsArray.map(booking => normalizeBookingData(booking));
                        }
                    }
                }

                // If no data or empty array, show empty state
                if (bookingsData.length === 0) {
                    console.log('No booking data returned');
                }

                console.log('Final bookings data:', bookingsData);
                // Log one complete normalized booking object for debugging
                if (bookingsData.length > 0) {
                    console.log('First normalized booking:', JSON.stringify(bookingsData[0], null, 2));
                }
                setBookings(bookingsData);
            } catch (error) {
                console.error('Error fetching from API:', error);
                toast.error('Failed to fetch bookings from API');
                setBookings([]);
            }
        } catch (error) {
            console.error('Error in fetchBookings:', error);
            toast.error('Failed to process booking data');
            setBookings([]);
        } finally {
            setLoading(false);
        }
    };

    // Normalize booking data to ensure consistent structure
    const normalizeBookingData = (booking) => {
        if (!booking) return null;

        // Create a standardized booking object
        const normalized = {
            id: booking._id || booking.bookingId || booking.id || '',
            bookingId: booking.bookingId || booking._id || booking.id || '',
            passengerInfo: {
                name: 'Unknown Passenger',
                phone: 'N/A',
                email: 'N/A',
                alternatePhone: 'N/A'
            },
            ticketInfo: {
                busName: 'N/A',
                busNumber: 'N/A',
                fromLocation: 'N/A',
                toLocation: 'N/A',
                date: null,
                departureTime: 'N/A',
                arrivalTime: 'N/A',
                pickupPoint: 'N/A',
                dropPoint: 'N/A',
                selectedSeats: []
            },
            price: 0,
            status: 'pending',
            paymentStatus: 'unpaid'
        };

        // Fill in passenger info if available
        if (booking.passengerInfo) {
            normalized.passengerInfo = {
                ...normalized.passengerInfo,
                ...booking.passengerInfo
            };
        } else if (booking.passenger) {
            normalized.passengerInfo = {
                ...normalized.passengerInfo,
                name: booking.passenger.name || booking.passenger.fullName || normalized.passengerInfo.name,
                phone: booking.passenger.phone || booking.passenger.phoneNumber || normalized.passengerInfo.phone,
                email: booking.passenger.email || normalized.passengerInfo.email,
                alternatePhone: booking.passenger.alternatePhone || booking.passenger.altPhone || normalized.passengerInfo.alternatePhone
            };
        }

        // If there's a direct passenger name
        if (booking.passengerName) {
            normalized.passengerInfo.name = booking.passengerName;
        }

        // Fill in ticket info if available
        if (booking.ticketInfo) {
            normalized.ticketInfo = {
                ...normalized.ticketInfo,
                ...booking.ticketInfo
            };
        }

        // Handle bus details from different sources
        if (booking.bus) {
            normalized.ticketInfo.busName = booking.bus.name || booking.bus.busName || normalized.ticketInfo.busName;
            normalized.ticketInfo.busNumber = booking.bus.number || booking.bus.busNumber || normalized.ticketInfo.busNumber;
        }

        // Handle direct bus properties
        if (booking.busName) normalized.ticketInfo.busName = booking.busName;
        if (booking.busNumber) normalized.ticketInfo.busNumber = booking.busNumber;

        // Handle route details from different sources
        if (booking.route) {
            normalized.ticketInfo.fromLocation = booking.route.from || booking.route.fromLocation || normalized.ticketInfo.fromLocation;
            normalized.ticketInfo.toLocation = booking.route.to || booking.route.toLocation || normalized.ticketInfo.toLocation;
        }

        // Handle direct route properties
        if (booking.fromLocation) normalized.ticketInfo.fromLocation = booking.fromLocation;
        if (booking.toLocation) normalized.ticketInfo.toLocation = booking.toLocation;
        if (booking.from) normalized.ticketInfo.fromLocation = booking.from;
        if (booking.to) normalized.ticketInfo.toLocation = booking.to;

        // Handle date from different sources
        if (booking.date) normalized.ticketInfo.date = booking.date;
        if (booking.travelDate) normalized.ticketInfo.date = booking.travelDate;
        if (booking.journeyDate) normalized.ticketInfo.date = booking.journeyDate;

        // Handle price from different sources
        if (booking.price !== undefined) normalized.price = booking.price;
        if (booking.amount !== undefined) normalized.price = booking.amount;
        if (booking.totalAmount !== undefined) normalized.price = booking.totalAmount;
        if (booking.ticketInfo?.price !== undefined) normalized.price = booking.ticketInfo.price;

        // Handle status
        if (booking.status) normalized.status = booking.status;
        if (booking.paymentStatus) normalized.paymentStatus = booking.paymentStatus;

        // Preserve original fields that might be needed elsewhere
        return {
            ...booking,  // Keep original data
            ...normalized // Add normalized fields, potentially overwriting originals
        };
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle status filter change
    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    // Handle date range type change
    const handleDateRangeTypeChange = (e) => {
        setDateRangeType(e.target.value);

        // Reset manual date inputs if not selecting manual
        if (e.target.value !== 'manual') {
            setFromDate('');
            setToDate('');
        }
    };

    // Handle from date change
    const handleFromDateChange = (e) => {
        const newFromDate = e.target.value;

        // Validate from date is not after to date
        if (toDate && newFromDate > toDate) {
            toast.error('From date cannot be after To date');
            return;
        }

        setFromDate(newFromDate);
    };

    // Handle to date change
    const handleToDateChange = (e) => {
        const newToDate = e.target.value;

        // Validate to date is not before from date
        if (fromDate && newToDate < fromDate) {
            toast.error('To date cannot be before From date');
            return;
        }

        setToDate(newToDate);
    };

    // Handle bus filter change
    const handleBusFilterChange = (e) => {
        setBusFilter(e.target.value);
    };

    // This function is no longer needed as filters are applied automatically
    // Keep it for reference or remove it
    const handleApplyFilters = () => {
        // This is now handled by the useEffect hooks
        fetchBookings();
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setStatusFilter('all');
        setDateRangeType('all');
        setFromDate('');
        setToDate('');
        setBusFilter('all');
        // The useEffect will automatically trigger fetchBookings
    };

    const handleViewDetails = (booking) => {
        setSelectedBooking(booking);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelectedBooking(null);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Get status display with improved styling
    const getStatusDisplay = (params) => {
        if (!params?.row) return <Chip label="Unknown" color="default" size="small" />;

        const status = params.row.status;
        const paymentStatus = params.row.paymentStatus;

        if (status === 'confirmed' || paymentStatus === 'paid') {
            return <Chip label="Success" color="success" sx={{ backgroundColor: '#e6f7e9', color: '#2e7d32' }} size="small" />;
        } else if (status === 'canceled' || paymentStatus === 'refunded') {
            return <Chip label="Canceled" color="error" sx={{ backgroundColor: '#fde8e7', color: '#d32f2f' }} size="small" />;
        }
        return <Chip label="Failed" color="error" sx={{ backgroundColor: '#fde8e7', color: '#d32f2f' }} size="small" />;
    };

    // Handle viewing ticket/invoice
    const handleViewTicket = (bookingId) => {
        window.open(`/bus-tickets/invoice?bookingId=${bookingId}`, '_blank');
    };

    const columns = [
        {
            field: 'bookingId',
            headerName: 'Booking ID',
            width: 150,
            headerClassName: 'font-semibold',
            renderCell: (params) => {
                if (!params?.row) return <div>N/A</div>;
                return <div>{params.row.bookingId || params.row._id || params.row.id || 'N/A'}</div>;
            }
        },
        {
            field: 'passengerName',
            headerName: 'Passenger',
            width: 160,
            headerClassName: 'font-semibold',
            renderCell: (params) => {
                if (!params?.row) return <div>N/A</div>;

                // Try different possible paths to passenger name
                let passengerName = 'N/A';
                if (params.row.passengerInfo?.name) {
                    passengerName = params.row.passengerInfo.name;
                } else if (params.row.passenger?.name) {
                    passengerName = params.row.passenger.name;
                } else if (params.row.passengerName) {
                    passengerName = params.row.passengerName;
                } else if (params.row.name) {
                    passengerName = params.row.name;
                }

                return <div>{passengerName}</div>;
            }
        },
        {
            field: 'busDetails',
            headerName: 'Bus Details',
            width: 170,
            headerClassName: 'font-semibold',
            renderCell: (params) => {
                if (!params?.row) return <div>N/A</div>;

                // Try different possible paths to bus details
                let busName = 'N/A';
                let busNumber = 'N/A';

                if (params.row.ticketInfo) {
                    busName = params.row.ticketInfo.busName || busName;
                    busNumber = params.row.ticketInfo.busNumber || busNumber;
                }

                if (params.row.bus) {
                    busName = params.row.bus.busName || params.row.bus.name || busName;
                    busNumber = params.row.bus.busNumber || params.row.bus.number || busNumber;
                }

                if (params.row.busName) {
                    busName = params.row.busName;
                }

                if (params.row.busNumber) {
                    busNumber = params.row.busNumber;
                }

                return <div>{`${busName} (${busNumber})`}</div>;
            }
        },
        {
            field: 'route',
            headerName: 'Route',
            width: 180,
            headerClassName: 'font-semibold',
            renderCell: (params) => {
                if (!params?.row) return <div>N/A</div>;

                // Try different possible paths to route information
                let from = 'N/A';
                let to = 'N/A';

                if (params.row.ticketInfo) {
                    from = params.row.ticketInfo.fromLocation || from;
                    to = params.row.ticketInfo.toLocation || to;
                }

                if (params.row.route) {
                    from = params.row.route.from || params.row.route.fromLocation || from;
                    to = params.row.route.to || params.row.route.toLocation || to;
                }

                if (params.row.fromLocation) {
                    from = params.row.fromLocation;
                }

                if (params.row.toLocation) {
                    to = params.row.toLocation;
                }

                if (params.row.from) {
                    from = params.row.from;
                }

                if (params.row.to) {
                    to = params.row.to;
                }

                return <div>{`${from} → ${to}`}</div>;
            }
        },
        {
            field: 'travelDate',
            headerName: 'Travel Date',
            width: 130,
            headerClassName: 'font-semibold',
            renderCell: (params) => {
                if (!params?.row) return <div>N/A</div>;

                // Try different possible paths to travel date
                let dateValue = null;

                if (params.row.ticketInfo?.date) {
                    dateValue = params.row.ticketInfo.date;
                }

                if (params.row.travelDate) {
                    dateValue = params.row.travelDate;
                }

                if (params.row.date) {
                    dateValue = params.row.date;
                }

                if (params.row.journeyDate) {
                    dateValue = params.row.journeyDate;
                }

                return <div>{dateValue ? formatDate(dateValue) : 'N/A'}</div>;
            }
        },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 110,
            headerClassName: 'font-semibold',
            renderCell: (params) => {
                if (!params?.row) return <div>NPR 0</div>;

                // Try different possible paths to amount
                let amount = 0;

                if (params.row.price !== undefined) {
                    amount = params.row.price;
                }

                if (params.row.amount !== undefined) {
                    amount = params.row.amount;
                }

                if (params.row.totalAmount !== undefined) {
                    amount = params.row.totalAmount;
                }

                if (params.row.ticketInfo?.price !== undefined) {
                    amount = params.row.ticketInfo.price;
                }

                return <div>{`NPR ${amount}`}</div>;
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            headerClassName: 'font-semibold',
            renderCell: getStatusDisplay
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200, // Increased width to accommodate multiple buttons
            headerClassName: 'font-semibold',
            sortable: false,
            renderCell: (params) => {
                if (!params?.row) return null;

                const isSuccessful = params.row.status === 'confirmed' || params.row.paymentStatus === 'paid';

                return (
                    <div className="flex space-x-2">
                        <Button
                            variant="text"
                            color="primary"
                            size="small"
                            startIcon={<FaEye />}
                            onClick={() => handleViewDetails(params.row)}
                        >
                            Details
                        </Button>

                        {isSuccessful && (
                            <IconButton
                                color="primary"
                                size="small"
                                onClick={() => handleViewTicket(params.row.bookingId || params.row._id)}
                                sx={{ color: '#e53e3e' }}
                                title="View Ticket"
                            >
                                <FaTicketAlt />
                            </IconButton>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold mb-4">Booking Management</h2>

                <DataFilter
                    searchQuery={searchQuery}
                    onSearchChange={handleSearchChange}
                    statusFilter={statusFilter}
                    onStatusFilterChange={handleStatusFilterChange}
                    busFilter={busFilter}
                    onBusFilterChange={handleBusFilterChange}
                    buses={buses}
                    onResetFilters={handleResetFilters}
                    filterOptions={[
                        { value: 'all', label: 'All Statuses' },
                        { value: 'success', label: 'Success' },
                        { value: 'failed', label: 'Failed' }
                    ]}
                    dateRangeType={dateRangeType}
                    onDateRangeTypeChange={handleDateRangeTypeChange}
                    fromDate={fromDate}
                    onFromDateChange={handleFromDateChange}
                    toDate={toDate}
                    onToDateChange={handleToDateChange}
                />

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <LoadingSpinner />
                    </div>
                ) : (
                    <div className="h-[600px] w-full mt-6">
                        <DataGrid
                            rows={bookings}
                            columns={columns}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 10, page: 0 },
                                },
                                columns: {
                                    columnVisibilityModel: {
                                        bookingId: true,
                                        passengerName: true,
                                        busDetails: true,
                                        route: true,
                                        travelDate: true,
                                        amount: true,
                                        status: true,
                                        actions: true
                                    }
                                }
                            }}
                            pageSizeOptions={[5, 10, 25, 50, 100]}
                            checkboxSelection={false}
                            disableRowSelectionOnClick
                            loading={loading}
                            getRowHeight={() => 'auto'}
                            slots={{
                                noRowsOverlay: () => (
                                    <div className="flex flex-col items-center justify-center h-full py-8">
                                        <FaTicketAlt className="text-gray-300 text-5xl mb-4" />
                                        <p className="text-gray-500">No bookings found</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {searchQuery || statusFilter !== 'all' || dateRangeType !== 'all' || busFilter !== 'all'
                                                ? 'Try adjusting your search filters'
                                                : 'Bookings will appear here when available'}
                                        </p>
                                    </div>
                                )
                            }}
                            sx={{
                                '& .MuiDataGrid-row': {
                                    minHeight: '60px !important',
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                '& .MuiDataGrid-cell': {
                                    padding: '8px',
                                    fontSize: '0.9rem',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                    display: 'flex',
                                    alignItems: 'center'
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    backgroundColor: '#f8fafc',
                                    fontWeight: 'bold'
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Booking Details Modal */}
            <Modal
                open={modalOpen}
                onClose={closeModal}
                aria-labelledby="booking-details-modal"
            >
                <Box sx={modalStyle}>
                    {selectedBooking && (
                        <>
                            {/* Modal Header */}
                            <div className="bg-primary text-white p-4 rounded-t-lg relative">
                                <div className="flex justify-between items-center">
                                    <Typography variant="h6" component="h2" className="font-bold">
                                        Booking Details
                                    </Typography>
                                    <IconButton
                                        onClick={closeModal}
                                        size="small"
                                        sx={{
                                            color: 'white',
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            backgroundColor: 'rgba(255,255,255,0.2)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255,255,255,0.3)'
                                            }
                                        }}
                                    >
                                        <FaTimes />
                                    </IconButton>
                                </div>

                                <div className="mt-2 flex items-center">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full mr-2 
                                      ${selectedBooking.status === 'confirmed' || selectedBooking.paymentStatus === 'paid'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'}`}
                                    >
                                        {selectedBooking.status === 'confirmed' || selectedBooking.paymentStatus === 'paid'
                                            ? 'Success'
                                            : selectedBooking.status === 'canceled' ? 'Canceled' : 'Failed'}
                                    </span>
                                    <div className="text-sm opacity-90">Booking ID: {selectedBooking.bookingId}</div>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Main Booking Info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div>
                                        <p className="text-xs text-gray-500">Booking Date</p>
                                        <p className="text-sm font-medium">{formatDate(selectedBooking.bookingDate || selectedBooking.createdAt)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Travel Date</p>
                                        <p className="text-sm font-medium">{formatDate(selectedBooking.ticketInfo?.date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Amount</p>
                                        <p className="text-sm font-semibold text-primary">NPR {selectedBooking.price || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Payment Status</p>
                                        <p className="text-sm font-medium">
                                            {selectedBooking.paymentStatus === 'paid' ? (
                                                <span className="text-green-600">Paid</span>
                                            ) : (
                                                <span className="text-red-600">{selectedBooking.paymentStatus || 'Pending'}</span>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                {/* Passenger Information */}
                                <div className="mb-6">
                                    <h3 className="text-base font-semibold mb-2 flex items-center">
                                        <FaTicketAlt className="mr-2 text-primary" />
                                        Passenger Information
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Name</p>
                                                <p className="text-sm">{selectedBooking.passengerInfo?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Phone</p>
                                                <p className="text-sm">{selectedBooking.passengerInfo?.phone || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Email</p>
                                                <p className="text-sm break-all">{selectedBooking.passengerInfo?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Alt. Phone</p>
                                                <p className="text-sm">{selectedBooking.passengerInfo?.alternatePhone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bus & Route Details */}
                                <div className="mb-6">
                                    <h3 className="text-base font-semibold mb-2 flex items-center">
                                        <FaTicketAlt className="mr-2 text-primary" />
                                        Bus & Route Details
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Bus Name</p>
                                                <p className="text-sm">{selectedBooking.ticketInfo?.busName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Bus Number</p>
                                                <p className="text-sm">{selectedBooking.ticketInfo?.busNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">From</p>
                                                <p className="text-sm">{selectedBooking.ticketInfo?.fromLocation || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">To</p>
                                                <p className="text-sm">{selectedBooking.ticketInfo?.toLocation || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Pickup Point</p>
                                                <p className="text-sm">{selectedBooking.ticketInfo?.pickupPoint || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Drop Point</p>
                                                <p className="text-sm">{selectedBooking.ticketInfo?.dropPoint || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Departure Time</p>
                                                <p className="text-sm">{selectedBooking.ticketInfo?.departureTime || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Arrival Time</p>
                                                <p className="text-sm">{selectedBooking.ticketInfo?.arrivalTime || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Seat Details */}
                                <div className="mb-6">
                                    <h3 className="text-base font-semibold mb-2 flex items-center">
                                        <FaTicketAlt className="mr-2 text-primary" />
                                        Seat Details
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <p className="text-sm">
                                            {selectedBooking.ticketInfo?.selectedSeats
                                                ? Array.isArray(selectedBooking.ticketInfo.selectedSeats)
                                                    ? selectedBooking.ticketInfo.selectedSeats.join(', ')
                                                    : selectedBooking.ticketInfo.selectedSeats
                                                : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="flex justify-end mt-4">
                                    {(selectedBooking.status === 'confirmed' || selectedBooking.paymentStatus === 'paid') && (
                                        <Button
                                            variant="contained"
                                            startIcon={<FaTicketAlt />}
                                            onClick={() => handleViewTicket(selectedBooking.bookingId || selectedBooking._id)}
                                            sx={{
                                                backgroundColor: '#e53e3e',
                                                '&:hover': { backgroundColor: '#c53030' },
                                                paddingLeft: '16px',
                                                paddingRight: '16px'
                                            }}
                                        >
                                            View Ticket
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </Box>
            </Modal>
        </div>
    );
};

export default BookingManagementView; 