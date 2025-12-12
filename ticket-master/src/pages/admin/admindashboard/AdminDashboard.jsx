// import React, { useContext, useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { AdminAppContext } from '../../../context/AdminAppContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { FaUsers, FaUserPlus } from 'react-icons/fa';
// import { FiLogOut } from 'react-icons/fi';
// import { DataGrid } from '@mui/x-data-grid';
// import { Select, MenuItem } from '@mui/material';
// import UserManagementView from '../../../components/adminrenderview/usermanagement/UserManagementView';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const { backendUrl, setIsAdminLoggedin, adminData, setSuppressUnauthorizedToast } = useContext(AdminAppContext);

//   const [activeView, setActiveView] = useState('users');
//   const [selectedTable, setSelectedTable] = useState('users');
//   const [searchQuery, setSearchQuery] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');

//   const [users, setUsers] = useState([]);
//   const [operators, setOperators] = useState([]);

//   const handleLogout = async () => {
//     try {
//       await axios.post(`${backendUrl}/api/admin/auth/logout`);
//       setIsAdminLoggedin(false);
//       setSuppressUnauthorizedToast(true);
//       toast.success("Logged out successfully!");
//       navigate('/admin/login');
//     } catch (error) {
//       toast.error(error.message);
//     }
//   };

//   const handleSignup = () => navigate('/admin/register');

//   // Fetch Users & Operators
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const endpoint =
//           selectedTable === 'users'
//             ? `${backendUrl}/api/admin/users`
//             : `${backendUrl}/api/admin/operators`;

//         const response = await axios.get(endpoint, {
//           params: {
//             search: searchQuery,
//             status: statusFilter === 'all' ? null : statusFilter,
//           },
//           headers: { Authorization: `Bearer ${adminData?.token}` },
//         });

//         selectedTable === 'users'
//           ? setUsers(response.data)
//           : setOperators(response.data);
//       } catch (error) {
//         toast.error('Failed to load data');
//       }
//     };

//     fetchData();
//   }, [selectedTable, searchQuery, statusFilter]);

//   // Block / Unblock
//   const handleStatusChange = async (id, type, status) => {
//     try {
//       const isBlocked = status === 'blocked';
//       const endpoint =
//         type === 'user'
//           ? `${backendUrl}/api/admin/users/${id}/blocked`
//           : `${backendUrl}/api/admin/operators/${id}/status`;

//       await axios.put(
//         endpoint,
//         { isBlocked },
//         { headers: { Authorization: `Bearer ${adminData?.token}` } }
//       );

//       if (type === 'user') {
//         setUsers(users.map(u => (u._id === id ? { ...u, isBlocked } : u)));
//       } else {
//         setOperators(operators.map(o => (o._id === id ? { ...o, isBlocked } : o)));
//       }

//       toast.success('Status updated');
//     } catch {
//       toast.error('Failed to update status');
//     }
//   };

//   // Verify / Unverify Operator
//   const handleVerificationChange = async (id, status) => {
//     try {
//       const isAccountVerified = status === 'verified';

//       await axios.put(
//         `${backendUrl}/api/admin/operators/${id}/status`,
//         { isAccountVerified },
//         { headers: { Authorization: `Bearer ${adminData?.token}` } }
//       );

//       setOperators(operators.map(op =>
//         op._id === id ? { ...op, isAccountVerified } : op
//       ));

//       toast.success('Verification updated');
//     } catch {
//       toast.error('Failed to update verification');
//     }
//   };

//   const userColumns = [
//     { field: 'name', headerName: 'Name', width: 250 },
//     { field: 'email', headerName: 'Email', width: 350 },
//     {
//       field: 'isAccountVerified',
//       headerName: 'Verified',
//       width: 150,
//       renderCell: (params) => (
//         <span className={params.value ? 'text-green-600' : 'text-red-600'}>
//           {params.value ? 'Verified' : 'Unverified'}
//         </span>
//       )
//     },
//     {
//       field: 'isBlocked',
//       headerName: 'Status',
//       width: 150,
//       renderCell: (params) => (
//         <Select
//           value={params.value ? 'blocked' : 'active'}
//           onChange={(e) => handleStatusChange(params.row._id, 'user', e.target.value)}
//         >
//           <MenuItem value="active">Active</MenuItem>
//           <MenuItem value="blocked">Blocked</MenuItem>
//         </Select>
//       )
//     }
//   ];

