import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  Modal,
  IconButton,
  TextField,
  MenuItem,
  Typography,
  InputAdornment
} from '@mui/material';
import { FaEdit, FaTrash, FaPlusCircle, FaTimes, FaSearch } from 'react-icons/fa';
import { BiCustomize } from "react-icons/bi";
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import { useNavigate } from 'react-router-dom';
import OperatorLayout from '../../../../layout/operator/OperatorLayout';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {
    xs: '90%',
    sm: '80%',
    md: 600
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

const ManageRoutes = () => {
  const { backendUrl, operatorData } = useContext(OperatorAppContext);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buses, setBuses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [deleteConfirmRoute, setDeleteConfirmRoute] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state for adding/editing a route
  const [formData, setFormData] = useState({
    bus: '',
    from: '',
    to: '',
    price: '',
    pickupPoints: [''],
    dropPoints: ['']
  });

  // State for customizing prices (array of { origin, drop, price })
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customPriceData, setCustomPriceData] = useState([]);

  const navigate = useNavigate();
  const handleClose = () => {
    navigate(-1);
  };

  // Fetch routes for the logged-in operator
  const fetchRoutes = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/operator/routes`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      setRoutes(res.data);
    } catch (error) {
      toast.error('Failed to fetch routes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch verified buses for the logged-in operator
  const fetchBuses = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/operator/bus/buses`, {
        headers: { Authorization: `Bearer ${operatorData?.token}` }
      });
      const verifiedBuses = res.data.filter((bus) => bus.verified);
      setBuses(verifiedBuses);
    } catch (error) {
      toast.error('Failed to fetch buses');
    }
  };

  useEffect(() => {
    fetchRoutes();
    fetchBuses();
  }, [backendUrl, operatorData]);

  // Filter routes by bus name, from and to
  const filteredRoutes = routes.filter((route) => {
    const query = searchQuery.toLowerCase();
    const busName = route.bus?.busName?.toLowerCase() || '';
    const from = route.from?.toLowerCase() || '';
    const to = route.to?.toLowerCase() || '';
    return busName.includes(query) || from.includes(query) || to.includes(query);
  });

  // Open modal for adding a new route
  const openModalForAdd = () => {
    setFormData({
      bus: '',
      from: '',
      to: '',
      price: '',
      pickupPoints: [''],
      dropPoints: ['']
    });
    setEditMode(false);
    setSelectedRoute(null);
    setModalOpen(true);
  };

  // Open modal for editing a route
  const openModalForEdit = (route) => {
    setFormData({
      bus: route.bus?._id || '',
      from: route.from,
      to: route.to,
      price: route.price,
      pickupPoints: route.pickupPoints && route.pickupPoints.length > 0 ? route.pickupPoints : [''],
      dropPoints: route.dropPoints && route.dropPoints.length > 0 ? route.dropPoints : ['']
    });
    setSelectedRoute(route);
    setEditMode(true);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRoute(null);
  };

  // Open delete confirmation modal for a route
  const openDeleteConfirmation = (route) => {
    setDeleteConfirmRoute(route);
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmRoute(null);
  };

  // Handle form input changes for add/edit
  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Pickup points handlers
  const handlePickupChange = (e, index) => {
    const newPickups = [...formData.pickupPoints];
    newPickups[index] = e.target.value;
    setFormData((prev) => ({ ...prev, pickupPoints: newPickups }));
  };

  const addPickup = () => {
    setFormData((prev) => ({ ...prev, pickupPoints: [...prev.pickupPoints, ''] }));
  };

  const removePickup = (index) => {
    const newPickups = formData.pickupPoints.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, pickupPoints: newPickups }));
  };

  // Drop points handlers
  const handleDropChange = (e, index) => {
    const newDrops = [...formData.dropPoints];
    newDrops[index] = e.target.value;
    setFormData((prev) => ({ ...prev, dropPoints: newDrops }));
  };

  const addDrop = () => {
    setFormData((prev) => ({ ...prev, dropPoints: [...prev.dropPoints, ''] }));
  };

  const removeDrop = (index) => {
    const newDrops = formData.dropPoints.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, dropPoints: newDrops }));
  };

  // Handle form submission for adding/updating a route
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.bus.trim() ||
      !formData.from.trim() ||
      !formData.to.trim() ||
      formData.price === ''
    ) {
      toast.error('Please fill in Bus, From, To, and Price fields.');
      return;
    }
    if (formData.pickupPoints.some((point) => !point.trim())) {
      toast.error('Please fill in all Pickup Points.');
      return;
    }
    if (formData.dropPoints.some((point) => !point.trim())) {
      toast.error('Please fill in all Drop Points.');
      return;
    }

    try {
      if (editMode && selectedRoute) {
        await axios.put(`${backendUrl}/api/operator/routes/${selectedRoute._id}`, formData, {
          headers: { Authorization: `Bearer ${operatorData?.token}` }
        });
        toast.success('Route updated successfully');
      } else {
        await axios.post(`${backendUrl}/api/operator/routes`, formData, {
          headers: { Authorization: `Bearer ${operatorData?.token}` }
        });
        toast.success('Route added successfully');
      }
      closeModal();
      fetchRoutes();
    } catch (error) {
      toast.error('Failed to save route');
    }
  };

  // ---------- CUSTOMIZE PRICE FUNCTIONS ----------

  // Open customize price modal for a given route
  const openCustomizePriceModal = (route) => {
    let data = [];
    // Section 1: "From" location group (using route.from as origin)
    route.dropPoints.forEach((drop) => {
      const existing = route.customPrices?.find(
        (item) => item.origin === route.from && item.drop === drop
      );
      data.push({ origin: route.from, drop, price: existing ? existing.price : '' });
    });
    // Section 2: For each pickup, include dropPoints and an extra row for the "to" location.
    route.pickupPoints.forEach((pickup) => {
      route.dropPoints.forEach((drop) => {
        const existing = route.customPrices?.find(
          (item) => item.origin === pickup && item.drop === drop
        );
        data.push({ origin: pickup, drop, price: existing ? existing.price : '' });
      });
      // Extra row for "to" location for this pickup
      const existingTo = route.customPrices?.find(
        (item) => item.origin === pickup && item.drop === route.to
      );
      data.push({ origin: pickup, drop: route.to, price: existingTo ? existingTo.price : '' });
    });
    setCustomPriceData(data);
    setSelectedRoute(route);
    setCustomModalOpen(true);
  };

  // Handle price change in customize modal
  const handleCustomPriceChange = (index, value) => {
    const updated = [...customPriceData];
    updated[index].price = value;
    setCustomPriceData(updated);
  };

  // Apply same price for all rows in a given group (by origin)
  const applySameForOrigin = (origin, value) => {
    const updated = customPriceData.map((item) =>
      item.origin === origin ? { ...item, price: value } : item
    );
    setCustomPriceData(updated);
  };

  // Submit customized prices to backend
  const handleCustomPriceSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `${backendUrl}/api/operator/routes/customize/${selectedRoute._id}`,
        { customPrices: customPriceData },
        { headers: { Authorization: `Bearer ${operatorData?.token}` } }
      );
      toast.success('Customized prices updated successfully');
      setCustomModalOpen(false);
      fetchRoutes();
    } catch (error) {
      toast.error('Failed to update customized prices');
    }
  };

  const closeCustomModal = () => {
    setCustomModalOpen(false);
    setSelectedRoute(null);
  };

  // -------------------------------------------------

  // return (
  //   <OperatorLayout>
  //     <div className="p-2 sm:p-4 md:p-6">
  //       <div className="max-w-8xl mx-auto p-2 sm:p-4 md:p-8">
  //         {/* Header */}
  //         <div className="bg-white rounded-2xl shadow-lg p-3 sm:p-5 md:p-8">
  //           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
  //             <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-0">Manage Your Routes</h1>
  //             <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
  //               <Button
  //                 variant="contained"
  //                 color="primary"
  //                 onClick={openModalForAdd}
  //                 startIcon={<FaPlusCircle />}
  //                 fullWidth
  //                 className="sm:w-auto"
  //               >
  //                 Add New Route
  //               </Button>
  //               <button
  //                 onClick={handleClose}
  //                 className="p-2 text-red-600 hover:bg-gray-100 rounded-full transition-colors"
  //                 aria-label="Close"
  //               >
  //                 <FaTimes className="w-5 h-5 sm:w-6 sm:h-6" />
  //               </button>
  //             </div>
  //           </div>
  //           <hr className="my-4 sm:my-8 md:my-14 border-gray-300" />

  //           {/* Search Input */}
  //           <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row gap-2">
  //             <TextField
  //               label="Search routes by Bus Name, From or To"
  //               variant="outlined"
  //               size="small"
  //               fullWidth
  //               value={searchQuery}
  //               onChange={(e) => setSearchQuery(e.target.value)}
  //               InputProps={{
  //                 startAdornment: (
  //                   <InputAdornment position="start">
  //                     <FaSearch />
  //                   </InputAdornment>
  //                 )
  //               }}
  //             />
  //             <Button
  //               variant="contained"
  //               color="primary"
  //               onClick={() => { }}
  //               className="w-full sm:w-auto"
  //             >
  //               Search
  //             </Button>
  //           </div>
  //           <hr className="my-4 sm:my-6 md:my-8 border-gray-300" />

  //           {loading ? (
  //             <p>Loading routes...</p>
  //           ) : filteredRoutes.length === 0 ? (
  //             <p>No routes found.</p>
  //           ) : (
  //             <div className="grid gap-6 sm:gap-10 md:gap-14 grid-cols-1 md:grid-cols-2">
  //               {filteredRoutes.map((route) => (
  //                 <div
  //                   key={route._id}
  //                   className="relative border rounded-lg p-3 sm:p-4 shadow-md hover:shadow-xl transition-shadow bg-white w-full mx-auto"
  //                 >
  //                   <Typography variant="body1" className="mb-2">
  //                     <strong>Bus:</strong> {route.bus?.busName || 'N/A'} ({route.bus?.busNumber || 'N/A'})
  //                   </Typography>
  //                   <hr className="my-3 sm:my-4 border-gray-300" />
  //                   <Typography variant="body1" className="mb-2">
  //                     <strong>From:</strong> {route.from}
  //                   </Typography>
  //                   <hr className="my-2 border-gray-300" />
  //                   <Typography variant="body1" className="mb-2">
  //                     <strong>To:</strong> {route.to}
  //                   </Typography>
  //                   <hr className="my-2 border-gray-300" />
  //                   <Typography variant="body1" className="mb-2">
  //                     <strong>Price NPR:</strong>
  //                   </Typography>
  //                   <Typography variant="body1" className="mb-2">
  //                     Rs. {route.price}
  //                   </Typography>
  //                   <hr className="my-2 border-gray-300" />
  //                   <Typography variant="body2" className="mb-2">
  //                     <strong>Pickup Points:</strong>
  //                     <ul className="ml-4 list-disc max-h-[100px] overflow-y-auto">
  //                       {route.pickupPoints.map((point, idx) => (
  //                         <li key={idx}>{point}</li>
  //                       ))}
  //                     </ul>
  //                   </Typography>
  //                   <hr className="my-2 border-gray-300" />
  //                   <Typography variant="body2" className="mb-2">
  //                     <strong>Drop Points:</strong>
  //                     <ul className="ml-4 list-disc max-h-[100px] overflow-y-auto">
  //                       {route.dropPoints.map((point, idx) => (
  //                         <li key={idx}>{point}</li>
  //                       ))}
  //                     </ul>
  //                   </Typography>
  //                   {/* New Section: Custom Price Data */}
  //                   {route.customPrices && route.customPrices.length > 0 && (
  //                     <>
  //                       <hr className="my-2 border-gray-300" />
  //                       <Typography variant="body2" className="mb-2">
  //                         <strong>Custom Prices:</strong>
  //                       </Typography>
  //                       <div className="max-h-[150px] overflow-y-auto">
  //                         <ul className="ml-4 list-disc">
  //                           {route.customPrices.map((item, idx) => (
  //                             <li key={idx}>
  //                               {item.origin} → {item.drop}: Rs. {item.price}
  //                             </li>
  //                           ))}
  //                         </ul>
  //                       </div>
  //                     </>
  //                   )}
  //                   <div className="mt-6 sm:mt-8 flex flex-wrap gap-2 sm:gap-4">
  //                     <Button
  //                       variant="outlined"
  //                       size="small"
  //                       startIcon={<FaEdit />}
  //                       onClick={() => openModalForEdit(route)}
  //                       className="text-xs sm:text-sm"
  //                     >
  //                       Edit
  //                     </Button>
  //                     <Button
  //                       variant="outlined"
  //                       size="small"
  //                       startIcon={<BiCustomize />}
  //                       onClick={() => openCustomizePriceModal(route)}
  //                       className="text-xs sm:text-sm"
  //                     >
  //                       Customize Price
  //                     </Button>
  //                     <Button
  //                       variant="contained"
  //                       size="small"
  //                       color="error"
  //                       startIcon={<FaTrash />}
  //                       onClick={() => openDeleteConfirmation(route)}
  //                       className="text-xs sm:text-sm"
  //                     >
  //                       Delete
  //                     </Button>
  //                   </div>
  //                 </div>
  //               ))}
  //             </div>
  //           )}
  //         </div>

  //         {/* Modal for Add/Edit Route */}
  //         <Modal open={modalOpen} onClose={closeModal}>
  //           <Box sx={modalStyle}>
  //             <div className="flex justify-between items-center mb-2 sm:mb-4">
  //               <Typography variant="h5" className="text-lg sm:text-xl md:text-2xl">
  //                 {editMode ? 'Edit Route' : 'Add New Route'}
  //               </Typography>
  //               <IconButton onClick={closeModal}>
  //                 <FaTimes className="text-red-600" />
  //               </IconButton>
  //             </div>
  //             <div className="mt-1 text-xs sm:text-sm bg-amber-50 border border-amber-200 rounded p-2 mb-3">
  //               <p className="flex items-center text-amber-700">
  //                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  //                 </svg>
  //                 Note: Only verified buses will show in the Select Bus dropdown.
  //               </p>
  //             </div>
  //             <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
  //               <TextField
  //                 select
  //                 label="Select Bus"
  //                 name="bus"
  //                 value={formData.bus}
  //                 onChange={handleInputChange}
  //                 fullWidth
  //                 size="small"
  //               >
  //                 {buses.map((bus) => (
  //                   <MenuItem key={bus._id} value={bus._id}>
  //                     {bus.busName} ({bus.busNumber})
  //                   </MenuItem>
  //                 ))}
  //               </TextField>
  //               <TextField
  //                 label="From"
  //                 name="from"
  //                 value={formData.from}
  //                 onChange={handleInputChange}
  //                 fullWidth
  //                 size="small"
  //               />
  //               <TextField
  //                 label="To"
  //                 name="to"
  //                 value={formData.to}
  //                 onChange={handleInputChange}
  //                 fullWidth
  //                 size="small"
  //               />
  //               <TextField
  //                 label="Price"
  //                 name="price"
  //                 type="number"
  //                 value={formData.price}
  //                 onChange={handleInputChange}
  //                 fullWidth
  //                 size="small"
  //                 InputProps={{
  //                   startAdornment: <InputAdornment position="start">Rs. </InputAdornment>
  //                 }}
  //               />
  //               <Box>
  //                 <Typography variant="subtitle2" className="mb-1 pb-1 sm:pb-2">
  //                   Pickup Points
  //                 </Typography>
  //                 <div className="max-h-[200px] overflow-y-auto pr-1">
  //                   {formData.pickupPoints.map((point, index) => (
  //                     <Box key={index} className="flex items-center gap-2 mb-2 sm:mb-4">
  //                       <TextField
  //                         label={`Pickup Point ${index + 1}`}
  //                         value={point}
  //                         onChange={(e) => handlePickupChange(e, index)}
  //                         fullWidth
  //                         size="small"
  //                       />
  //                       <IconButton
  //                         onClick={() => removePickup(index)}
  //                         disabled={formData.pickupPoints.length === 1}
  //                         size="small"
  //                       >
  //                         <FaTimes className="text-red-600 text-sm" />
  //                       </IconButton>
  //                     </Box>
  //                   ))}
  //                 </div>
  //                 <Button variant="outlined" size="small" startIcon={<FaPlusCircle />} onClick={addPickup}>
  //                   Add Pickup Point
  //                 </Button>
  //               </Box>
  //               <Box>
  //                 <Typography variant="subtitle2" className="mb-1 pb-1 sm:pb-2">
  //                   Drop Points
  //                 </Typography>
  //                 <div className="max-h-[200px] overflow-y-auto pr-1">
  //                   {formData.dropPoints.map((point, index) => (
  //                     <Box key={index} className="flex items-center gap-2 mb-2 sm:mb-4">
  //                       <TextField
  //                         label={`Drop Point ${index + 1}`}
  //                         value={point}
  //                         onChange={(e) => handleDropChange(e, index)}
  //                         fullWidth
  //                         size="small"
  //                       />
  //                       <IconButton
  //                         onClick={() => removeDrop(index)}
  //                         disabled={formData.dropPoints.length === 1}
  //                         size="small"
  //                       >
  //                         <FaTimes className="text-red-600 text-sm" />
  //                       </IconButton>
  //                     </Box>
  //                   ))}
  //                 </div>
  //                 <Button variant="outlined" size="small" startIcon={<FaPlusCircle />} onClick={addDrop}>
  //                   Add Drop Point
  //                 </Button>
  //               </Box>
  //               <Box className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-4 mt-4">
  //                 <Button
  //                   variant="outlined"
  //                   onClick={closeModal}
  //                   fullWidth
  //                   className="xs:w-auto"
  //                 >
  //                   Cancel
  //                 </Button>
  //                 <Button
  //                   variant="contained"
  //                   color="primary"
  //                   type="submit"
  //                   fullWidth
  //                   className="xs:w-auto"
  //                 >
  //                   {editMode ? 'Update Route' : 'Add Route'}
  //                 </Button>
  //               </Box>
  //             </form>
  //           </Box>
  //         </Modal>

  //         {/* Modal for Customize Price */}
  //         <Modal open={customModalOpen} onClose={closeCustomModal}>
  //           <Box sx={modalStyle}>
  //             <div className="flex justify-between items-center mb-2 sm:mb-4">
  //               <Typography variant="h5" className="text-lg sm:text-xl md:text-2xl">Customize Prices</Typography>
  //               <IconButton onClick={closeCustomModal}>
  //                 <FaTimes className="text-red-600" />
  //               </IconButton>
  //             </div>
  //             {selectedRoute && (
  //               <>
  //                 <Typography variant="subtitle1" className="mb-2">
  //                   Route: {selectedRoute.from} - {selectedRoute.to}
  //                 </Typography>
  //                 <div className="max-h-[65vh] overflow-y-auto pr-1">
  //                   {/* Section 1: From Location to All Drop Locations */}
  //                   <Box className="mb-4 border p-2 rounded">
  //                     <Typography variant="subtitle2" className="mb-1">
  //                       From: {selectedRoute.from} - All Drop Locations
  //                     </Typography>
  //                     <Box className="mb-2 pt-2 sm:pt-3">
  //                       <TextField
  //                         label="Apply same price for all"
  //                         type="number"
  //                         size="small"
  //                         InputProps={{
  //                           startAdornment: <InputAdornment position="start">Rs. </InputAdornment>
  //                         }}
  //                         onChange={(e) => applySameForOrigin(selectedRoute.from, e.target.value)}
  //                       />
  //                     </Box>
  //                     {customPriceData
  //                       .filter((item) => item.origin === selectedRoute.from)
  //                       .map((item, idx) => (
  //                         <Box key={`from-${item.drop}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
  //                           <Typography className="w-full sm:w-2/3 text-sm">
  //                             {selectedRoute.from} - {item.drop}
  //                           </Typography>
  //                           <TextField
  //                             label="Price"
  //                             type="number"
  //                             size="small"
  //                             value={item.price}
  //                             onChange={(e) => {
  //                               const index = customPriceData.findIndex(
  //                                 (i) => i.origin === selectedRoute.from && i.drop === item.drop
  //                               );
  //                               if (index !== -1) handleCustomPriceChange(index, e.target.value);
  //                             }}
  //                             InputProps={{
  //                               startAdornment: <InputAdornment position="start">Rs. </InputAdornment>
  //                             }}
  //                             fullWidth
  //                             className="sm:w-auto"
  //                           />
  //                         </Box>
  //                       ))}
  //                   </Box>
  //                   {/* Section 2: For each Pickup Location (including an extra row for the 'to' location) */}
  //                   {selectedRoute.pickupPoints.map((pickup) => {
  //                     const group = customPriceData.filter((item) => item.origin === pickup);
  //                     return (
  //                       <Box key={pickup} className="mb-4 border p-2 rounded">
  //                         <Typography variant="subtitle2" className="mb-1">
  //                           Pickup: {pickup} - All Drop Locations
  //                         </Typography>
  //                         <Box className="mb-2 pt-2 sm:pt-3">
  //                           <TextField
  //                             label="Apply same price for all"
  //                             type="number"
  //                             size="small"
  //                             InputProps={{
  //                               startAdornment: <InputAdornment position="start">Rs. </InputAdornment>
  //                             }}
  //                             onChange={(e) => applySameForOrigin(pickup, e.target.value)}
  //                           />
  //                         </Box>
  //                         {group.map((item) => (
  //                           <Box key={`${pickup}-${item.drop}`} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-3">
  //                             <Typography className="w-full sm:w-2/3 text-sm">
  //                               {pickup} - {item.drop}
  //                             </Typography>
  //                             <TextField
  //                               label="Price"
  //                               type="number"
  //                               size="small"
  //                               value={item.price}
  //                               onChange={(e) => {
  //                                 const index = customPriceData.findIndex(
  //                                   (i) => i.origin === pickup && i.drop === item.drop
  //                                 );
  //                                 if (index !== -1) handleCustomPriceChange(index, e.target.value);
  //                               }}
  //                               InputProps={{
  //                                 startAdornment: <InputAdornment position="start">Rs. </InputAdornment>
  //                               }}
  //                               fullWidth
  //                               className="sm:w-auto"
  //                             />
  //                           </Box>
  //                         ))}
  //                       </Box>
  //                     );
  //                   })}
  //                 </div>
  //                 <Box className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-4 mt-4">
  //                   <Button
  //                     variant="outlined"
  //                     onClick={closeCustomModal}
  //                     fullWidth
  //                     className="xs:w-auto"
  //                   >
  //                     Cancel
  //                   </Button>
  //                   <Button
  //                     variant="contained"
  //                     color="primary"
  //                     onClick={handleCustomPriceSubmit}
  //                     fullWidth
  //                     className="xs:w-auto"
  //                   >
  //                     Save Customized Prices
  //                   </Button>
  //                 </Box>
  //               </>
  //             )}
  //           </Box>
  //         </Modal>

  //         {/* Delete Confirmation Modal */}
  //         <Modal open={Boolean(deleteConfirmRoute)} onClose={closeDeleteConfirmation}>
  //           <Box sx={deleteModalStyle}>
  //             <Typography variant="h5" className="text-lg sm:text-xl mb-2">
  //               Warning
  //             </Typography>
  //             <Typography variant="body1" className="mb-4">
  //               Are you sure you want to delete the route from{' '}
  //               <strong>{deleteConfirmRoute?.from}</strong> to{' '}
  //               <strong>{deleteConfirmRoute?.to}</strong>?
  //             </Typography>
  //             <Box className="flex flex-col xs:flex-row justify-end gap-2">
  //               <Button
  //                 variant="outlined"
  //                 onClick={closeDeleteConfirmation}
  //                 fullWidth
  //                 className="xs:w-auto"
  //                 size="small"
  //               >
  //                 Cancel
  //               </Button>
  //               <Button
  //                 variant="contained"
  //                 color="error"
  //                 fullWidth
  //                 className="xs:w-auto"
  //                 size="small"
  //                 onClick={async () => {
  //                   try {
  //                     await axios.delete(`${backendUrl}/api/operator/routes/${deleteConfirmRoute._id}`, {
  //                       headers: { Authorization: `Bearer ${operatorData?.token}` }
  //                     });
  //                     toast.success('Route deleted successfully');
  //                     closeDeleteConfirmation();
  //                     fetchRoutes();
  //                   } catch (error) {
  //                     toast.error('Failed to delete route');
  //                   }
  //                 }}
  //               >
  //                 Delete
  //               </Button>
  //             </Box>
  //           </Box>
  //         </Modal>
  //       </div>
  //     </div>
  //   </OperatorLayout>
  // );
};

export default ManageRoutes;