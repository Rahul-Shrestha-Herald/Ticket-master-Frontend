import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Modal,
  IconButton,
  TextField,
  MenuItem,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  ListItemText
} from '@mui/material';
import {
  FaEdit,
  FaTrash,
  FaPlusCircle,
  FaTimes,
  FaSearch
} from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import { useNavigate } from 'react-router-dom';
import OperatorLayout from '../../../../layout/operator/OperatorLayout';

const allSeats = [
  ...Array.from({ length: 18 }, (_, i) => `A${i + 1}`),
  ...Array.from({ length: 18 }, (_, i) => `B${i + 1}`),
  "19"
];

// --- Custom Component for Manual Seat Selection ---
const ManualSeatSelect = ({ label, value, onChange, onConfirm, onSelectAll }) => {
  const [open, setOpen] = useState(false);
  const selectedValue = Array.isArray(value) ? value : [];

  return (
    <FormControl fullWidth sx={{ mt: 2 }}>
      <InputLabel id={`${label}-label`}>{label}</InputLabel>
      <Select
        labelId={`${label}-label`}
        multiple
        value={selectedValue}
        onChange={onChange}
        label={label}
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        renderValue={(selected) =>
          Array.isArray(selected) ? selected.join(', ') : ''
        }
        MenuProps={{ PaperProps: { sx: { maxHeight: 300 } } }}
      >
        {allSeats.map((seat) => (
          <MenuItem key={seat} value={seat}>
            <Checkbox checked={selectedValue.indexOf(seat) > -1} />
            <ListItemText primary={seat} />
          </MenuItem>
        ))}
        {/* OK Button inside dropdown */}
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            onConfirm();
            setOpen(false);
          }}
          sx={{ backgroundColor: '#f5f5f5' }}
        >
          <Box sx={{ width: '100%', textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={(e) => {
                e.stopPropagation();
                onConfirm();
                setOpen(false);
              }}
            >
              OK
            </Button>
          </Box>
        </MenuItem>
      </Select>
      {/* "Select All Seats" as a separate button */}
      <Box mt={1}>
        <Button variant="outlined" onClick={onSelectAll} fullWidth>
          Select All Seats
        </Button>
      </Box>
    </FormControl>
  );
};
// --- End Custom Component ---

// Modal style
const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {
    xs: '90%',
    sm: '80%',
    md: 700
  },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: { xs: 2, sm: 3, md: 4 },
  maxHeight: '90vh',
  overflowY: 'auto',
  borderRadius: '4px'
};

const deleteModalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {
    xs: '90%',
    sm: '70%',
    md: 400
  },
  bgcolor: 'background.paper',
  p: { xs: 2, sm: 3, md: 4 },
  borderRadius: '4px'
};

