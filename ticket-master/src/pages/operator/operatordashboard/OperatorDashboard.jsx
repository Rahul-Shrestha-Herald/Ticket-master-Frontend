// // // May uninstall if not used in future npm uninstall @mui/x-data-grid recharts @emotion/styled

import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OperatorAppContext } from '../../../context/OperatorAppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaArrowRight, FaTicketAlt } from 'react-icons/fa';
import LoadingSpinner from '../../../components/loading/LoadingSpinner';
import OperatorLayout from '../../../layout/operator/OperatorLayout';

const OperatorDashboard = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(OperatorAppContext);
  const [dashboardData, setDashboardData] = useState({
    totalBuses: 0,
    totalCompletedBookings: 0,
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        axios.defaults.withCredentials = true;

        // Fetch buses
        const busesRes = await axios.get(`${backendUrl}/api/operator/bus/buses`);

        // Fetch bookings
        const bookingsRes = await axios.get(`${backendUrl}/api/operator/bookings`);

        // Calculate stats
        const totalBuses = busesRes.data.length || 0;

        // Filter completed/confirmed bookings
        const completedBookings = bookingsRes.data.bookings ?
          bookingsRes.data.bookings.filter(booking =>
            booking.status === 'confirmed' || booking.paymentStatus === 'paid'
          ) : [];

        // Get 5 most recent bookings
        const recentBookings = bookingsRes.data.bookings ?
          [...bookingsRes.data.bookings]
            .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
            .slice(0, 5) : [];

        setDashboardData({
          totalBuses,
          totalCompletedBookings: completedBookings.length,
          recentBookings
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [backendUrl]);

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

  // Get status class for display
  const getStatusClass = (status, paymentStatus) => {
    if (status === 'confirmed' || paymentStatus === 'paid') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'canceled' || paymentStatus === 'refunded') {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-red-100 text-red-800';
  };

  // Get display text for status
  const getStatusText = (status, paymentStatus) => {
    if (status === 'confirmed' || paymentStatus === 'paid') {
      return 'Success';
    } else if (status === 'canceled' || paymentStatus === 'refunded') {
      return 'Canceled';
    }
    return 'Failed';
  };

  // Handle view ticket action
  const handleViewTicket = (booking) => {
    navigate(`/bus-tickets/invoice?bookingId=${booking.bookingId || booking._id}`);
  };

  return (
    <OperatorLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
              <h3 className="text-gray-500 text-xs md:text-sm mb-2">Total Buses</h3>
              <p className="text-xl md:text-3xl font-bold text-gray-800">{dashboardData.totalBuses}</p>
              <div className="mt-2">
                <Link to="/operator/buses" className="text-primary text-xs md:text-sm hover:underline flex items-center">
                  Manage buses <FaArrowRight className="ml-1 text-xs" />
                </Link>
              </div>
            </div>

            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
              <h3 className="text-gray-500 text-xs md:text-sm mb-2">Completed Bookings</h3>
              <p className="text-xl md:text-3xl font-bold text-gray-800">{dashboardData.totalCompletedBookings}</p>
              <div className="mt-2">
                <Link to="/operator/bookings" className="text-primary text-xs md:text-sm hover:underline flex items-center">
                  View all bookings <FaArrowRight className="ml-1 text-xs" />
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Bookings Table */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base md:text-lg font-semibold">Recent Bookings</h2>
              <Link to="/operator/bookings" className="text-primary hover:text-primary/80 flex items-center text-xs md:text-sm">
                View all <FaArrowRight className="ml-1" />
              </Link>
            </div>

            {dashboardData.recentBookings.length === 0 ? (
              <div className="text-center py-6 text-gray-500 text-sm">
                No bookings found
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Mobile Booking Cards */}
                <div className="lg:hidden space-y-4">
                  {dashboardData.recentBookings.map((booking) => (
                    <div key={booking._id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">ID: {booking.bookingId || booking._id}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(booking.status, booking.paymentStatus)}`}>
                          {getStatusText(booking.status, booking.paymentStatus)}
                        </span>
                      </div>
                      <p className="text-sm font-medium mb-1">
                        {booking.ticketInfo?.fromLocation || 'N/A'} → {booking.ticketInfo?.toLocation || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        Passenger: {booking.passengerInfo?.name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500 mb-1">
                        Date: {formatDate(booking.ticketInfo?.date || booking.bookingDate)}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm font-medium">
                          Rs. {booking.price || (booking.ticketInfo && booking.ticketInfo.totalPrice) || 0}
                        </p>
                        {(booking.status === 'confirmed' || booking.paymentStatus === 'paid') && (
                          <button
                            onClick={() => handleViewTicket(booking)}
                            className="text-primary hover:text-primary/80 flex items-center text-xs"
                          >
                            <FaTicketAlt className="mr-1" /> View Ticket
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table */}
                <table className="hidden lg:table w-full">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-3 pl-3">Booking ID</th>
                      <th className="pb-3">Passenger</th>
                      <th className="pb-3">Route</th>
                      <th className="pb-3">Travel Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3 pr-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentBookings.map((booking) => (
                      <tr key={booking._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 pl-3 pr-2 text-sm">
                          {booking.bookingId || booking._id}
                        </td>
                        <td className="py-3 pr-2 text-sm">
                          {booking.passengerInfo?.name || 'N/A'}
                        </td>
                        <td className="py-3 pr-2 text-sm">
                          {booking.ticketInfo?.fromLocation || 'N/A'} → {booking.ticketInfo?.toLocation || 'N/A'}
                        </td>
                        <td className="py-3 pr-2 text-sm">
                          {formatDate(booking.ticketInfo?.date || booking.bookingDate)}
                        </td>
                        <td className="py-3 pr-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(booking.status, booking.paymentStatus)}`}>
                            {getStatusText(booking.status, booking.paymentStatus)}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-sm font-medium">
                          Rs. {booking.price || (booking.ticketInfo && booking.ticketInfo.totalPrice) || 0}
                        </td>
                        <td className="py-3 pr-3 text-right">
                          {(booking.status === 'confirmed' || booking.paymentStatus === 'paid') && (
                            <button
                              onClick={() => handleViewTicket(booking)}
                              className="text-primary hover:text-primary/80 flex items-center text-sm"
                            >
                              <FaTicketAlt className="mr-1" />Ticket
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </OperatorLayout>
  );
};

export default OperatorDashboard;


// // // // May uninstall if not used in future npm uninstall @mui/x-data-grid recharts @emotion/styled

// import React, { useContext, useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { OperatorAppContext } from '../../../context/OperatorAppContext';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { FaArrowRight, FaTicketAlt, FaIdCard, FaCheckCircle, FaUpload, FaArrowLeft, FaArrowRight as FaArrowRightIcon } from 'react-icons/fa';
// import LoadingSpinner from '../../../components/loading/LoadingSpinner';
// import OperatorLayout from '../../../layout/operator/OperatorLayout';

// const OperatorDashboard = () => {
//   const navigate = useNavigate();
//   const { backendUrl, operatorData } = useContext(OperatorAppContext);
//   const [dashboardData, setDashboardData] = useState({
//     totalBuses: 0,
//     totalCompletedBookings: 0,
//     totalRevenue: 0,
//     recentBookings: []
//   });
//   const [loading, setLoading] = useState(true);
//   const [showKYCModal, setShowKYCModal] = useState(false);
//   const [kycStep, setKycStep] = useState(1);
//   const [kycData, setKycData] = useState({
//     panNumber: '',
//     panImage: null,
//     businessName: '',
//     businessAddress: '',
//     businessRegistrationNumber: '',
//     businessRegistrationImage: null,
//     idProofType: 'citizenship',
//     idProofNumber: '',
//     idProofImage: null
//     // Removed bank details
//   });
//   const [previewImage, setPreviewImage] = useState(null);
//   const [kycStatus, setKycStatus] = useState('pending'); // pending, submitted, verified, rejected
//   const [isLoadingKYC, setIsLoadingKYC] = useState(false);

//   // Debug: Check operator data
//   useEffect(() => {
//     console.log("Operator Data in Dashboard:", operatorData);
//     console.log("Token exists:", !!operatorData?.token);
//   }, [operatorData]);

//   // Check KYC status on component mount
//   useEffect(() => {
//     const checkKYCStatus = async () => {
//       if (!operatorData?.token) {
//         console.log("No token available for KYC check");
//         return;
//       }
      
//       try {
//         setIsLoadingKYC(true);
//         console.log("Checking KYC status...");
        
//         // You can implement this API endpoint later
//         // For now, we'll set a default status
//         setKycStatus('pending');
        
//       } catch (error) {
//         console.log('Error checking KYC status:', error.message);
//         setKycStatus('pending');
//       } finally {
//         setIsLoadingKYC(false);
//       }
//     };

//     checkKYCStatus();
//   }, [backendUrl, operatorData]);

//   // Fetch dashboard data - SIMPLIFIED VERSION
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         setLoading(true);
//         console.log("Fetching dashboard data...");
        
//         // Check if we have operator data
//         if (!operatorData || !operatorData.token) {
//           console.log("No operator data or token available");
//           toast.error("Please login to access dashboard");
//           setLoading(false);
//           return;
//         }

//         // Test API call first
//         const testResponse = await axios.get(`${backendUrl}/api/test`);
//         console.log("Backend test response:", testResponse.data);

//         // Fetch buses with proper error handling
//         let busesData = [];
//         try {
//           const busesRes = await axios.get(`${backendUrl}/api/operator/bus/buses`, {
//             headers: { Authorization: `Bearer ${operatorData.token}` }
//           });
//           console.log("Buses response:", busesRes.data);
//           busesData = busesRes.data || [];
//         } catch (busError) {
//           console.error("Error fetching buses:", busError);
//           // Continue without buses data
//         }

//         // Fetch bookings with proper error handling
//         let bookingsData = { bookings: [] };
//         try {
//           const bookingsRes = await axios.get(`${backendUrl}/api/operator/bookings`, {
//             headers: { Authorization: `Bearer ${operatorData.token}` }
//           });
//           console.log("Bookings response:", bookingsRes.data);
//           bookingsData = bookingsRes.data || { bookings: [] };
//         } catch (bookingError) {
//           console.error("Error fetching bookings:", bookingError);
//           // Continue without bookings data
//         }

//         // Calculate stats
//         const totalBuses = busesData.length || 0;

//         // Filter completed/confirmed bookings
//         const completedBookings = bookingsData.bookings ?
//           bookingsData.bookings.filter(booking =>
//             booking.status === 'confirmed' || booking.paymentStatus === 'paid'
//           ) : [];

//         // Calculate total revenue from completed bookings
//         const revenue = completedBookings.reduce((total, booking) => {
//           const bookingAmount = booking.price ||
//             (booking.ticketInfo && booking.ticketInfo.totalPrice) || 0;
//           return total + Number(bookingAmount);
//         }, 0);

//         // Get 5 most recent bookings
//         const recentBookings = bookingsData.bookings ?
//           [...bookingsData.bookings]
//             .sort((a, b) => new Date(b.createdAt || b.bookingDate) - new Date(a.createdAt || a.bookingDate))
//             .slice(0, 5) : [];

//         console.log("Setting dashboard data:", {
//           totalBuses,
//           totalCompletedBookings: completedBookings.length,
//           totalRevenue: revenue,
//           recentBookingsCount: recentBookings.length
//         });

//         setDashboardData({
//           totalBuses,
//           totalCompletedBookings: completedBookings.length,
//           totalRevenue: revenue,
//           recentBookings
//         });
        
//       } catch (error) {
//         console.error("Error fetching dashboard data:", error);
//         toast.error("Failed to load dashboard data. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [backendUrl, operatorData]);

//   // Format date for display
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric'
//       });
//     } catch (error) {
//       return 'Invalid Date';
//     }
//   };

//   // Get status class for display
//   const getStatusClass = (status, paymentStatus) => {
//     if (status === 'confirmed' || paymentStatus === 'paid') {
//       return 'bg-green-100 text-green-800';
//     } else if (status === 'canceled' || paymentStatus === 'refunded') {
//       return 'bg-red-100 text-red-800';
//     }
//     return 'bg-yellow-100 text-yellow-800';
//   };

//   // Get display text for status
//   const getStatusText = (status, paymentStatus) => {
//     if (status === 'confirmed' || paymentStatus === 'paid') {
//       return 'Success';
//     } else if (status === 'canceled' || paymentStatus === 'refunded') {
//       return 'Canceled';
//     }
//     return 'Pending';
//   };

//   // Handle view ticket action
//   const handleViewTicket = (booking) => {
//     navigate(`/bus-tickets/invoice?bookingId=${booking.bookingId || booking._id}`);
//   };

//   // Handle KYC button click
//   const handleKYCButtonClick = () => {
//     setShowKYCModal(true);
//   };

//   // Handle KYC step change
//   const handleKYCStepChange = (step) => {
//     setKycStep(step);
//     setPreviewImage(null);
//   };

//   // Handle KYC input change - FIXED VERSION
//   const handleKYCInputChange = (e) => {
//     const { name, value } = e.target;
//     console.log(`Input changed: ${name} = ${value}`); // Debug log
//     setKycData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle KYC file upload
//   const handleKYCFileUpload = (e, fieldName) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Validate file type
//       const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
//       if (!allowedTypes.includes(file.type)) {
//         toast.error('Only PNG, JPG, JPEG, and PDF formats are allowed.');
//         return;
//       }

//       // Validate file size (max 2MB)
//       if (file.size > 2 * 1024 * 1024) {
//         toast.error('File size must be less than 2MB.');
//         return;
//       }

//       setKycData(prev => ({
//         ...prev,
//         [fieldName]: file
//       }));

//       // Create preview for images
//       if (file.type.startsWith('image/')) {
//         const reader = new FileReader();
//         reader.onloadend = () => {
//           setPreviewImage(reader.result);
//         };
//         reader.readAsDataURL(file);
//       }
//     }
//   };

//   // Handle next step in KYC
//   const handleNextStep = async () => {
//     // Validate current step before proceeding
//     if (!validateCurrentStep()) {
//       return;
//     }

//     try {
//       // Save progress (to be implemented)
//       console.log("Saving KYC progress at step:", kycStep);
      
//       if (kycStep < 3) { // Changed from 4 to 3 since we removed bank details
//         setKycStep(prev => prev + 1);
//         setPreviewImage(null);
//       }
//     } catch (error) {
//       toast.error('Failed to save progress');
//     }
//   };

//   // Handle previous step in KYC
//   const handlePrevStep = async () => {
//     try {
//       // Save progress (to be implemented)
//       console.log("Saving KYC progress at step:", kycStep);
      
//       if (kycStep > 1) {
//         setKycStep(prev => prev - 1);
//         setPreviewImage(null);
//       }
//     } catch (error) {
//       toast.error('Failed to save progress');
//     }
//   };

//   // Validate current KYC step - UPDATED (removed bank validation)
//   const validateCurrentStep = () => {
//     switch (kycStep) {
//       case 1: // PAN Details
//         if (!kycData.panNumber || kycData.panNumber.length !== 9) {
//           toast.error('Please enter a valid 9-digit PAN number');
//           return false;
//         }
//         if (!kycData.panImage) {
//           toast.error('Please upload PAN image');
//           return false;
//         }
//         break;
//       case 2: // Business Details
//         if (!kycData.businessName || kycData.businessName.trim() === '') {
//           toast.error('Please enter business name');
//           return false;
//         }
//         if (!kycData.businessAddress || kycData.businessAddress.trim() === '') {
//           toast.error('Please enter business address');
//           return false;
//         }
//         break;
//       case 3: // ID Proof
//         if (!kycData.idProofNumber || kycData.idProofNumber.trim() === '') {
//           toast.error('Please enter ID proof number');
//           return false;
//         }
//         if (!kycData.idProofImage) {
//           toast.error('Please upload ID proof image');
//           return false;
//         }
//         break;
//       // Removed case 4 for bank details
//     }
//     return true;
//   };

//   // Submit KYC for verification
//   const handleKYCSubmit = async () => {
//     if (!validateCurrentStep()) {
//       return;
//     }

//     try {
//       const toastId = toast.loading('Submitting KYC for verification...');
      
//       // Simulate API call (implement this later)
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       toast.update(toastId, {
//         render: 'KYC submitted successfully! Verification may take 2-3 business days.',
//         type: 'success',
//         isLoading: false,
//         autoClose: 5000
//       });

//       setKycStatus('submitted');
//       setShowKYCModal(false);
//     } catch (error) {
//       toast.error('Failed to submit KYC');
//     }
//   };

//   // KYC Status Badge Component
//   const KYCStatusBadge = () => {
//     const statusConfig = {
//       pending: { color: 'bg-yellow-100 text-yellow-800', text: 'KYC Pending', icon: '⏳' },
//       submitted: { color: 'bg-blue-100 text-blue-800', text: 'KYC Submitted', icon: '📤' },
//       verified: { color: 'bg-green-100 text-green-800', text: 'KYC Verified', icon: '✅' },
//       rejected: { color: 'bg-red-100 text-red-800', text: 'KYC Rejected', icon: '❌' }
//     };

//     const config = statusConfig[kycStatus] || statusConfig.pending;

//     if (isLoadingKYC) {
//       return (
//         <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
//           <span className="mr-2">⏳</span>
//           Loading KYC...
//         </div>
//       );
//     }

//     return (
//       <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
//         <span className="mr-2">{config.icon}</span>
//         {config.text}
//       </div>
//     );
//   };

//   // KYC Modal Component
//   const KYCModal = () => {
//     if (!showKYCModal) return null;

//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//         <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//           {/* Modal Header */}
//           <div className="p-6 border-b">
//             <div className="flex justify-between items-center">
//               <div>
//                 <h2 className="text-xl font-bold text-gray-800">Complete KYC Verification</h2>
//                 <p className="text-gray-600 text-sm mt-1">
//                   Step {kycStep} of 3: {getKYCStepTitle(kycStep)} {/* Changed from 4 to 3 */}
//                 </p>
//               </div>
//               <button
//                 onClick={() => setShowKYCModal(false)}
//                 className="text-gray-400 hover:text-gray-600 text-xl"
//               >
//                 ✕
//               </button>
//             </div>

//             {/* Progress Steps - Updated to 3 steps */}
//             <div className="flex justify-between items-center mt-6">
//               {[1, 2, 3].map((step) => ( // Changed from [1, 2, 3, 4] to [1, 2, 3]
//                 <div key={step} className="flex items-center">
//                   <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step <= kycStep ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
//                     {step}
//                   </div>
//                   {step < 3 && ( // Changed from 4 to 3
//                     <div className={`w-16 h-1 ${step < kycStep ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
//                   )}
//                 </div>
//               ))}
//             </div>

//             <div className="flex justify-between text-xs text-gray-500 mt-2">
//               <span>PAN Details</span>
//               <span>Business Details</span>
//               <span>ID Proof</span>
//               {/* Removed Bank Details */}
//             </div>
//           </div>

//           {/* Modal Body - Step Content */}
//           <div className="p-6">
//             {renderKYCStep()}
//           </div>

//           {/* Modal Footer */}
//           <div className="p-6 border-t bg-gray-50">
//             <div className="flex justify-between">
//               <button
//                 onClick={handlePrevStep}
//                 disabled={kycStep === 1}
//                 className={`px-4 py-2 rounded-lg flex items-center ${kycStep === 1 ? 'opacity-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-200'}`}
//               >
//                 <FaArrowLeft className="mr-2" />
//                 Previous
//               </button>
              
//               <div className="space-x-3">
//                 <button
//                   onClick={() => {
//                     setShowKYCModal(false);
//                     toast.info('KYC progress saved locally');
//                   }}
//                   className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
//                 >
//                   Save & Close
//                 </button>
                
//                 {kycStep === 3 ? ( // Changed from 4 to 3
//                   <button
//                     onClick={handleKYCSubmit}
//                     className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
//                   >
//                     <FaCheckCircle className="mr-2" />
//                     Submit for Verification
//                   </button>
//                 ) : (
//                   <button
//                     onClick={handleNextStep}
//                     className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
//                   >
//                     Next Step
//                     <FaArrowRightIcon className="ml-2" />
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // Get KYC step title - UPDATED
//   const getKYCStepTitle = (step) => {
//     switch (step) {
//       case 1: return 'PAN Details';
//       case 2: return 'Business Details';
//       case 3: return 'ID Proof';
//       // Removed case 4 for bank details
//       default: return '';
//     }
//   };

//   // Render KYC step content - FIXED INPUT HANDLING
//   const renderKYCStep = () => {
//     switch (kycStep) {
//       case 1: // PAN Details
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 PAN Number *
//               </label>
//               <input
//                 type="text"
//                 name="panNumber"
//                 value={kycData.panNumber}
//                 onChange={handleKYCInputChange}
//                 onKeyDown={(e) => {
//                   // Allow only numbers and letters
//                   if (!/^[a-zA-Z0-9]$/.test(e.key) && 
//                       e.key !== 'Backspace' && 
//                       e.key !== 'Delete' && 
//                       e.key !== 'Tab' && 
//                       e.key !== 'ArrowLeft' && 
//                       e.key !== 'ArrowRight') {
//                     e.preventDefault();
//                   }
//                 }}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter 9-digit PAN number"
//                 maxLength="9"
//                 autoFocus
//               />
//               <p className="text-xs text-gray-500 mt-1">Format: 9 characters (numbers and letters)</p>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 PAN Card Image *
//               </label>
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//                 {kycData.panImage ? (
//                   <div>
//                     <p className="text-sm text-green-600 mb-2">
//                       ✓ File uploaded: {kycData.panImage.name}
//                     </p>
//                     {previewImage && (
//                       <div className="mt-4">
//                         <img
//                           src={previewImage}
//                           alt="PAN Preview"
//                           className="max-w-xs mx-auto rounded-lg"
//                         />
//                       </div>
//                     )}
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setKycData(prev => ({ ...prev, panImage: null }));
//                         setPreviewImage(null);
//                       }}
//                       className="mt-2 text-sm text-red-600 hover:text-red-800"
//                     >
//                       Remove file
//                     </button>
//                   </div>
//                 ) : (
//                   <div>
//                     <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
//                     <p className="text-sm text-gray-600 mb-2">
//                       Upload PAN card image (PNG, JPG, PDF, max 2MB)
//                     </p>
//                     <label className="cursor-pointer">
//                       <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                         Choose File
//                       </span>
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept=".png,.jpg,.jpeg,.pdf"
//                         onChange={(e) => handleKYCFileUpload(e, 'panImage')}
//                       />
//                     </label>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         );

//       case 2: // Business Details
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Business Name *
//               </label>
//               <input
//                 type="text"
//                 name="businessName"
//                 value={kycData.businessName}
//                 onChange={handleKYCInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter your business name"
//                 autoFocus
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Business Address *
//               </label>
//               <textarea
//                 name="businessAddress"
//                 value={kycData.businessAddress}
//                 onChange={handleKYCInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter complete business address"
//                 rows="3"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Business Registration Number (Optional)
//               </label>
//               <input
//                 type="text"
//                 name="businessRegistrationNumber"
//                 value={kycData.businessRegistrationNumber}
//                 onChange={handleKYCInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="Enter registration number if any"
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Business Registration Document (Optional)
//               </label>
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//                 {kycData.businessRegistrationImage ? (
//                   <div>
//                     <p className="text-sm text-green-600 mb-2">
//                       ✓ File uploaded: {kycData.businessRegistrationImage.name}
//                     </p>
//                     {previewImage && (
//                       <div className="mt-4">
//                         <img
//                           src={previewImage}
//                           alt="Registration Document Preview"
//                           className="max-w-xs mx-auto rounded-lg"
//                         />
//                       </div>
//                     )}
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setKycData(prev => ({ ...prev, businessRegistrationImage: null }));
//                         setPreviewImage(null);
//                       }}
//                       className="mt-2 text-sm text-red-600 hover:text-red-800"
//                     >
//                       Remove file
//                     </button>
//                   </div>
//                 ) : (
//                   <div>
//                     <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
//                     <p className="text-sm text-gray-600 mb-2">
//                       Upload registration document (Optional)
//                     </p>
//                     <label className="cursor-pointer">
//                       <span className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
//                         Choose File
//                       </span>
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept=".png,.jpg,.jpeg,.pdf"
//                         onChange={(e) => handleKYCFileUpload(e, 'businessRegistrationImage')}
//                       />
//                     </label>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         );

//       case 3: // ID Proof
//         return (
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 ID Proof Type *
//               </label>
//               <select
//                 name="idProofType"
//                 value={kycData.idProofType}
//                 onChange={handleKYCInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 autoFocus
//               >
//                 <option value="citizenship">Citizenship</option>
//                 <option value="passport">Passport</option>
//                 <option value="driving-license">Driving License</option>
//               </select>
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 ID Proof Number *
//               </label>
//               <input
//                 type="text"
//                 name="idProofNumber"
//                 value={kycData.idProofNumber}
//                 onChange={handleKYCInputChange}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder={`Enter ${kycData.idProofType} number`}
//               />
//             </div>
            
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 ID Proof Image *
//               </label>
//               <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
//                 {kycData.idProofImage ? (
//                   <div>
//                     <p className="text-sm text-green-600 mb-2">
//                       ✓ File uploaded: {kycData.idProofImage.name}
//                     </p>
//                     {previewImage && (
//                       <div className="mt-4">
//                         <img
//                           src={previewImage}
//                           alt="ID Proof Preview"
//                           className="max-w-xs mx-auto rounded-lg"
//                         />
//                       </div>
//                     )}
//                     <button
//                       type="button"
//                       onClick={() => {
//                         setKycData(prev => ({ ...prev, idProofImage: null }));
//                         setPreviewImage(null);
//                       }}
//                       className="mt-2 text-sm text-red-600 hover:text-red-800"
//                     >
//                       Remove file
//                     </button>
//                   </div>
//                 ) : (
//                   <div>
//                     <FaUpload className="mx-auto text-gray-400 text-2xl mb-2" />
//                     <p className="text-sm text-gray-600 mb-2">
//                       Upload {kycData.idProofType} image (PNG, JPG, PDF, max 2MB)
//                     </p>
//                     <label className="cursor-pointer">
//                       <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//                         Choose File
//                       </span>
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept=".png,.jpg,.jpeg,.pdf"
//                         onChange={(e) => handleKYCFileUpload(e, 'idProofImage')}
//                       />
//                     </label>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         );

//       default:
//         return null;
//     }
//   };

//   // Add error boundary fallback
//   if (loading) {
//     return (
//       <OperatorLayout>
//         <div className="flex flex-col items-center justify-center h-64 space-y-4">
//           <LoadingSpinner />
//           <p className="text-gray-600">Loading dashboard data...</p>
//           <button 
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Refresh Page
//           </button>
//         </div>
//       </OperatorLayout>
//     );
//   }

//   return (
//     <OperatorLayout>
//       {/* Dashboard Header with KYC Status */}
//       <div className="mb-6 md:mb-8">
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
//           <div className="flex items-center space-x-4">
//             <KYCStatusBadge />
//             {kycStatus === 'pending' && (
//               <button
//                 onClick={handleKYCButtonClick}
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
//               >
//                 <FaIdCard className="mr-2" />
//                 Verify KYC
//               </button>
//             )}
//             {kycStatus === 'submitted' && (
//               <button
//                 onClick={handleKYCButtonClick}
//                 className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center"
//               >
//                 <FaIdCard className="mr-2" />
//                 View KYC Status
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Dashboard Stats */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
//         <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
//           <h3 className="text-gray-500 text-xs md:text-sm mb-2">Total Buses</h3>
//           <p className="text-xl md:text-3xl font-bold text-gray-800">{dashboardData.totalBuses}</p>
//           <div className="mt-2">
//             <Link to="/operator/buses" className="text-primary text-xs md:text-sm hover:underline flex items-center">
//               Manage buses <FaArrowRight className="ml-1 text-xs" />
//             </Link>
//           </div>
//         </div>

//         <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
//           <h3 className="text-gray-500 text-xs md:text-sm mb-2">Completed Bookings</h3>
//           <p className="text-xl md:text-3xl font-bold text-gray-800">{dashboardData.totalCompletedBookings}</p>
//           <div className="mt-2">
//             <Link to="/operator/bookings" className="text-primary text-xs md:text-sm hover:underline flex items-center">
//               View all bookings <FaArrowRight className="ml-1 text-xs" />
//             </Link>
//           </div>
//         </div>

//         <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm transition-transform hover:scale-105">
//           <h3 className="text-gray-500 text-xs md:text-sm mb-2">Total Revenue</h3>
//           <p className="text-xl md:text-3xl font-bold text-gray-800">Rs. {dashboardData.totalRevenue.toLocaleString()}</p>
//           <p className="text-xs text-gray-500 mt-2">From completed bookings</p>
//         </div>
//       </div>

//       {/* Recent Bookings Table */}
//       <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 mb-8">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-base md:text-lg font-semibold">Recent Bookings</h2>
//           <Link to="/operator/bookings" className="text-primary hover:text-primary/80 flex items-center text-xs md:text-sm">
//             View all <FaArrowRight className="ml-1" />
//           </Link>
//         </div>

//         {dashboardData.recentBookings.length === 0 ? (
//           <div className="text-center py-6 text-gray-500 text-sm">
//             No bookings found
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             {/* Mobile Booking Cards */}
//             <div className="lg:hidden space-y-4">
//               {dashboardData.recentBookings.map((booking) => (
//                 <div key={booking._id} className="border rounded-lg p-3 hover:bg-gray-50">
//                   <div className="flex justify-between mb-2">
//                     <span className="text-xs font-medium text-gray-500">ID: {booking.bookingId || booking._id}</span>
//                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(booking.status, booking.paymentStatus)}`}>
//                       {getStatusText(booking.status, booking.paymentStatus)}
//                     </span>
//                   </div>
//                   <p className="text-sm font-medium mb-1">
//                     {booking.ticketInfo?.fromLocation || 'N/A'} → {booking.ticketInfo?.toLocation || 'N/A'}
//                   </p>
//                   <p className="text-xs text-gray-500 mb-1">
//                     Passenger: {booking.passengerInfo?.name || 'N/A'}
//                   </p>
//                   <p className="text-xs text-gray-500 mb-1">
//                     Date: {formatDate(booking.ticketInfo?.date || booking.bookingDate)}
//                   </p>
//                   <div className="flex justify-between items-center mt-2">
//                     <p className="text-sm font-medium">
//                       Rs. {booking.price || (booking.ticketInfo && booking.ticketInfo.totalPrice) || 0}
//                     </p>
//                     {(booking.status === 'confirmed' || booking.paymentStatus === 'paid') && (
//                       <button
//                         onClick={() => handleViewTicket(booking)}
//                         className="text-primary hover:text-primary/80 flex items-center text-xs"
//                       >
//                         <FaTicketAlt className="mr-1" /> View Ticket
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Desktop Table */}
//             <table className="hidden lg:table w-full">
//               <thead>
//                 <tr className="text-left text-gray-500 border-b">
//                   <th className="pb-3 pl-3">Booking ID</th>
//                   <th className="pb-3">Passenger</th>
//                   <th className="pb-3">Route</th>
//                   <th className="pb-3">Travel Date</th>
//                   <th className="pb-3">Status</th>
//                   <th className="pb-3">Amount</th>
//                   <th className="pb-3 pr-3">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {dashboardData.recentBookings.map((booking) => (
//                   <tr key={booking._id} className="border-b hover:bg-gray-50">
//                     <td className="py-3 pl-3 pr-2 text-sm">
//                       {booking.bookingId || booking._id}
//                     </td>
//                     <td className="py-3 pr-2 text-sm">
//                       {booking.passengerInfo?.name || 'N/A'}
//                     </td>
//                     <td className="py-3 pr-2 text-sm">
//                       {booking.ticketInfo?.fromLocation || 'N/A'} → {booking.ticketInfo?.toLocation || 'N/A'}
//                     </td>
//                     <td className="py-3 pr-2 text-sm">
//                       {formatDate(booking.ticketInfo?.date || booking.bookingDate)}
//                     </td>
//                     <td className="py-3 pr-2">
//                       <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusClass(booking.status, booking.paymentStatus)}`}>
//                         {getStatusText(booking.status, booking.paymentStatus)}
//                       </span>
//                     </td>
//                     <td className="py-3 pr-2 text-sm font-medium">
//                       Rs. {booking.price || (booking.ticketInfo && booking.ticketInfo.totalPrice) || 0}
//                     </td>
//                     <td className="py-3 pr-3 text-right">
//                       {(booking.status === 'confirmed' || booking.paymentStatus === 'paid') && (
//                         <button
//                           onClick={() => handleViewTicket(booking)}
//                           className="text-primary hover:text-primary/80 flex items-center text-sm"
//                         >
//                           <FaTicketAlt className="mr-1" />Ticket
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* KYC Modal */}
//       <KYCModal />
//     </OperatorLayout>
//   );
// };

// export default OperatorDashboard;