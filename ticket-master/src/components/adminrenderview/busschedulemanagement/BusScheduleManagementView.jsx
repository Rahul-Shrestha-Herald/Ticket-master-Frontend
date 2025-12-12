import React, { useState, useEffect, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import {
  Button,
  Modal,
  Box,
  IconButton,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { FaTimes, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminAppContext } from '../../../context/AdminAppContext';

const AdminScheduleManagementView = () => {
  const { backendUrl, adminData } = useContext(AdminAppContext);
  const [schedules, setSchedules] = useState([]);
  const [localSchedules, setLocalSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(''); // "", "today", "this week", "this month", "this year", "manual"
  const [filterType, setFilterType] = useState('all'); // "all", "upcoming", "previous"
  const [manualFromDate, setManualFromDate] = useState('');
  const [manualToDate, setManualToDate] = useState('');

  // Modal states
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  // Fetch schedules from backend
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/admin/schedules`, {
        headers: { Authorization: `Bearer ${adminData?.token}` }
      });
      setSchedules(res.data);
      setLocalSchedules(res.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch schedules');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [backendUrl, adminData]);

  // Filtering logic: text search + date filter + filter type.
  const filteredSchedules = localSchedules.filter(schedule => {
    const query = searchQuery.toLowerCase();
    const busName = schedule.bus?.busName?.toLowerCase() || '';
    const from = schedule.route?.from?.toLowerCase() || '';
    const to = schedule.route?.to?.toLowerCase() || '';
    const dateQueryMatch = schedule.scheduleDates.some(date =>
      new Date(date).toLocaleDateString().toLowerCase().includes(query)
    );
    const searchMatch = busName.includes(query) || from.includes(query) || to.includes(query) || dateQueryMatch;

    let dateFilterMatch = true;
    if (dateFilter) {
      dateFilterMatch = schedule.scheduleDates.some(d => {
        const dt = new Date(d);
        const now = new Date();
        if (dateFilter === 'today') {
          return dt.toDateString() === now.toDateString();
        }
        if (dateFilter === 'this week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return dt >= startOfWeek && dt <= endOfWeek;
        }
        if (dateFilter === 'this month') {
          return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
        }
        if (dateFilter === 'this year') {
          return dt.getFullYear() === now.getFullYear();
        }
        if (dateFilter === 'manual') {
          if (manualFromDate && manualToDate) {
            const fromDate = new Date(manualFromDate);
            const toDate = new Date(manualToDate);
            return dt >= fromDate && dt <= toDate;
          }
          return true;
        }
        return true;
      });
    }

    let filterTypeMatch = true;
    if (filterType === 'upcoming') {
      filterTypeMatch = schedule.scheduleDates.some(d => new Date(d) >= new Date(new Date().toDateString()));
    } else if (filterType === 'previous') {
      filterTypeMatch = schedule.scheduleDates.every(d => new Date(d) < new Date(new Date().toDateString()));
    }
    return searchMatch && dateFilterMatch && filterTypeMatch;
  });

  // Define DataGrid columns.
  const columns = [
    {
      field: 'sno',
      headerName: 'S.No',
      width: 80,
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        return <span>{rowIndex}</span>;
      }
    },
    {
      field: 'busName',
      headerName: 'Bus Name',
      width: 200,
      renderCell: (params) => <span>{params.row.bus?.busName || 'N/A'}</span>
    },
    {
      field: 'route',
      headerName: 'Route',
      width: 300,
      renderCell: (params) => {
        const route = params.row.route;
        return route ? `${route.from} → ${route.to}` : 'N/A';
      }
    },
    {
      field: 'scheduleDates',
      headerName: 'Schedule Dates',
      flex: 1,
      minWidth: 250,
      renderCell: (params) => {
        const dates = params.row.scheduleDates;
        return dates.map(date => new Date(date).toLocaleDateString()).join(", ");
      }
    },
    {
      field: 'moreDetails',
      headerName: 'More Details',
      width: 150,
      renderCell: (params) => (
        <Button variant="contained" onClick={() => handleOpenDetailsModal(params.row)}>
          View More
        </Button>
      )
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 80,
      renderCell: (params) => (
        <IconButton onClick={() => openDeleteConfirmation(params.row)} color="error">
          <FaTrash />
        </IconButton>
      )
    }
  ];

  // Handle manual date validation.
  const handleFromDateChange = (e) => {
    const newFrom = e.target.value;
    if (manualToDate && new Date(newFrom) > new Date(manualToDate)) {
      toast.error("From date cannot be later than To date");
    } else {
      setManualFromDate(newFrom);
    }
  };

  const handleToDateChange = (e) => {
    const newTo = e.target.value;
    if (manualFromDate && new Date(manualFromDate) > new Date(newTo)) {
      toast.error("To date cannot be earlier than From date");
    } else {
      setManualToDate(newTo);
    }
  };

  const handleOpenDetailsModal = (schedule) => {
    setSelectedSchedule(schedule);
    setOpenDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setOpenDetailsModal(false);
    setSelectedSchedule(null);
  };

  const openDeleteConfirmation = (schedule) => {
    setScheduleToDelete(schedule);
    setOpenDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setScheduleToDelete(null);
  };

  const handleDeleteSchedule = async () => {
    try {
      await axios.delete(`${backendUrl}/api/admin/schedules/${scheduleToDelete._id}`, {
        headers: { Authorization: `Bearer ${adminData?.token}` }
      });
      setLocalSchedules(prev => prev.filter(s => s._id !== scheduleToDelete._id));
      toast.success('Schedule deleted successfully!');
      closeDeleteModal();
    } catch (error) {
      toast.error('Failed to delete schedule');
    }
  };

  // Updated Details Modal Content with Seat Configuration by Date added.
  const DetailsModalContent = ({ schedule }) => (
    <div>
      <div>
        <h3>Schedule Dates:</h3>
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '8px 0' }}>
          {schedule.scheduleDates.map((date, index) => (
            <li key={index}>{new Date(date).toLocaleDateString()}</li>
          ))}
        </ul>
      </div>
      <hr className="my-2 border-gray-300" />
      <div>
        <h3>Departure Time:</h3>
        <p>
          {schedule.route?.from} : {schedule.fromTime}
        </p>
      </div>
      <hr className="my-2 border-gray-300" />
      <div>
        <h3>Arrival Time:</h3>
        <p>
          {schedule.route?.to} : {schedule.toTime}
        </p>
      </div>
      <hr className="my-2 border-gray-300" />
      <div>
        <h3>Pickup Times:</h3>
        {schedule.pickupTimes?.length > 0 ? (
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '8px 0' }}>
            {schedule.pickupTimes.map((time, index) => (
              <li key={index}>
                {schedule.route?.pickupPoints?.[index] || `Point ${index + 1}`}: {time}
              </li>
            ))}
          </ul>
        ) : (
          <p>N/A</p>
        )}
      </div>
      <hr className="my-2 border-gray-300" />
      <div>
        <h3>Drop Times:</h3>
        {schedule.dropTimes?.length > 0 ? (
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px', margin: '8px 0' }}>
            {schedule.dropTimes.map((time, index) => (
              <li key={index}>
                {schedule.route?.dropPoints?.[index] || `Point ${index + 1}`}: {time}
              </li>
            ))}
          </ul>
        ) : (
          <p>N/A</p>
        )}
      </div>
      {/* Seat Configuration Section */}
      <hr className="my-2 border-gray-300" />
      <div>
        <h3>Seat Configuration by Date:</h3>
        {schedule.seats?.dates ? (
          Object.entries(schedule.seats.dates).map(([date, seatData], idx) => (
            <div key={idx} style={{ margin: '8px 0' }}>
              <h4 style={{ margin: 0 }}>{new Date(date).toLocaleDateString()}</h4>
              <p style={{ margin: '4px 0' }}>
                <strong>Available ({seatData.available.length}):</strong>
              </p>
              <p style={{ margin: '4px 0' }}>{seatData.available.join(', ')}</p>
              <p style={{ margin: '4px 0' }}>
                <strong>Booked ({seatData.booked.length}):</strong>
              </p>
              <p style={{ margin: '4px 0' }}>{seatData.booked.join(', ')}</p>
              <hr className="my-2 border-gray-300" />
            </div> 
          ))
        ) : (
          <p>N/A</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Filter Controls */}
      <div className="space-y-4 mb-8">
        {/* First Row of Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <TextField
            placeholder="Search by Bus Name, Route, or Date"
            variant="outlined"
            size="small"
            className="w-[645px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch />
                </InputAdornment>
              )
            }}
          />
          <FaFilter className="text-gray-500" />
          <FormControl variant="outlined" size="small" className="w-[150px]">
            <InputLabel>Date Filter</InputLabel>
            <Select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              label="Date Filter"
            >
              <MenuItem value="">All Dates</MenuItem>
              <MenuItem value="today">Today</MenuItem>
              <MenuItem value="this week">This Week</MenuItem>
              <MenuItem value="this month">This Month</MenuItem>
              <MenuItem value="this year">This Year</MenuItem>
              <MenuItem value="manual">Manual</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" size="small" className="w-[200px]">
            <InputLabel>Filter Type</InputLabel>
            <Select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              label="Filter Type"
            >
              <MenuItem value="all">All Schedules</MenuItem>
              <MenuItem value="upcoming">Upcoming Schedules</MenuItem>
              <MenuItem value="previous">Previous Schedules</MenuItem>
            </Select>
          </FormControl>
          <Button variant="contained" color="primary">
            Search
          </Button>
        </div>

        {/* Manual Date Picker Row - appears when manual is selected */}
        {dateFilter === 'manual' && (
          <div className="flex flex-wrap items-center gap-4">
            <TextField
              label="From Date"
              type="date"
              size="small"
              value={manualFromDate}
              onChange={handleFromDateChange}
              InputLabelProps={{ shrink: true }}
              className="min-w-[150px]"
            />
            <TextField
              label="To Date"
              type="date"
              size="small"
              value={manualToDate}
              onChange={handleToDateChange}
              InputLabelProps={{ shrink: true }}
              className="min-w-[150px]"
            />
          </div>
        )}
      </div>

      {/* DataGrid */}
      {loading ? (
        <p>Loading schedules...</p>
      ) : filteredSchedules.length === 0 ? (
        <p>No schedule data found.</p>
      ) : (
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredSchedules}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            getRowId={(row) => row._id}
          />
        </div>
      )}

      {/* Details Modal */}
      <Modal open={openDetailsModal} onClose={handleCloseDetailsModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 1,
            p: 3,
            maxHeight: '90vh',
            overflowY: 'auto'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Schedule Details</h2>
            <IconButton onClick={handleCloseDetailsModal} sx={{ color: '#dc2626' }}>
              <FaTimes />
            </IconButton>
          </div>
          <hr style={{ margin: '1rem 0' }} />
          {selectedSchedule && <DetailsModalContent schedule={selectedSchedule} />}
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={openDeleteModal} onClose={closeDeleteModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 1,
            p: 3
          }}
        >
          <h2 className="text-xl font-bold mb-4">Confirm Deletion</h2>
          <p>
            Are you sure you want to delete the schedule for bus{' '}
            <strong>{scheduleToDelete?.bus?.busName}</strong> on{' '}
            {scheduleToDelete?.scheduleDates.map((date, idx) => (
              <span key={idx}>
                {new Date(date).toLocaleDateString()}
                {idx !== scheduleToDelete.scheduleDates.length - 1 ? ', ' : ''}
              </span>
            ))}
            ?
          </p>
          <div className="mt-6 flex justify-end space-x-4">
            <Button variant="outlined" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDeleteSchedule}>
              Delete
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default AdminScheduleManagementView;