const ManageSchedules = () => {
  const { backendUrl, operatorData } = useContext(OperatorAppContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busList, setBusList] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [deleteConfirmSchedule, setDeleteConfirmSchedule] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualFromDate, setManualFromDate] = useState('');
  const [manualToDate, setManualToDate] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [globalSeatConfirmed, setGlobalSeatConfirmed] = useState(false);
  const [perDateSeatConfirmed, setPerDateSeatConfirmed] = useState({});

  const [formData, setFormData] = useState({
    bus: '',
    route: '',
    scheduleDates: [],
    fromTime: '',
    toTime: '',
    pickupTimes: [],
    dropTimes: [],
    seatsType: 'all',
    seatConfigOption: 'global',
    globalAvailableSeats: allSeats,
    dateSeats: {}
  });

  const navigate = useNavigate();
  const handleClosePage = () => navigate(-1);

  const isUpcoming = (scheduleDates) => {
    const now = new Date();
    return scheduleDates.some(d => new Date(d) >= new Date(now.toDateString()));
  };

  // Fetch schedules
  const fetchSchedules = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/operator/schedules?filter=${filterType}`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      setSchedules(res.data);
    } catch (error) {
      toast.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  // Fetch buses
  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/operator/bus/buses`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      setBusList(res.data.filter(bus => bus.verified));
    } catch (error) {
      toast.error('Failed to fetch buses');
    }
  };

  // Fetch routes
  const fetchRoutesForOperator = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/operator/routes`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      setRoutes(res.data);
    } catch (error) {
      toast.error('Failed to fetch routes');
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchBuses();
    fetchRoutesForOperator();
  }, [backendUrl, operatorData, filterType]);

  // Filter schedules
  const filteredSchedules = schedules.filter(schedule => {
    const query = searchQuery.toLowerCase();
    const busName = schedule.bus?.busName?.toLowerCase() || '';
    const dateSearchMatch = schedule.scheduleDates.some(d =>
      new Date(d).toLocaleDateString().toLowerCase().includes(query)
    );
    const searchMatch = busName.includes(query) || dateSearchMatch;

    let overallDateMatch = true;
    if (dateFilter) {
      overallDateMatch = schedule.scheduleDates.some(d => {
        const dt = new Date(d);
        const now = new Date();
        if (dateFilter === 'today') return dt.toDateString() === now.toDateString();
        if (dateFilter === 'this week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6);
          return dt >= startOfWeek && dt <= endOfWeek;
        }
        if (dateFilter === 'this month') return dt.getMonth() === now.getMonth() && dt.getFullYear() === now.getFullYear();
        if (dateFilter === 'this year') return dt.getFullYear() === now.getFullYear();
        if (dateFilter === 'manual' && manualFromDate && manualToDate) {
          const from = new Date(manualFromDate);
          const to = new Date(manualToDate);
          return dt >= from && dt <= to;
        }
        return true;
      });
    }
    return searchMatch && overallDateMatch;
  });

  const busesWithRoutes = busList.filter(bus =>
    routes.some(route => route.bus && route.bus._id.toString() === bus._id.toString())
  );

  useEffect(() => {
    if (formData.bus) {
      const filtered = routes.filter(r => r.bus && r.bus._id.toString() === formData.bus.toString());
      setFilteredRoutes(filtered);
      if (filtered.length === 0) {
        toast.error('No route found for this bus. First add a route to create schedule.');
      }
    } else {
      setFilteredRoutes([]);
    }
  }, [formData.bus, routes]);

  const openModalForAdd = () => {
    setFormData({
      bus: '',
      route: '',
      scheduleDates: [],
      fromTime: '',
      toTime: '',
      pickupTimes: [],
      dropTimes: [],
      seatsType: 'all',
      seatConfigOption: 'global',
      globalAvailableSeats: allSeats,
      dateSeats: {}
    });
    setGlobalSeatConfirmed(false);
    setPerDateSeatConfirmed({});
    setSelectedDate('');
    setEditMode(false);
    setSelectedSchedule(null);
    setModalOpen(true);
  };

  const openModalForEdit = (schedule) => {
    if (!isUpcoming(schedule.scheduleDates)) {
      toast.error('Cannot edit past schedule.');
      return;
    }

    // Analyze seat configuration from database
    const seatDates = schedule.seats?.dates || {};
    const dates = Object.keys(seatDates);
    const isGlobalConfig = dates.length > 0 &&
      dates.every(date =>
        JSON.stringify(seatDates[date].available) === JSON.stringify(seatDates[dates[0]].available)
      );

    // Determine seatsType (all seats or manual)
    const isAllSeats = dates.length > 0 &&
      dates.every(date =>
        seatDates[date].available.length === allSeats.length &&
        seatDates[date].available.every(seat => allSeats.includes(seat))
      );

    setFormData({
      bus: schedule.bus?._id || '',
      route: schedule.route?._id || '',
      scheduleDates: schedule.scheduleDates.map(d => new Date(d).toISOString().split('T')[0]),
      fromTime: schedule.fromTime,
      toTime: schedule.toTime,
      pickupTimes: schedule.pickupTimes || [],
      dropTimes: schedule.dropTimes || [],
      seatsType: isAllSeats ? 'all' : 'manual',
      seatConfigOption: isGlobalConfig ? 'global' : 'perDate',
      globalAvailableSeats: isGlobalConfig && dates.length > 0
        ? seatDates[dates[0]].available
        : allSeats,
      dateSeats: Object.entries(seatDates).reduce((acc, [date, data]) => {
        acc[date] = data.available;
        return acc;
      }, {})
    });

    // Set confirmation states
    setGlobalSeatConfirmed(isGlobalConfig);
    setPerDateSeatConfirmed(
      Object.keys(seatDates).reduce((acc, date) => {
        acc[date] = true;
        return acc;
      }, {})
    );

    setSelectedSchedule(schedule);
    setEditMode(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedSchedule(null);
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const addDate = (dateToAdd) => {
    if (!dateToAdd) {
      toast.error('Please select a date.');
      return;
    }
    const today = new Date(new Date().toDateString());
    const selectedDate = new Date(dateToAdd);
    if (selectedDate < today) {
      toast.error('Cannot add a past date.');
      return;
    }
    if (!formData.scheduleDates.includes(dateToAdd)) {
      setFormData(prev => ({ ...prev, scheduleDates: [...prev.scheduleDates, dateToAdd] }));
    } else {
      toast.error('This date is already added.');
    }
  };

  const removeDate = (dateToRemove) => {
    const today = new Date(new Date().toDateString());
    const dateObj = new Date(dateToRemove);

    if (dateObj < today) {
      toast.error("Cannot remove past dates");
      return;
    }

    setFormData(prev => ({
      ...prev,
      scheduleDates: prev.scheduleDates.filter(date => date !== dateToRemove)
    }));
    setPerDateSeatConfirmed(prev => {
      const newState = { ...prev };
      delete newState[dateToRemove];
      return newState;
    });
    setFormData(prev => {
      const newDateSeats = { ...prev.dateSeats };
      delete newDateSeats[dateToRemove];
      return { ...prev, dateSeats: newDateSeats };
    });
  };

  const handleGlobalSeatConfirm = () => {
    if (formData.globalAvailableSeats.length === 0) {
      toast.error('Please select at least one seat.');
      return;
    }
    setGlobalSeatConfirmed(true);
    toast.success('Global seat selection confirmed.');
  };

  const handlePerDateSeatConfirm = (date) => {
    const seatsForDate = formData.dateSeats[date] || [];
    if (seatsForDate.length === 0) {
      toast.error(`Please select at least one seat for ${date}.`);
      return;
    }
    setPerDateSeatConfirmed(prev => ({ ...prev, [date]: true }));
    toast.success(`Seat selection for ${date} confirmed.`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.bus.trim() ||
      !formData.route.trim() ||
      formData.scheduleDates.length === 0 ||
      !formData.fromTime.trim() ||
      !formData.toTime.trim()
    ) {
      toast.error('Please fill in required fields.');
      return;
    }

    const selRoute = filteredRoutes.find(r => r._id === formData.route);
    if (selRoute?.pickupPoints?.length > 0) {
      for (let i = 0; i < selRoute.pickupPoints.length; i++) {
        if (!formData.pickupTimes[i]?.trim()) {
          toast.error(`Missing pickup time for ${selRoute.pickupPoints[i]}`);
          return;
        }
      }
    }
    if (selRoute?.dropPoints?.length > 0) {
      for (let i = 0; i < selRoute.dropPoints.length; i++) {
        if (!formData.dropTimes[i]?.trim()) {
          toast.error(`Missing drop time for ${selRoute.dropPoints[i]}`);
          return;
        }
      }
    }

    let seatsPayload = {};
    if (formData.seatsType === 'all') {
      const datesPayload = {};
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Preserve existing past dates
      if (editMode && selectedSchedule?.seats?.dates) {
        Object.entries(selectedSchedule.seats.dates).forEach(([date, seatData]) => {
          const dateObj = new Date(date);
          dateObj.setHours(0, 0, 0, 0);
          if (dateObj < today) {
            datesPayload[date] = seatData;
          }
        });
      }

      // Set all seats for upcoming dates
      formData.scheduleDates.forEach(date => {
        const dateObj = new Date(date);
        dateObj.setHours(0, 0, 0, 0);
        if (dateObj >= today) {
          datesPayload[date] = { available: allSeats, booked: [] };
        }
      });

      seatsPayload = { dates: datesPayload };
    } else {
      if (formData.seatConfigOption === 'global') {
        let datesPayload = {};
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (editMode && selectedSchedule?.seats?.dates) {
          Object.entries(selectedSchedule.seats.dates).forEach(([date, seatData]) => {
            const dateObj = new Date(date);
            dateObj.setHours(0, 0, 0, 0);
            if (dateObj < today) {
              datesPayload[date] = seatData;
            }
          });
        }

        formData.scheduleDates.forEach(date => {
          const dateObj = new Date(date);
          dateObj.setHours(0, 0, 0, 0);
          if (dateObj >= today) {
            const available = formData.globalAvailableSeats;
            const booked = allSeats.filter(seat => !available.includes(seat));
            datesPayload[date] = { available, booked };
          }
        });
        seatsPayload = { dates: datesPayload };
      } else if (formData.seatConfigOption === 'perDate') {
        let datesPayload = {};
        if (editMode && selectedSchedule?.seats?.dates) {
          datesPayload = { ...selectedSchedule.seats.dates };
        }
        for (const date of formData.scheduleDates) {
          const today = new Date(new Date().toDateString());
          const dateObj = new Date(date);
          if (dateObj < today) continue;
          if (!perDateSeatConfirmed[date]) {
            toast.error(`Confirm seats for ${date}`);
            return;
          }
          const available = formData.dateSeats[date] || [];
          const booked = allSeats.filter(seat => !available.includes(seat));
          datesPayload[date] = { available, booked };
        }
        seatsPayload = { dates: datesPayload };
      }
    }

    const payload = {
      bus: formData.bus,
      route: formData.route,
      scheduleDates: formData.scheduleDates,
      fromTime: formData.fromTime,
      toTime: formData.toTime,
      pickupTimes: formData.pickupTimes,
      dropTimes: formData.dropTimes,
      seats: seatsPayload
    };

    try {
      if (editMode && selectedSchedule) {
        await axios.put(`${backendUrl}/api/operator/schedules/${selectedSchedule._id}`, payload, {
          headers: { Authorization: `Bearer ${operatorData?.token}` }
        });
        toast.success('Schedule updated');
      } else {
        await axios.post(`${backendUrl}/api/operator/schedules`, payload, {
          headers: { Authorization: `Bearer ${operatorData?.token}` }
        });
        toast.success('Schedule added');
      }
      closeModal();
      fetchSchedules();
    } catch (error) {
      toast.error('Error saving schedule');
    }
  };

  // return (
  //   <OperatorLayout>
  //     <div className="p-2 sm:p-4 md:p-6">
  //       <div className="max-w-screen-2xl mx-auto p-2 sm:p-4 md:p-8">
  //         <Box className="bg-white rounded-2xl shadow-lg p-3 sm:p-5 md:p-8">
  //           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
  //             <Typography variant="h4" className="font-bold mb-3 sm:mb-0">Manage Bus Schedules</Typography>
  //             <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
  //               <Button
  //                 variant="contained"
  //                 color="primary"
  //                 onClick={openModalForAdd}
  //                 startIcon={<FaPlusCircle />}
  //                 fullWidth
  //                 className="sm:w-auto"
  //               >
  //                 Add New Schedule
  //               </Button>
  //               <button
  //                 onClick={handleClosePage}
  //                 className="p-2 text-red-600 hover:bg-gray-100 rounded-full transition-colors"
  //                 aria-label="Close"
  //               >
  //                 <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
  //               </button>
  //             </div>
  //           </div>
  //           <hr className="my-4 sm:my-8 md:my-14 border-gray-300" />

  //           <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
  //             <TextField
  //               label="Search by Bus Name"
  //               variant="outlined"
  //               size="small"
  //               className="w-full sm:w-auto sm:flex-1 min-w-0"
  //               value={searchQuery}
  //               onChange={(e) => setSearchQuery(e.target.value)}
  //               InputProps={{
  //                 startAdornment: (<InputAdornment position="start"><FaSearch /></InputAdornment>)
  //               }}
  //             />
  //             <div className="flex flex-wrap gap-3 w-full sm:w-auto">
  //               <FormControl variant="outlined" size="small" className="w-full xs:w-[150px] sm:w-[150px]">
  //                 <InputLabel>Date Filter</InputLabel>
  //                 <Select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} label="Date Filter">
  //                   <MenuItem value="">All Dates</MenuItem>
  //                   <MenuItem value="today">Today</MenuItem>
  //                   <MenuItem value="this week">This Week</MenuItem>
  //                   <MenuItem value="this month">This Month</MenuItem>
  //                   <MenuItem value="this year">This Year</MenuItem>
  //                   <MenuItem value="manual">Manual</MenuItem>
  //                 </Select>
  //               </FormControl>
  //               <FormControl variant="outlined" size="small" className="w-full xs:w-[150px] sm:w-[200px]">
  //                 <InputLabel>Filter Type</InputLabel>
  //                 <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Filter Type">
  //                   <MenuItem value="all">All Schedules</MenuItem>
  //                   <MenuItem value="upcoming">Upcoming Schedules</MenuItem>
  //                   <MenuItem value="previous">Previous Schedules</MenuItem>
  //                 </Select>
  //               </FormControl>
  //             </div>
  //           </div>

  //           {dateFilter === 'manual' && (
  //             <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 mb-6 sm:mb-8">
  //               <TextField
  //                 label="From Date"
  //                 type="date"
  //                 size="small"
  //                 value={manualFromDate}
  //                 onChange={(e) => {
  //                   const newFromDate = e.target.value;
  //                   if (manualToDate && new Date(newFromDate) > new Date(manualToDate)) {
  //                     toast.error('From Date cannot be after To Date');
  //                   } else {
  //                     setManualFromDate(newFromDate);
  //                   }
  //                 }}
  //                 InputLabelProps={{ shrink: true }}
  //                 className="w-full xs:w-[150px]"
  //               />
  //               <TextField
  //                 label="To Date"
  //                 type="date"
  //                 size="small"
  //                 value={manualToDate}
  //                 onChange={(e) => {
  //                   const newToDate = e.target.value;
  //                   if (manualFromDate && new Date(newToDate) < new Date(manualFromDate)) {
  //                     toast.error('To Date cannot be before From Date');
  //                   } else {
  //                     setManualToDate(newToDate);
  //                   }
  //                 }}
  //                 InputLabelProps={{ shrink: true }}
  //                 className="w-full xs:w-[150px]"
  //               />
  //             </div>
  //           )}
  //           <hr className="my-4 sm:my-6 md:my-8 border-gray-300" />

  //           {loading ? (
  //             <p>Loading schedules...</p>
  //           ) : schedules.length === 0 || filteredSchedules.length === 0 ? (
  //             <Typography variant="body1">No schedule data found.</Typography>
  //           ) : (
  //             <div className="grid gap-6 sm:gap-10 md:gap-14 grid-cols-1 md:grid-cols-2">
  //               {filteredSchedules.map(schedule => (
  //                 <div
  //                   key={schedule._id}
  //                   className="relative border rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-shadow bg-white min-h-[200px] sm:min-h-[300px] w-full max-w-full sm:max-w-[700px] mx-auto"
  //                 >
  //                   <Typography variant="body1" className="mb-2">
  //                     <strong>Bus:</strong> {schedule.bus?.busName || 'N/A'} {schedule.bus?.busNumber ? `(${schedule.bus.busNumber})` : ''}
  //                   </Typography>
  //                   <hr className="my-2 border-gray-300" />
  //                   <Typography variant="body1" className="mb-2">
  //                     <strong>Route:</strong> {schedule.route?.from || 'N/A'} → {schedule.route?.to || 'N/A'}
  //                   </Typography>
  //                   <hr className="my-2 border-gray-300" />
  //                   <Box className="mb-2">
  //                     <Typography variant="body1">
  //                       <strong>Schedule Dates:</strong>
  //                     </Typography>
  //                     <Box ml={2}>
  //                       <ul className="list-disc">
  //                         {schedule.scheduleDates.map((d, idx) => (
  //                           <li key={idx}>{new Date(d).toLocaleDateString()}</li>
  //                         ))}
  //                       </ul>
  //                     </Box>
  //                   </Box>
  //                   <hr className="my-2 border-gray-300" />
  //                   <Typography variant="body1" className="mb-2">
  //                     <strong>Departure at {schedule.route?.from || 'N/A'}:</strong> {schedule.fromTime}
  //                   </Typography>
  //                   <hr className="my-2 border-gray-300" />
  //                   <Typography variant="body1" className="mb-2">
  //                     <strong>Arrival at {schedule.route?.to || 'N/A'}:</strong> {schedule.toTime}
  //                   </Typography>
  //                   <hr className="my-2 border-gray-300" />
  //                   <Box className="mb-2">
  //                     <Typography variant="body1" className="mb-1">
  //                       <strong>Pickup Times:</strong>
  //                     </Typography>
  //                     <Box ml={2}>
  //                       <ul className="list-disc max-h-[100px] overflow-y-auto">
  //                         {schedule.pickupTimes && schedule.pickupTimes.map((time, idx) => (
  //                           <li key={idx}>
  //                             {schedule.route?.pickupPoints && schedule.route.pickupPoints[idx]
  //                               ? `${schedule.route.pickupPoints[idx]}: ${time}`
  //                               : time}
  //                           </li>
  //                         ))}
  //                       </ul>
  //                     </Box>
  //                   </Box>
  //                   <hr className="my-2 border-gray-300" />
  //                   <Box className="mb-2">
  //                     <Typography variant="body1" className="mb-1">
  //                       <strong>Drop Times:</strong>
  //                     </Typography>
  //                     <Box ml={2}>
  //                       <ul className="list-disc max-h-[100px] overflow-y-auto">
  //                         {schedule.dropTimes && schedule.dropTimes.map((time, idx) => (
  //                           <li key={idx}>
  //                             {schedule.route?.dropPoints && schedule.route.dropPoints[idx]
  //                               ? `${schedule.route.dropPoints[idx]}: ${time}`
  //                               : time}
  //                           </li>
  //                         ))}
  //                       </ul>
  //                     </Box>
  //                   </Box>
  //                   <hr className="my-2 border-gray-300" />
  //                   {schedule.seats?.dates && (
  //                     <Box className="mt-2">
  //                       <Typography variant="body1" className="mb-1">
  //                         <strong>Seat Configuration by Date:</strong>
  //                       </Typography>
  //                       <ul className="list-disc ml-4 max-h-[200px] overflow-y-auto">
  //                         {Object.entries(schedule.seats.dates).map(([date, seatData]) => (
  //                           <li key={date}>
  //                             <Typography variant="body1" className="font-bold">
  //                               {new Date(date).toLocaleDateString()}
  //                             </Typography>
  //                             <ul className="list-disc ml-6">
  //                               <li>
  //                                 <Typography variant="body2">
  //                                   <strong>Available ({seatData.available.length}):</strong>
  //                                 </Typography>
  //                                 <Typography variant="body2" className="text-xs sm:text-sm break-words">
  //                                   {seatData.available.join(', ')}
  //                                 </Typography>
  //                               </li>
  //                               <li>
  //                                 <Typography variant="body2">
  //                                   <strong>Booked ({seatData.booked.length}):</strong>
  //                                 </Typography>
  //                                 <Typography variant="body2" className="text-xs sm:text-sm break-words">
  //                                   {seatData.booked.join(', ')}
  //                                 </Typography>
  //                                 <hr className="my-2 border-gray-300" />
  //                               </li>
  //                             </ul>
  //                           </li>
  //                         ))}
  //                       </ul>
  //                     </Box>
  //                   )}
  //                   <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-4">
  //                     {isUpcoming(schedule.scheduleDates) && (
  //                       <>
  //                         <Button
  //                           variant="outlined"
  //                           size="small"
  //                           startIcon={<FaEdit />}
  //                           onClick={() => openModalForEdit(schedule)}
  //                           className="text-xs sm:text-sm"
  //                         >
  //                           Edit
  //                         </Button>
  //                         <Button
  //                           variant="contained"
  //                           size="small"
  //                           color="error"
  //                           startIcon={<FaTrash />}
  //                           onClick={() => setDeleteConfirmSchedule(schedule)}
  //                           className="text-xs sm:text-sm"
  //                         >
  //                           Delete
  //                         </Button>
  //                       </>
  //                     )}
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           )}

  //           <Modal open={modalOpen} onClose={closeModal}>
  //             <Box sx={modalStyle}>
  //               <div className="flex justify-between items-center mb-2 sm:mb-4">
  //                 <Typography variant="h5" className="text-lg sm:text-xl md:text-2xl">{editMode ? 'Edit Schedule' : 'Add New Schedule'}</Typography>
  //                 <IconButton onClick={closeModal}><FaTimes className="text-red-600" /></IconButton>
  //               </div>
  //               <div className="mt-1 text-xs sm:text-sm bg-amber-50 border border-amber-200 rounded p-2 mb-3">
  //                 <p className="flex items-center text-amber-700">
  //                   <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  //                   </svg>
  //                   Note: Only buses with at least one route are listed. If no bus appears, add a route for that bus first.
  //                 </p>
  //               </div>
  //               <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-4 mt-2 sm:mt-4">
  //                 <TextField select label="Select Bus" name="bus" value={formData.bus} onChange={handleInputChange} fullWidth>
  //                   {busesWithRoutes.length > 0 ? (
  //                     busesWithRoutes.map(bus => (
  //                       <MenuItem key={bus._id} value={bus._id}>
  //                         {bus.busName} ({bus.busNumber})
  //                       </MenuItem>
  //                     ))
  //                   ) : (
  //                     <MenuItem value="">No bus found</MenuItem>
  //                   )}
  //                 </TextField>
  //                 <TextField select label="Select Route" name="route" value={formData.route} onChange={handleInputChange} fullWidth>
  //                   {filteredRoutes.length > 0 ? (
  //                     filteredRoutes.map(route => (
  //                       <MenuItem key={route._id} value={route._id}>
  //                         {route.from} to {route.to}
  //                       </MenuItem>
  //                     ))
  //                   ) : (
  //                     <MenuItem value="">No route found for this bus</MenuItem>
  //                   )}
  //                 </TextField>
  //                 <Box className="flex flex-col xs:flex-row items-start xs:items-center gap-2">
  //                   <TextField
  //                     label="Select Date"
  //                     type="date"
  //                     value={selectedDate}
  //                     onChange={(e) => setSelectedDate(e.target.value)}
  //                     InputLabelProps={{ shrink: true }}
  //                     inputProps={{
  //                       min: new Date().toISOString().split('T')[0]
  //                     }}
  //                     fullWidth
  //                     className="xs:flex-1"
  //                   />
  //                   <Button
  //                     variant="contained"
  //                     color="primary"
  //                     size="medium"
  //                     onClick={() => { addDate(selectedDate); setSelectedDate(''); }}
  //                     className="w-full xs:w-auto mt-1 xs:mt-0"
  //                   >
  //                     Add Date
  //                   </Button>
  //                 </Box>
  //                 {formData.scheduleDates.length > 0 && (
  //                   <Box>
  //                     <Typography variant="subtitle1" className="mb-1">Schedule Dates:</Typography>
  //                     <ul className="list-disc ml-4 max-h-[150px] overflow-y-auto">
  //                       {formData.scheduleDates.map((date, idx) => {
  //                         const today = new Date(new Date().toDateString());
  //                         const dateObj = new Date(date);
  //                         const canDelete = dateObj >= today;
  //                         return (
  //                           <li key={idx} className="flex items-center">
  //                             <span>{date}</span>
  //                             {canDelete ? (
  //                               <IconButton size="small" onClick={() => removeDate(date)} className="ml-1">
  //                                 <FaTrash className="text-red-600 text-xs" />
  //                               </IconButton>
  //                             ) : (
  //                               <span className="ml-2 text-gray-500 text-xs">(Past date)</span>
  //                             )}
  //                           </li>
  //                         );
  //                       })}
  //                     </ul>
  //                   </Box>
  //                 )}

  //                 <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
  //                   <Typography variant="subtitle2" gutterBottom>Seat Selection</Typography>
  //                   <RadioGroup
  //                     row
  //                     name="seatsType"
  //                     value={formData.seatsType}
  //                     onChange={(e) => {
  //                       const newType = e.target.value;
  //                       setFormData(prev => ({
  //                         ...prev,
  //                         seatsType: newType,
  //                         globalAvailableSeats: newType === 'all' ? allSeats : [],
  //                         dateSeats: {}
  //                       }));
  //                       setGlobalSeatConfirmed(false);
  //                       setPerDateSeatConfirmed({});
  //                     }}
  //                   >
  //                     <FormControlLabel value="all" control={<Radio size="small" />} label={<Typography variant="body2">All Seats</Typography>} />
  //                     <FormControlLabel value="manual" control={<Radio size="small" />} label={<Typography variant="body2">Manual Selection</Typography>} />
  //                   </RadioGroup>
  //                 </FormControl>

  //                 {formData.seatsType === 'manual' && (
  //                   <FormControl component="fieldset" fullWidth sx={{ mt: 1 }}>
  //                     <Typography variant="subtitle2" gutterBottom>Seat Configuration</Typography>
  //                     <RadioGroup
  //                       row
  //                       name="seatConfigOption"
  //                       value={formData.seatConfigOption}
  //                       onChange={(e) => {
  //                         setFormData(prev => ({ ...prev, seatConfigOption: e.target.value }));
  //                         setGlobalSeatConfirmed(false);
  //                         setPerDateSeatConfirmed({});
  //                       }}
  //                     >
  //                       <FormControlLabel value="global" control={<Radio size="small" />} label={<Typography variant="body2">Same for All Dates</Typography>} />
  //                       <FormControlLabel value="perDate" control={<Radio size="small" />} label={<Typography variant="body2">Different for Each Date</Typography>} />
  //                     </RadioGroup>
  //                   </FormControl>
  //                 )}

  //                 {formData.seatsType === 'manual' && formData.seatConfigOption === 'global' && (
  //                   <ManualSeatSelect
  //                     label="Available Seats (Global)"
  //                     value={formData.globalAvailableSeats}
  //                     onChange={(e) => {
  //                       setFormData(prev => ({ ...prev, globalAvailableSeats: e.target.value }));
  //                       setGlobalSeatConfirmed(false);
  //                     }}
  //                     onConfirm={handleGlobalSeatConfirm}
  //                     onSelectAll={() => {
  //                       setFormData(prev => ({ ...prev, globalAvailableSeats: allSeats }));
  //                       setGlobalSeatConfirmed(true);
  //                       toast.success('All seats selected');
  //                     }}
  //                   />
  //                 )}

  //                 {formData.seatsType === 'manual' && formData.seatConfigOption === 'perDate' && (
  //                   <>
  //                     {formData.scheduleDates.map(date => {
  //                       const today = new Date(new Date().toDateString());
  //                       const dateObj = new Date(date);
  //                       if (dateObj < today) {
  //                         return (
  //                           <div key={date}>
  //                             <p>{date} (Past Date – Seat configuration not editable)</p>
  //                           </div>
  //                         );
  //                       }
  //                       return (
  //                         <ManualSeatSelect
  //                           key={date}
  //                           label={`Available Seats (${date})`}
  //                           value={formData.dateSeats[date] || []}
  //                           onChange={(e) => {
  //                             setFormData(prev => ({
  //                               ...prev,
  //                               dateSeats: { ...prev.dateSeats, [date]: e.target.value }
  //                             }));
  //                             setPerDateSeatConfirmed(prev => ({ ...prev, [date]: false }));
  //                           }}
  //                           onConfirm={() => handlePerDateSeatConfirm(date)}
  //                           onSelectAll={() => {
  //                             setFormData(prev => ({
  //                               ...prev,
  //                               dateSeats: { ...prev.dateSeats, [date]: allSeats }
  //                             }));
  //                             setPerDateSeatConfirmed(prev => ({ ...prev, [date]: true }));
  //                             toast.success(`All seats selected for ${date}`);
  //                           }}
  //                         />
  //                       );
  //                     })}
  //                   </>
  //                 )}

  //                 {formData.route && (() => {
  //                   const selRoute = filteredRoutes.find(r => r._id === formData.route);
  //                   if (selRoute) {
  //                     return (
  //                       <>
  //                         <Typography variant="subtitle2" className="mt-2"><strong>Departure at {selRoute.from}:</strong></Typography>
  //                         <TextField type="time" name="fromTime" value={formData.fromTime} onChange={handleInputChange} fullWidth InputLabelProps={{ shrink: true }} />
  //                         <Typography variant="subtitle2" className="mt-2"><strong>Arrival at {selRoute.to}:</strong></Typography>
  //                         <TextField type="time" name="toTime" value={formData.toTime} onChange={handleInputChange} fullWidth InputLabelProps={{ shrink: true }} />

  //                         <Box className="max-h-[200px] overflow-y-auto">
  //                           <Typography variant="subtitle2" className="mb-1">Pickup Times</Typography>
  //                           {selRoute.pickupPoints && selRoute.pickupPoints.length > 0 ? (
  //                             selRoute.pickupPoints.map((point, index) => (
  //                               <TextField
  //                                 key={index}
  //                                 label={`Pickup at ${point}`}
  //                                 type="time"
  //                                 value={formData.pickupTimes[index] || ''}
  //                                 onChange={(e) => {
  //                                   const newTimes = [...formData.pickupTimes];
  //                                   newTimes[index] = e.target.value;
  //                                   setFormData(prev => ({ ...prev, pickupTimes: newTimes }));
  //                                 }}
  //                                 fullWidth
  //                                 margin="dense"
  //                                 size="small"
  //                                 InputLabelProps={{ shrink: true }}
  //                               />
  //                             ))
  //                           ) : (
  //                             <Typography variant="body2">No pickup locations defined for this route.</Typography>
  //                           )}
  //                         </Box>

  //                         <Box className="max-h-[200px] overflow-y-auto">
  //                           <Typography variant="subtitle2" className="mb-1">Drop Times</Typography>
  //                           {selRoute.dropPoints && selRoute.dropPoints.length > 0 ? (
  //                             selRoute.dropPoints.map((point, index) => (
  //                               <TextField
  //                                 key={index}
  //                                 label={`Drop at ${point}`}
  //                                 type="time"
  //                                 value={formData.dropTimes[index] || ''}
  //                                 onChange={(e) => {
  //                                   const newTimes = [...formData.dropTimes];
  //                                   newTimes[index] = e.target.value;
  //                                   setFormData(prev => ({ ...prev, dropTimes: newTimes }));
  //                                 }}
  //                                 fullWidth
  //                                 margin="dense"
  //                                 size="small"
  //                                 InputLabelProps={{ shrink: true }}
  //                               />
  //                             ))
  //                           ) : (
  //                             <Typography variant="body2">No drop locations defined for this route.</Typography>
  //                           )}
  //                         </Box>
  //                       </>
  //                     );
  //                   }
  //                   return <Typography variant="body2">Select a route to see location details.</Typography>;
  //                 })()}
  //                 <Box className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-4 mt-4">
  //                   <Button
  //                     variant="outlined"
  //                     onClick={closeModal}
  //                     fullWidth
  //                     className="xs:w-auto"
  //                   >
  //                     Cancel
  //                   </Button>
  //                   <Button
  //                     variant="contained"
  //                     color="primary"
  //                     type="submit"
  //                     fullWidth
  //                     className="xs:w-auto"
  //                   >
  //                     {editMode ? 'Update Schedule' : 'Add Schedule'}
  //                   </Button>
  //                 </Box>
  //               </form>
  //             </Box>
  //           </Modal>

  //           <Modal open={Boolean(deleteConfirmSchedule)} onClose={() => setDeleteConfirmSchedule(null)}>
  //             <Box sx={deleteModalStyle}>
  //               {deleteConfirmSchedule && (() => {
  //                 const now = new Date(new Date().toDateString());
  //                 const scheduleDates = deleteConfirmSchedule.scheduleDates.map(d => new Date(d).toISOString().split('T')[0]);
  //                 const futureDates = scheduleDates.filter(d => new Date(d) >= now);
  //                 const pastDates = scheduleDates.filter(d => new Date(d) < now);

  //                 return (
  //                   <>
  //                     <Typography variant="h5" className="text-lg sm:text-xl mb-2">Delete Confirmation</Typography>
  //                     <Box className="mb-4 max-h-[300px] overflow-y-auto">
  //                       {futureDates.length > 0 ? (
  //                         <>
  //                           <Typography variant="body1" className="text-sm sm:text-base">
  //                             {pastDates.length > 0
  //                               ? "This schedule contains historical data. Delete only future dates:"
  //                               : "Delete entire schedule:"}
  //                           </Typography>
  //                           <Box ml={2} mt={1}>
  //                             <ul className="list-disc text-sm">
  //                               {futureDates.map((date, idx) => (
  //                                 <li key={idx}>{new Date(date).toLocaleDateString()}</li>
  //                               ))}
  //                             </ul>
  //                           </Box>
  //                           <Typography variant="body2" color="textSecondary" mt={1} className="text-xs sm:text-sm">
  //                             {pastDates.length > 0 && "Historical seat data for past dates will be preserved."}
  //                           </Typography>
  //                         </>
  //                       ) : (
  //                         <Typography variant="body1" className="text-sm sm:text-base">
  //                           This schedule only contains past dates and cannot be modified.
  //                         </Typography>
  //                       )}
  //                     </Box>
  //                     {futureDates.length > 0 && (
  //                       <Box className="flex flex-col xs:flex-row justify-end gap-2">
  //                         <Button
  //                           variant="outlined"
  //                           onClick={() => setDeleteConfirmSchedule(null)}
  //                           fullWidth
  //                           className="xs:w-auto"
  //                           size="small"
  //                         >
  //                           Cancel
  //                         </Button>
  //                         <Button
  //                           variant="contained"
  //                           color="error"
  //                           fullWidth
  //                           className="xs:w-auto"
  //                           size="small"
  //                           onClick={async () => {
  //                             try {
  //                               if (pastDates.length > 0) {
  //                                 // Preserve past dates and their seat data
  //                                 const updatedSeats = Object.fromEntries(
  //                                   Object.entries(deleteConfirmSchedule.seats.dates)
  //                                     .filter(([date]) => pastDates.includes(date))
  //                                 );

  //                                 // Update schedule to keep only past dates
  //                                 await axios.put(
  //                                   `${backendUrl}/api/operator/schedules/${deleteConfirmSchedule._id}`,
  //                                   {
  //                                     scheduleDates: pastDates,
  //                                     seats: {
  //                                       dates: updatedSeats
  //                                     }
  //                                   },
  //                                   {
  //                                     headers: { Authorization: `Bearer ${operatorData?.token}` }
  //                                   });
  //                                 toast.success('Future dates removed successfully');
  //                               } else {
  //                                 // Delete entire schedule if no past dates
  //                                 await axios.delete(
  //                                   `${backendUrl}/api/operator/schedules/${deleteConfirmSchedule._id}`,
  //                                   {
  //                                     headers: { Authorization: `Bearer ${operatorData?.token}` }
  //                                   });
  //                                 toast.success('Schedule deleted successfully');
  //                               }
  //                               setDeleteConfirmSchedule(null);
  //                               fetchSchedules();
  //                             } catch (error) {
  //                               toast.error(error.response?.data?.message || 'Deletion failed');
  //                             }
  //                           }}
  //                         >
  //                           Confirm Delete
  //                         </Button>
  //                       </Box>
  //                     )}
  //                   </>
  //                 );
  //               })()}
  //             </Box>
  //           </Modal>
  //         </Box>
  //       </div>
  //     </div>
  //   </OperatorLayout>
  // );
}

export default ManageSchedules;