//   const operatorColumns = [
//     { field: 'name', headerName: 'Name', width: 200 },
//     { field: 'email', headerName: 'Email', width: 300 },
//     {
//       field: 'isAccountVerified',
//       headerName: 'Verification',
//       width: 150,
//       renderCell: (params) => (
//         <Select
//           value={params.value ? 'verified' : 'unverified'}
//           onChange={(e) => handleVerificationChange(params.row._id, e.target.value)}
//         >
//           <MenuItem value="verified">Verified</MenuItem>
//           <MenuItem value="unverified">Unverified</MenuItem>
//         </Select>
//       )
//     },
//     {
//       field: 'isBlocked',
//       headerName: 'Status',
//       width: 150,
//       renderCell: (params) => (
//         <Select
//           value={params.value ? 'blocked' : 'active'}
//           onChange={(e) => handleStatusChange(params.row._id, 'operator', e.target.value)}
//         >
//           <MenuItem value="active">Active</MenuItem>
//           <MenuItem value="blocked">Blocked</MenuItem>
//         </Select>
//       )
//     }
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <div className="fixed inset-y-0 w-64 bg-white shadow p-4">
//         <h2 className="text-xl font-bold">Admin Panel</h2>
//         <p className="text-sm text-gray-600 mt-1">Welcome, {adminData?.name}</p>

//         <div className="mt-6 space-y-2">
//           <button
//             onClick={() => {
//               setActiveView('users');
//               setSelectedTable('users');
//             }}
//             className="w-full text-left px-3 py-2 rounded hover:bg-blue-100"
//           >
//             Users
//           </button>

//           <button
//             onClick={() => {
//               setActiveView('users');
//               setSelectedTable('operators');
//             }}
//             className="w-full text-left px-3 py-2 rounded hover:bg-blue-100"
//           >
//             Operators
//           </button>
//         </div>
//       </div>

//       {/* Main */}
//       <div className="pl-64">
//         <header className="bg-white p-4 flex justify-between items-center shadow">
//           <div className="text-xl font-bold">Admin Dashboard</div>

//           <div className="flex gap-3">
//             <button
//               onClick={handleSignup}
//               className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
//             >
//               <FaUserPlus className="mr-2" /> Create Admin
//             </button>

//             <button
//               onClick={handleLogout}
//               className="bg-red-100 text-red-600 px-4 py-2 rounded flex items-center"
//             >
//               Logout <FiLogOut className="ml-2" />
//             </button>
//           </div>
//         </header>

//         <main className="p-6">
//           <UserManagementView
//             selectedTable={selectedTable}
//             columns={selectedTable === 'users' ? userColumns : operatorColumns}
//             rows={selectedTable === 'users' ? users : operators}
//             searchQuery={searchQuery}
//             statusFilter={statusFilter}
//             onSearchChange={(e) => setSearchQuery(e.target.value)}
//             onFilterChange={(e) => setStatusFilter(e.target.value)}
//             onTableChange={(e) => setSelectedTable(e.target.value)}
//           />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;


