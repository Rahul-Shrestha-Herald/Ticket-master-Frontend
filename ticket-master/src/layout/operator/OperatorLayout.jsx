import React, { useContext, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { OperatorAppContext } from '../../context/OperatorAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiLogOut, FiMenu, FiX, FiUser } from 'react-icons/fi';
import { FaBus, FaPlus, FaRoute, FaClock, FaTicketAlt, FaHome, FaMapMarkerAlt } from 'react-icons/fa';

const OperatorLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { backendUrl, setIsOperatorLoggedin, operatorData, setSuppressUnauthorizedToast } = useContext(OperatorAppContext);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await axios.post(`${backendUrl}/api/operator/auth/logout`);
            // Set suppression flag to avoid the protected route toast after logout
            setSuppressUnauthorizedToast(true);
            setIsOperatorLoggedin(false);
            toast.success("Operator logged out successfully!");
            navigate('/');
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Toggle sidebar for mobile
    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Check if a path is active
    const isActive = (path) => {
        return location.pathname.startsWith(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar - Desktop (fixed) and Mobile (slide-in) */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    }`}
            >
                <div className="p-5 border-b relative">
                    <button
                        onClick={toggleSidebar}
                        className="lg:hidden absolute top-5 right-5 text-red-600"
                    >
                        <FiX size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">Operator Panel</h2>
                    <p className="text-sm text-gray-600 mt-1">Welcome, {operatorData?.name}</p>
                </div>
                <nav className="p-4">
                    <ul className="space-y-2">
                        <li>
                            <Link
                                to="/operator/dashboard"
                                className={`flex items-center p-3 rounded-lg ${isActive('/operator/dashboard')
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <FaHome className="w-5 h-5 mr-3" />
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/operator/add-bus"
                                className={`flex items-center p-3 rounded-lg ${isActive('/operator/add-bus')
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <FaPlus className="w-5 h-5 mr-3" />
                                Add New Bus
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/operator/buses"
                                className={`flex items-center p-3 rounded-lg ${isActive('/operator/buses')
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <FaBus className="w-5 h-5 mr-3" />
                                Buses
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/operator/bus-routes"
                                className={`flex items-center p-3 rounded-lg ${isActive('/operator/bus-routes')
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <FaRoute className="w-5 h-5 mr-3" />
                                Routes
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/operator/bus-schedules"
                                className={`flex items-center p-3 rounded-lg ${isActive('/operator/bus-schedules')
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <FaClock className="w-5 h-5 mr-3" />
                                Bus Schedule
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/operator/bookings"
                                className={`flex items-center p-3 rounded-lg ${isActive('/operator/bookings')
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <FaTicketAlt className="w-5 h-5 mr-3" />
                                Bookings
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/operator/live-tracking"
                                className={`flex items-center p-3 rounded-lg ${isActive('/operator/live-tracking')
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <FaMapMarkerAlt className="w-5 h-5 mr-3" />
                                Live Tracking
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/operator/profile"
                                className={`flex items-center p-3 rounded-lg ${isActive('/operator/profile')
                                    ? 'bg-red-50 text-red-600'
                                    : 'text-gray-700 hover:bg-red-50 hover:text-red-600'}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <FiUser className="w-5 h-5 mr-3" />
                                Profile
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <main className="lg:ml-64 transition-all duration-300 mt-0 mb-1">
                <header className="bg-white shadow-sm mb-4 md:mb-8 px-4 lg:px-8">
                    <div className="flex justify-between items-center py-3 md:py-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleSidebar}
                                className="lg:hidden p-2 text-red-600 hover:bg-gray-100 rounded-md"
                            >
                                {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                            </button>
                            <h1 className="text-xl md:text-4xl text-primary font-bold mt-2 mb-2">ticket master</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link
                                to="/operator/profile"
                                className="flex items-center p-2 text-red-600 hover:bg-red-50 rounded-full"
                            >
                                <FiUser size={20} />
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-3 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                            >
                                Logout
                                <FiLogOut className='ml-2' />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <div className="px-4 lg:px-8">
                    {children}
                </div>

                <Outlet />
            </main>
        </div>
    );
};

export default OperatorLayout;