import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminAppContext } from '../../../context/AdminAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { IoBus } from 'react-icons/io5';
import {
  FaChartBar,
  FaUsers,
  FaTicketAlt,
  FaUserPlus,
  FaMap,
  FaClock,
  FaQuestionCircle,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaArrowRight
} from 'react-icons/fa';
import { FiLogOut } from 'react-icons/fi';
import { LineChart, Line, PieChart, Pie, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { DataGrid } from '@mui/x-data-grid';
import { Select, MenuItem, Card, CardContent, Typography } from '@mui/material';
import UserManagementView from '../../../components/adminrenderview/usermanagement/UserManagementView';
import BusManagementView from '../../../components/adminrenderview/busmanagement/BusManagementView';
import RouteManagementView from '../../../components/adminrenderview/busroutesmanagement/BusRoutesManagementView';
import ScheduleManagementView from '../../../components/adminrenderview/busschedulemanagement/BusScheduleManagementView';
import SupportRequestManagementView from '../../../components/adminrenderview/supportrequests/SupportRequestManagementView';
import BookingManagementView from '../../../components/adminrenderview/bookingmanagement/BookingManagementView';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { backendUrl, setIsAdminLoggedin, adminData, setSuppressUnauthorizedToast } = useContext(AdminAppContext);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedTable, setSelectedTable] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Main data states
  const [users, setUsers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [supportRequests, setSupportRequests] = useState([]);

  // Dashboard statistics
  const [dashboardStats, setDashboardStats] = useState({
    totalUsers: 0,
    totalOperators: 0,
    totalOperatorVerified: 0,
    totalOperatorUnverified: 0,
    totalBuses: 0,
    totalBusesVerified: 0,
    totalBusesUnverified: 0,
    totalRoutes: 0,
    totalBookings: 0,
    totalBookingsSuccess: 0,
    totalBookingsFailed: 0,
    totalRevenue: 0,
    recentBookings: [],
    bookingsByStatus: { success: 0, failed: 0 },
    totalSupportRequests: 0,
    openSupportRequests: 0,
    recentSupportRequests: [],
    weeklyRevenue: [],
    monthlyRevenue: [],
    yearlyRevenue: []
  });

  // Time period for revenue chart
  const [revenuePeriod, setRevenuePeriod] = useState('weekly');

  const handleLogout = async () => {
    try {
      await axios.post(`${backendUrl}/api/admin/auth/logout`);
      setIsAdminLoggedin(false);
      setSuppressUnauthorizedToast(true);
      toast.success("Admin logged out successfully!");
      navigate('/');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSignup = () => navigate('/admin/register');

  const userColumns = [
    {
      field: 'sno',
      headerName: 'S.No',
      width: 100,
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        return <span className="text-gray-600">{rowIndex}</span>;
      }
    },
    { field: 'name', headerName: 'Name', width: 270, headerClassName: 'font-semibold' },
    { field: 'email', headerName: 'Email', width: 380, headerClassName: 'font-semibold' },
    {
      field: 'isAccountVerified',
      headerName: 'Verified Status',
      width: 200,
      renderCell: (params) => (
        <span className={`font-medium ${params.value ? 'text-green-600' : 'text-red-600'}`}>
          {params.value ? 'Verified' : 'Unverified'}
        </span>
      )
    },
    {
      field: 'isBlocked',
      headerName: 'Blocked Status',
      width: 200,
      renderCell: (params) => (
        <Select
          value={params.value ? 'blocked' : 'active'}
          onChange={(e) => handleStatusChange(params.row._id, 'user', e.target.value)}
          className="w-full"
          sx={{
            '& .MuiSelect-select': { color: params.value ? '#dc2626' : '#16a34a', fontWeight: 500 }
          }}
        >
          <MenuItem value="active" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>
            Active
          </MenuItem>
          <MenuItem value="blocked" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>
            Blocked
          </MenuItem>
        </Select>
      )
    }
  ];

  // Updated operator columns with combined status
  const operatorColumns = [
    {
      field: 'sno',
      headerName: 'S.No',
      width: 80,
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        return <span className="text-gray-600">{rowIndex}</span>;
      }
    },
    { field: 'name', headerName: 'Name', width: 200, headerClassName: 'font-semibold' },
    { field: 'email', headerName: 'Email', width: 320, headerClassName: 'font-semibold' },
    { field: 'panNo', headerName: 'PAN Number', width: 130, headerClassName: 'font-semibold' },
    {
      field: 'panImage',
      headerName: 'PAN Image',
      width: 130,
      renderCell: (params) => (
        <a
          href={params.value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
        >
          View Image
        </a>
      )
    },
    {
      field: 'combinedStatus',
      headerName: 'Status',
      width: 200,
      renderCell: (params) => {
        const operator = params.row;
        // Determine the combined status based on both verification and blocked status
        let status = 'pending';
        let statusText = 'Pending';
        let color = '#f59e0b'; // amber for pending
        
        if (operator.isBlocked) {
          status = 'rejected';
          statusText = 'Rejected';
          color = '#dc2626'; // red for rejected
        } else if (operator.isAccountVerified) {
          status = 'verified';
          statusText = 'Verified';
          color = '#16a34a'; // green for verified
        } else {
          status = 'unverified';
          statusText = 'Unverified';
          color = '#4b5563'; // gray for unverified
        }

        return (
          <Select
            value={status}
            onChange={(e) => handleOperatorStatusChange(params.row._id, e.target.value)}
            className="w-full"
            sx={{
              '& .MuiSelect-select': { color: color, fontWeight: 500 },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: color }
            }}
          >
            <MenuItem value="pending" sx={{ color: '#f59e0b', '&:hover': { backgroundColor: '#fffbeb' } }}>
              Pending
            </MenuItem>
            <MenuItem value="verified" sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}>
              Verified
            </MenuItem>
            <MenuItem value="unverified" sx={{ color: '#4b5563', '&:hover': { backgroundColor: '#f9fafb' } }}>
              Unverified
            </MenuItem>
            <MenuItem value="rejected" sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}>
              Rejected
            </MenuItem>
          </Select>
        );
      }
    }
  ];

  const handleStatusChange = async (id, type, status) => {
    try {
      const isBlocked = status === 'blocked';
      const endpoint = type === 'user'
        ? `${backendUrl}/api/admin/users/${id}/blocked`
        : `${backendUrl}/api/admin/operators/${id}/status`;
      const response = await axios.put(
        endpoint,
        { isBlocked },
        { headers: { Authorization: `Bearer ${adminData?.token}` } }
      );
      // Update local state
      if (type === 'user') {
        setUsers(users.map(user =>
          user._id === id ? { ...user, isBlocked } : user
        ));
      } else {
        setOperators(operators.map(operator =>
          operator._id === id ? { ...operator, isBlocked } : operator
        ));
      }
      toast.success('Status updated successfully');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Combined status handler for operators
  const handleOperatorStatusChange = async (id, status) => {
    try {
      let updateData = {};
      
      switch (status) {
        case 'verified':
          updateData = { isAccountVerified: true, isBlocked: false };
          break;
        case 'unverified':
          updateData = { isAccountVerified: false, isBlocked: false };
          break;
        case 'rejected':
          updateData = { isAccountVerified: false, isBlocked: true };
          break;
        case 'pending':
          updateData = { isAccountVerified: false, isBlocked: false };
          break;
        default:
          updateData = { isAccountVerified: false, isBlocked: false };
      }

      const response = await axios.put(
        `${backendUrl}/api/admin/operators/${id}/status`,
        updateData,
        { headers: { Authorization: `Bearer ${adminData?.token}` } }
      );
      
      // Update local state
      setOperators(operators.map(operator =>
        operator._id === id ? { ...operator, ...updateData } : operator
      ));
      
      toast.success(`Operator status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update operator status');
    }
  };

  // Fetch dashboard statistics when the dashboard view is active
  useEffect(() => {
    if (activeView === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeView]);

  // Fetch data based on active view
  useEffect(() => {
    const fetchData = async () => {
      try {
        let endpoint = '';
        let params = {
          search: searchQuery,
          status: statusFilter === 'all' ? null : statusFilter
        };

        if (activeView === 'users') {
          endpoint = selectedTable === 'users'
            ? `${backendUrl}/api/admin/users`
            : `${backendUrl}/api/admin/operators`;

          const response = await axios.get(endpoint, {
            params,
            headers: { Authorization: `Bearer ${adminData?.token}` }
          });

          if (selectedTable === 'users') {
            setUsers(response.data);
          } else {
            setOperators(response.data);
          }
        } else if (activeView === 'buses') {
          endpoint = `${backendUrl}/api/admin/buses`;
          const response = await axios.get(endpoint, {
            params: { search: searchQuery },
            headers: { Authorization: `Bearer ${adminData?.token}` }
          });
          setBuses(response.data);
        } else if (activeView === 'routes') {
          endpoint = `${backendUrl}/api/admin/routes`;
          const response = await axios.get(endpoint, {
            params: { search: searchQuery },
            headers: { Authorization: `Bearer ${adminData?.token}` }
          });
          setRoutes(response.data);
        } else if (activeView === 'support') {
          try {
            endpoint = `${backendUrl}/api/support/admin`;
            const response = await axios.get(endpoint, {
              params: { search: searchQuery, status: statusFilter !== 'all' ? statusFilter : '' },
              headers: { Authorization: `Bearer ${adminData?.token}` }
            });

            if (response.data && response.data.success) {
              if (Array.isArray(response.data.data)) {
                setSupportRequests(response.data.data);
              } else {
                toast.error('Received invalid support request data format');
                setSupportRequests([]);
              }
            } else {
              toast.error(response.data?.message || 'Failed to fetch support requests');
              setSupportRequests([]);
            }
          } catch (error) {
            toast.error(error.response?.data?.message || 'Error fetching support requests');
            setSupportRequests([]);
          }
        }
      } catch (error) {
        toast.error('Error fetching data');
      }
    };

    if (['users', 'buses', 'routes', 'support'].includes(activeView)) {
      fetchData();
    }
  }, [activeView, selectedTable, searchQuery, statusFilter]);

  // Fetch all data for dashboard
  const fetchDashboardData = async () => {
    try {
      // Fetch users count
      const usersRes = await axios.get(`${backendUrl}/api/admin/users`, {
        headers: { Authorization: `Bearer ${adminData?.token}` }
      });

      // Fetch operators count
      const operatorsRes = await axios.get(`${backendUrl}/api/admin/operators`, {
        headers: { Authorization: `Bearer ${adminData?.token}` }
      });

      // Fetch buses count
      const busesRes = await axios.get(`${backendUrl}/api/admin/buses`, {
        headers: { Authorization: `Bearer ${adminData?.token}` }
      });

      // Fetch routes count
      const routesRes = await axios.get(`${backendUrl}/api/admin/routes`, {
        headers: { Authorization: `Bearer ${adminData?.token}` }
      });

      // Fetch bookings with status
      const bookingsRes = await axios.get(`${backendUrl}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${adminData?.token}` }
      });

      // Fetch support requests
      const supportRes = await axios.get(`${backendUrl}/api/support/admin`, {
        headers: { Authorization: `Bearer ${adminData?.token}` }
      });

      let totalBookings = 0;
      let totalBookingsSuccess = 0;
      let totalBookingsFailed = 0;
      let totalRevenue = 0;
      let bookingsByStatus = { success: 0, failed: 0 };
      let recentBookings = [];
      let weeklyRevenue = [];
      let monthlyRevenue = [];
      let yearlyRevenue = [];

      // Process operators data
      const operators = operatorsRes.data || [];
      const totalOperatorVerified = operators.filter(op => op.isAccountVerified && !op.isBlocked).length;
      const totalOperatorUnverified = operators.filter(op => !op.isAccountVerified && !op.isBlocked).length;
      const totalOperatorRejected = operators.filter(op => op.isBlocked).length;

      // Process buses data
      const buses = busesRes.data || [];
      const totalBusesVerified = buses.filter(bus => bus.verified === true || bus.isVerified === true).length;
      const totalBusesUnverified = buses.length - totalBusesVerified;

      // Process support requests
      const supportRequests = supportRes.data?.data || [];
      const openSupportRequests = supportRequests.filter(req => req.status === 'pending' || req.status === 'open').length;

      // Get 5 most recent support requests
      const recentSupportRequests = [...supportRequests]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

      if (bookingsRes.data && bookingsRes.data.bookings) {
        const allBookings = bookingsRes.data.bookings;
        totalBookings = allBookings.length;

        // Calculate success and failed bookings (treating pending as failed)
        const successfulBookings = allBookings.filter(booking =>
          booking.status === 'confirmed' || booking.paymentStatus === 'paid'
        );

        totalBookingsSuccess = successfulBookings.length;
        totalBookingsFailed = totalBookings - totalBookingsSuccess;

        totalRevenue = successfulBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

        // Count bookings by status - simplify to just success and failed
        bookingsByStatus = {
          success: successfulBookings.length,
          failed: totalBookings - successfulBookings.length // All non-success are considered failed
        };

        // Get recent bookings
        recentBookings = [...allBookings]
          .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
          .slice(0, 5);

        // Calculate weekly revenue
        const today = new Date();

        // Weekly revenue data (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const day = new Date();
          day.setDate(today.getDate() - i);
          return day;
        }).reverse();

        weeklyRevenue = last7Days.map(day => {
          const dayStr = day.toLocaleDateString('en-US', { weekday: 'short' });
          const startOfDay = new Date(day);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(day);
          endOfDay.setHours(23, 59, 59, 999);

          // Filter bookings for this day
          const dayBookings = successfulBookings.filter(booking => {
            const bookingDate = new Date(booking.createdAt || booking.bookingDate);
            return bookingDate >= startOfDay && bookingDate <= endOfDay;
          });

          // Calculate total amount for the day
          const amount = dayBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

          return { name: dayStr, amount };
        });

        // Monthly revenue data (last 6 months)
        const last6Months = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(today.getMonth() - i);
          return date;
        }).reverse();

        monthlyRevenue = last6Months.map(date => {
          const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
          const year = date.getFullYear();
          const month = date.getMonth();

          const startOfMonth = new Date(year, month, 1);
          const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59, 999);

          // Filter bookings for this month
          const monthBookings = successfulBookings.filter(booking => {
            const bookingDate = new Date(booking.createdAt || booking.bookingDate);
            return bookingDate >= startOfMonth && bookingDate <= endOfMonth;
          });

          // Calculate total amount for the month
          const amount = monthBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

          return { name: monthStr, amount };
        });

        // Yearly revenue data (last 3 years)
        const last3Years = Array.from({ length: 3 }, (_, i) => {
          const date = new Date();
          date.setFullYear(today.getFullYear() - i);
          return date;
        }).reverse();

        yearlyRevenue = last3Years.map(date => {
          const year = date.getFullYear();

          const startOfYear = new Date(year, 0, 1);
          const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

          // Filter bookings for this year
          const yearBookings = successfulBookings.filter(booking => {
            const bookingDate = new Date(booking.createdAt || booking.bookingDate);
            return bookingDate >= startOfYear && bookingDate <= endOfYear;
          });

          // Calculate total amount for the year
          const amount = yearBookings.reduce((sum, booking) => sum + (booking.price || 0), 0);

          return { name: year.toString(), amount };
        });
      }

      setDashboardStats({
        totalUsers: usersRes.data.length || 0,
        totalOperators: operators.length || 0,
        totalOperatorVerified,
        totalOperatorUnverified,
        totalOperatorRejected,
        totalBuses: buses.length || 0,
        totalBusesVerified,
        totalBusesUnverified,
        totalRoutes: routesRes.data.length || 0,
        totalBookings,
        totalBookingsSuccess,
        totalBookingsFailed,
        totalRevenue,
        recentBookings,
        bookingsByStatus,
        totalSupportRequests: supportRequests.length || 0,
        openSupportRequests,
        recentSupportRequests,
        weeklyRevenue,
        monthlyRevenue,
        yearlyRevenue
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  // Generate chart data based on bookings by status - only success and failed now
  const bookingStatusData = [
    { name: 'Success', value: dashboardStats.bookingsByStatus.success, fill: '#4ade80' },
    { name: 'Failed', value: dashboardStats.bookingsByStatus.failed, fill: '#f87171' }
  ];

  // Get appropriate revenue data based on selected period
  const getRevenueData = () => {
    switch (revenuePeriod) {
      case 'monthly':
        return dashboardStats.monthlyRevenue.length > 0
          ? dashboardStats.monthlyRevenue
          : Array.from({ length: 6 }, (_, i) => ({ name: `Month ${i + 1}`, amount: 0 }));
      case 'yearly':
        return dashboardStats.yearlyRevenue.length > 0
          ? dashboardStats.yearlyRevenue
          : Array.from({ length: 3 }, (_, i) => ({ name: `Year ${new Date().getFullYear() - 2 + i}`, amount: 0 }));
      case 'weekly':
      default:
        return dashboardStats.weeklyRevenue.length > 0
          ? dashboardStats.weeklyRevenue
          : Array.from({ length: 7 }, (_, i) => ({ name: 'Day', amount: 0 }));
    }
  };

  // Format date for recent bookings
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Reduced navigation items (removed unnecessary pages)
  const navigationItems = [
    { name: 'Dashboard', icon: FaChartBar, view: 'dashboard' },
    { name: 'Users', icon: FaUsers, view: 'users' },
    { name: 'Buses', icon: IoBus, view: 'buses' },
    { name: 'Bookings', icon: FaTicketAlt, view: 'bookings' },
    { name: 'Routes', icon: FaMap, view: 'routes' },
    { name: 'Schedules', icon: FaClock, view: 'schedules' },
    { name: 'Support', icon: FaQuestionCircle, view: 'support' },
  ];

  // View ticket handler
  const handleViewTicket = (bookingId) => {
    navigate(`/bus-tickets/invoice?bookingId=${bookingId}`);
  };

  const renderView = () => {
    switch (activeView) {
      case 'users':
        return (
          <UserManagementView
            selectedTable={selectedTable}
            columns={selectedTable === 'users' ? userColumns : operatorColumns}
            rows={selectedTable === 'users' ? users : operators}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onFilterChange={(e) => setStatusFilter(e.target.value)}
            onTableChange={(e) => setSelectedTable(e.target.value)}
          />
        );

      case 'buses':
        return (
          <BusManagementView
            buses={buses}
            searchQuery={searchQuery}
            selectedFilter={statusFilter}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onFilterChange={(e) => setStatusFilter(e.target.value)}
            filterOptions={[
              { value: 'all', label: 'All Buses' },
              { value: 'verified', label: 'Verified' },
              { value: 'unverified', label: 'Unverified' }
            ]}
          />
        );

      case 'routes':
        return (
          <RouteManagementView
            routes={routes}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
          />
        );

      case 'bookings':
        return <BookingManagementView />;

      case 'schedules':
        return <ScheduleManagementView />;

      case 'support':
        return (
          <SupportRequestManagementView
            supportRequests={supportRequests}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            statusFilter={statusFilter}
            onFilterChange={(e) => setStatusFilter(e.target.value)}
            fetchSupportRequests={fetchDashboardData}
          />
        );

      default: // Dashboard view
        return (
          <div className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <Card className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">Total Users</Typography>
                      <Typography variant="h5" component="div" className="font-bold mt-1">
                        {dashboardStats.totalUsers}
                      </Typography>
                    </div>
                    <FaUsers className="text-blue-500 text-3xl p-2 bg-blue-50 rounded-full" />
                  </div>
                  <div className="mt-3">
                    <button
                      className="text-primary text-xs hover:underline flex items-center"
                      onClick={() => setActiveView('users')}
                    >
                      View all users <FaArrowRight className="ml-1 text-xs" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">Total Operators</Typography>
                      <Typography variant="h5" component="div" className="font-bold mt-1">
                        {dashboardStats.totalOperators}
                      </Typography>
                    </div>
                    <FaUsers className="text-purple-500 text-3xl p-2 bg-purple-50 rounded-full" />
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1 text-xs">
                    <span className="text-green-600">Verified: {dashboardStats.totalOperatorVerified}</span>
                    <span className="text-gray-600">Pending: {dashboardStats.totalOperatorUnverified}</span>
                    <span className="text-red-600">Rejected: {dashboardStats.totalOperatorRejected || 0}</span>
                  </div>
                  <div className="mt-1">
                    <button
                      className="text-primary text-xs hover:underline flex items-center"
                      onClick={() => {
                        setActiveView('users');
                        setSelectedTable('operators');
                      }}
                    >
                      View all operators <FaArrowRight className="ml-1 text-xs" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">Total Buses</Typography>
                      <Typography variant="h5" component="div" className="font-bold mt-1">
                        {dashboardStats.totalBuses}
                      </Typography>
                    </div>
                    <IoBus className="text-green-500 text-3xl p-2 bg-green-50 rounded-full" />
                  </div>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-green-600">Verified: {dashboardStats.totalBusesVerified}</span>
                    <span className="text-red-600">Unverified: {dashboardStats.totalBusesUnverified}</span>
                  </div>
                  <div className="mt-1">
                    <button
                      className="text-primary text-xs hover:underline flex items-center"
                      onClick={() => setActiveView('buses')}
                    >
                      View all buses <FaArrowRight className="ml-1 text-xs" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">Total Revenue</Typography>
                      <Typography variant="h5" component="div" className="font-bold mt-1">
                        NPR {dashboardStats.totalRevenue.toLocaleString()}
                      </Typography>
                    </div>
                    <FaMoneyBillWave className="text-emerald-500 text-3xl p-2 bg-emerald-50 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Second row of stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">Total Routes</Typography>
                      <Typography variant="h5" component="div" className="font-bold mt-1">
                        {dashboardStats.totalRoutes}
                      </Typography>
                    </div>
                    <FaMap className="text-indigo-500 text-3xl p-2 bg-indigo-50 rounded-full" />
                  </div>
                  <div className="mt-3">
                    <button
                      className="text-primary text-xs hover:underline flex items-center"
                      onClick={() => setActiveView('routes')}
                    >
                      View all routes <FaArrowRight className="ml-1 text-xs" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">Support Requests</Typography>
                      <Typography variant="h5" component="div" className="font-bold mt-1">
                        {dashboardStats.totalSupportRequests}
                      </Typography>
                    </div>
                    <FaQuestionCircle className="text-amber-500 text-3xl p-2 bg-amber-50 rounded-full" />
                  </div>
                  <div className="mt-2 flex text-xs">
                    <span className="text-amber-600">Open requests: {dashboardStats.openSupportRequests}</span>
                  </div>
                  <div className="mt-1">
                    <button
                      className="text-primary text-xs hover:underline flex items-center"
                      onClick={() => setActiveView('support')}
                    >
                      View all requests <FaArrowRight className="ml-1 text-xs" />
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-lg shadow-sm hover:shadow transition-shadow">
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <Typography variant="subtitle2" color="textSecondary">Total Bookings</Typography>
                      <Typography variant="h5" component="div" className="font-bold mt-1">
                        {dashboardStats.totalBookings}
                      </Typography>
                    </div>
                    <FaTicketAlt className="text-pink-500 text-3xl p-2 bg-pink-50 rounded-full" />
                  </div>
                  <div className="mt-2 flex justify-between text-xs">
                    <span className="text-green-600">Success: {dashboardStats.totalBookingsSuccess}</span>
                    <span className="text-red-600">Failed: {dashboardStats.totalBookingsFailed}</span>
                  </div>
                  <div className="mt-1">
                    <button
                      className="text-primary text-xs hover:underline flex items-center"
                      onClick={() => setActiveView('bookings')}
                    >
                      View all bookings <FaArrowRight className="ml-1 text-xs" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts & Recent Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Booking Status Chart */}
              <Card className="bg-white rounded-lg shadow-sm lg:col-span-1">
                <CardContent>
                  <Typography variant="h6" component="div" className="mb-4">
                    Booking Status
                  </Typography>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        />
                        <Tooltip formatter={(value) => [`${value} bookings`, 'Count']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex justify-center space-x-4 mt-4">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
                      <span className="text-xs">Success</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-1"></div>
                      <span className="text-xs">Failed</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Weekly Revenue Chart */}
              <Card className="bg-white rounded-lg shadow-sm lg:col-span-2">
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <Typography variant="h6" component="div">
                      Revenue
                    </Typography>
                    <div className="flex rounded-md bg-gray-100 p-1">
                      <button
                        onClick={() => setRevenuePeriod('weekly')}
                        className={`px-3 py-1 text-xs rounded-md transition ${revenuePeriod === 'weekly'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'}`}
                      >
                        Weekly
                      </button>
                      <button
                        onClick={() => setRevenuePeriod('monthly')}
                        className={`px-3 py-1 text-xs rounded-md transition ${revenuePeriod === 'monthly'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'}`}
                      >
                        Monthly
                      </button>
                      <button
                        onClick={() => setRevenuePeriod('yearly')}
                        className={`px-3 py-1 text-xs rounded-md transition ${revenuePeriod === 'yearly'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'}`}
                      >
                        Yearly
                      </button>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={getRevenueData()}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`NPR ${value}`, 'Revenue']} />
                        <Bar dataKey="amount" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings */}
            <Card className="bg-white rounded-lg shadow-sm">
              <CardContent>
                <Typography variant="h6" component="div" className="mb-4">
                  Recent Bookings
                </Typography>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Booking ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Passenger
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Route
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardStats.recentBookings.length > 0 ? (
                        dashboardStats.recentBookings.map((booking) => (
                          <tr key={booking._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.bookingId}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.passengerInfo?.name || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking.ticketInfo ? `${booking.ticketInfo.fromLocation} → ${booking.ticketInfo.toLocation}` : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(booking.ticketInfo?.date)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${booking.status === 'confirmed' || booking.paymentStatus === 'paid'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'}`}>
                                {booking.status === 'confirmed' || booking.paymentStatus === 'paid'
                                  ? 'Success'
                                  : 'Failed'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">NPR {booking.price || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {(booking.status === 'confirmed' || booking.paymentStatus === 'paid') && (
                                <button
                                  onClick={() => handleViewTicket(booking.bookingId || booking._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="View Ticket"
                                >
                                  <div className="flex items-center">
                                    <FaTicketAlt className="mr-1" /> View Ticket
                                  </div>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                            No recent bookings found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    className="text-primary text-sm hover:underline flex items-center"
                    onClick={() => setActiveView('bookings')}
                  >
                    View all bookings <FaArrowRight className="ml-1 text-xs" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Support Requests */}
            <Card className="bg-white rounded-lg shadow-sm">
              <CardContent>
                <Typography variant="h6" component="div" className="mb-4">
                  Recent Support Requests
                </Typography>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submitted On
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardStats.recentSupportRequests.length > 0 ? (
                        dashboardStats.recentSupportRequests.map((request) => (
                          <tr key={request._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{request.name || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{request.email || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{request.phone || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{request.type || 'General'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{formatDate(request.createdAt)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${request.status === 'closed' || request.status === 'complete'
                                  ? 'bg-green-100 text-green-800'
                                  : request.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-blue-100 text-blue-800'}`}
                              >
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                            No recent support requests found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    className="text-primary text-sm hover:underline flex items-center"
                    onClick={() => setActiveView('support')}
                  >
                    View all requests <FaArrowRight className="ml-1 text-xs" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 w-64 px-4 py-6 bg-white shadow-lg">
        <div className="flex flex-col items-start pl-2">
          <span className="text-xl font-bold">Admin Panel</span>
          <p className="text-sm text-gray-600 mt-1">Welcome, {adminData?.name}</p>
        </div>

        <hr className="border-t border-gray-200 -mx-4 my-4 shadow-lg" />
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveView(item.view)}
              className={`w-full flex items-center px-3 py-2 rounded-lg ${activeView === item.view
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="pl-64">
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <h1 className="text-4xl text-primary font-bold mt-3 mb-2">Ticket Master</h1>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignup}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <FaUserPlus className="w-5 h-5 mr-2" />
                Create Admin
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
              >
                Logout
                <FiLogOut className="ml-2" />
              </button>
            </div>
          </div>
        </header>

        <main className="px-8 py-6">{renderView()}</main>
      </div>
    </div>
  );
};

export default AdminDashboard;