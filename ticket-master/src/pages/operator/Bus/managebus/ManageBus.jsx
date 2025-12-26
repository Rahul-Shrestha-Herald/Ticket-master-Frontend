import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { OperatorAppContext } from '../../../../context/OperatorAppContext';
import { FaEye, FaTrash, FaEdit, FaTimes, FaPlusCircle, FaImage, FaSearch } from 'react-icons/fa';
import { Modal, Box, Button, IconButton, Input, TextareaAutosize, TextField, InputAdornment } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import OperatorLayout from '../../../../layout/operator/OperatorLayout';
import LoadingSpinner from '../../../../components/loading/LoadingSpinner';

const ManageBus = () => {
    const { backendUrl, operatorData } = useContext(OperatorAppContext);
    const [buses, setBuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBus, setSelectedBus] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
    const [busToDelete, setBusToDelete] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredBuses = buses.filter((bus) =>
        bus.busName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // formData holds existing field values (including preview URLs)
    const [formData, setFormData] = useState({
        busDescription: '',
        primaryContactNumber: '',
        secondaryContactNumber: '',
        reservationPolicies: [],
        amenities: [],
        images: {
            front: '',
            back: '',
            left: '',
            right: ''
        },
        documents: {
            bluebook: '',
            roadPermit: '',
            insurance: ''
        }
    });

    // These states will store any new file objects selected by the operator
    const [newImages, setNewImages] = useState({});
    const [newDocuments, setNewDocuments] = useState({});

    // Store file names for uploads
    const [fileNames, setFileNames] = useState({});

    // Fetch operator's buses
    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const res = await axios.get(`${backendUrl}/api/operator/bus/buses`, {
                    headers: { Authorization: `Bearer ${operatorData?.token}` }
                });
                setBuses(res.data);
            } catch (error) {
                toast.error('Failed to fetch buses');
            } finally {
                setLoading(false);
            }
        };
        fetchBuses();
    }, [backendUrl, operatorData]);

    // Delete handlers
    const handleDelete = (bus) => {
        setBusToDelete(bus);
        setConfirmDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`${backendUrl}/api/operator/bus/buses/${busToDelete._id}`, {
                headers: { Authorization: `Bearer ${operatorData?.token}` }
            });
            setBuses(prev => prev.filter(bus => bus._id !== busToDelete._id));
            toast.success('Bus deleted successfully');
            setConfirmDeleteModal(false);
            setBusToDelete(null);
        } catch (error) {
            toast.error('Failed to delete bus');
        }
    };

    const cancelDelete = () => {
        setConfirmDeleteModal(false);
        setBusToDelete(null);
    };

    // Open Details Modal and load bus details into form state
    const handleViewDetails = (bus) => {
        setSelectedBus(bus);
        setFormData({
            busDescription: bus.busDescription || '',
            primaryContactNumber: bus.primaryContactNumber || '',
            secondaryContactNumber: bus.secondaryContactNumber || '',
            reservationPolicies: bus.reservationPolicies || [],
            amenities: bus.amenities || [],
            images: {
                front: bus.images?.front || '',
                back: bus.images?.back || '',
                left: bus.images?.left || '',
                right: bus.images?.right || ''
            },
            documents: {
                bluebook: bus.documents?.bluebook || '',
                roadPermit: bus.documents?.roadPermit || '',
                insurance: bus.documents?.insurance || ''
            }
        });
        // Clear any previously stored file names
        setFileNames({});
        // Clear any previously stored new files
        setNewImages({});
        setNewDocuments({});
        setModalOpen(true);
        setEditMode(false);
    };

    // Generic input change (for text fields such as description)
    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // --- Reservation Policies Handlers ---
    const handlePolicyChange = (e, index) => {
        const newPolicies = [...formData.reservationPolicies];
        newPolicies[index] = e.target.value;
        setFormData(prev => ({ ...prev, reservationPolicies: newPolicies }));
    };

    const addPolicy = () => {
        setFormData(prev => ({ ...prev, reservationPolicies: [...prev.reservationPolicies, ''] }));
    };

    const removePolicy = (index) => {
        const newPolicies = formData.reservationPolicies.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, reservationPolicies: newPolicies }));
    };

    // --- Amenities Handlers ---
    const handleAmenityChange = (e, index) => {
        const newAmenities = [...formData.amenities];
        newAmenities[index] = e.target.value;
        setFormData(prev => ({ ...prev, amenities: newAmenities }));
    };

    const addAmenity = () => {
        setFormData(prev => ({ ...prev, amenities: [...prev.amenities, ''] }));
    };

    const removeAmenity = (index) => {
        const newAmenities = formData.amenities.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, amenities: newAmenities }));
    };

    // Helper: Open image in a new tab - revert to original behavior to direct link
    const handleOpenImage = (url) => {
        if (!url) {
            toast.error('Image not found');
            return;
        }

        // Open directly using the original URL without proxy
        window.open(url, '_blank');
    };

    // Simple text display for image URLs instead of preview component
    const ImageUrlDisplay = ({ url, fileName }) => {
        if (!url) return <div className="text-gray-400 text-sm">No image selected</div>;

        // For blob URLs (new image selections), show the file name
        if (url.startsWith('blob:') && fileName) {
            return (
                <div className="text-sm text-gray-500 break-all">
                    <span className="text-green-600 font-medium">Selected: {fileName}</span>
                </div>
            );
        }

        // In edit mode for existing URLs, show the URL text
        if (editMode) {
            return <div className="text-sm text-gray-500 mt-1 break-all">{url}</div>;
        }

        // In view mode, don't show URLs
        return null;
    };

    // --- Bus Image Upload Handler ---
    const handleImageUpload = (e, position) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file.');
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            toast.error('Image must be less than 1MB.');
            return;
        }
        // Create a preview URL
        const previewUrl = URL.createObjectURL(file);
        // Update the preview in formData for immediate UI feedback
        setFormData(prev => ({
            ...prev,
            images: {
                ...prev.images,
                [position]: previewUrl
            }
        }));
        // Save the file object in newImages to upload later
        setNewImages(prev => ({
            ...prev,
            [position]: file
        }));

        // Store the file name
        setFileNames(prev => ({
            ...prev,
            [position]: file.name
        }));
    };

    // --- Document Image Upload Handler ---
    const handleDocumentUpload = (e, docKey) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error('Please upload a valid image file.');
            return;
        }
        if (file.size > 1 * 1024 * 1024) {
            toast.error('Image must be less than 1MB.');
            return;
        }
        const previewUrl = URL.createObjectURL(file);
        setFormData(prev => ({
            ...prev,
            documents: {
                ...prev.documents,
                [docKey]: previewUrl
            }
        }));
        setNewDocuments(prev => ({
            ...prev,
            [docKey]: file
        }));

        // Store the file name
        setFileNames(prev => ({
            ...prev,
            [docKey]: file.name
        }));
    };

    // Save changes handler: uploads any new files to drive then updates bus details.
    const handleSaveChanges = async () => {
        try {
            // Validate required fields
            if (formData.reservationPolicies.length === 0) {
                toast.error('At least one reservation policy is required');
                return;
            }
            if (formData.amenities.length === 0) {
                toast.error('At least one amenity is required');
                return;
            }
            if (!formData.primaryContactNumber) {
                toast.error('Primary Contact Number is required');
                return;
            }

            // Show a loading toast for image uploads.
            const uploadToastId = toast.loading("Uploading image, please wait...");

            // Start with the existing images from the selected bus (which should be Drive URLs)
            let updatedImages = {
                front: selectedBus.images?.front || '',
                back: selectedBus.images?.back || '',
                left: selectedBus.images?.left || '',
                right: selectedBus.images?.right || ''
            };

            // Upload any new image files to Google Drive
            for (const position in newImages) {
                const file = newImages[position];
                const data = new FormData();
                data.append('file', file);
                data.append('type', position);

                // Call your upload endpoint to upload file to drive.
                const res = await axios.post(`${backendUrl}/api/operator/bus/upload-file`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${operatorData?.token}`
                    }
                });

                // Make sure we got a valid Drive URL back
                if (res.data.success && res.data.driveUrl) {
                    console.log(`Uploaded ${position} image, received Drive URL: ${res.data.driveUrl}`);
                    updatedImages[position] = res.data.driveUrl;
                } else {
                    toast.error(`Failed to upload ${position} image`);
                }
            }

            // Updated documents: only if bus is unverified.
            let updatedDocuments = { ...selectedBus.documents };
            if (!selectedBus.verified) {
                for (const docKey in newDocuments) {
                    const file = newDocuments[docKey];
                    const data = new FormData();
                    data.append('file', file);
                    data.append('type', docKey);
                    const res = await axios.post(`${backendUrl}/api/operator/bus/upload-file`, data, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                            Authorization: `Bearer ${operatorData?.token}`
                        }
                    });

                    if (res.data.success && res.data.driveUrl) {
                        updatedDocuments[docKey] = res.data.driveUrl;
                    } else {
                        toast.error(`Failed to upload ${docKey} document`);
                    }
                }
            }

            // Dismiss the loading toast once uploads are finished.
            toast.dismiss(uploadToastId);

            const updatedData = {
                busDescription: formData.busDescription,
                primaryContactNumber: formData.primaryContactNumber,
                secondaryContactNumber: formData.secondaryContactNumber,
                reservationPolicies: formData.reservationPolicies.filter(policy => policy.trim() !== ''),
                amenities: formData.amenities.filter(amenity => amenity.trim() !== ''),
                images: updatedImages,
                ...(selectedBus.verified ? {} : { documents: updatedDocuments })
            };

            // Log what we're saving to help debug
            console.log('Saving updated bus data:', updatedData);

            const res = await axios.put(
                `${backendUrl}/api/operator/bus/buses/${selectedBus._id}`,
                updatedData,
                { headers: { Authorization: `Bearer ${operatorData?.token}` } }
            );

            // Update the bus list with the new data
            setBuses(prev => prev.map(bus => bus._id === selectedBus._id ? res.data.bus : bus));

            // Update the selected bus with the latest data (with Drive URLs)
            setSelectedBus(res.data.bus);

            // Update formData with the new Drive URLs for consistency
            setFormData(prev => ({
                ...prev,
                images: updatedImages,
                documents: updatedDocuments
            }));

            toast.success('Bus details updated successfully');
            setEditMode(false);

            // Clear the new files state after successful upload.
            setNewImages({});
            setNewDocuments({});
        } catch (error) {
            console.error('Error updating bus:', error);
            toast.error('Failed to update bus details: ' + (error.response?.data?.message || error.message));
        }
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: {
            xs: '90%',
            sm: '500px',
            md: '600px'
        },
        maxWidth: '95vw',
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: {
            xs: 2,
            sm: 4
        },
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '4px'
    };

    const navigate = useNavigate();

    const handleClose = () => {
        navigate(-1); // Go back to previous page
    };

    return (
        <OperatorLayout>
            <div className="px-4 py-6">
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                        <h1 className="text-xl md:text-3xl font-bold text-gray-800 mb-4 md:mb-0">Manage Your Buses</h1>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                            <Link to="/operator/add-bus" className="w-full sm:w-auto">
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<FaPlusCircle />}
                                    fullWidth
                                    className="whitespace-nowrap"
                                >
                                    Add New Bus
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="mb-6">
                        <TextField
                            label="Search by Bus Name or Bus Number"
                            variant="outlined"
                            fullWidth
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
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <LoadingSpinner />
                        </div>
                    ) : filteredBuses.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-lg">
                            <p className="text-gray-500">No buses found. Add your first bus to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBuses.map((bus) => (
                                <div key={bus._id} className="relative border rounded-lg p-4 shadow-md hover:shadow-xl transition-shadow bg-white">
                                    {/* Verified Status Badge */}
                                    <div className="absolute top-4 right-4">
                                        {bus.verified ? (
                                            <div className="px-2 py-1 rounded-xl text-green-700 border border-green-700 bg-green-100 text-xs font-semibold">
                                                Verified
                                            </div>
                                        ) : (
                                            <div className="px-2 py-1 rounded-xl text-red-700 border border-red-700 bg-red-100 text-xs font-semibold">
                                                Unverified
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="text-xl font-semibold mb-1 pr-20">{bus.busName}</h2>
                                    <p className="text-gray-600 mb-4">Bus Number: {bus.busNumber}</p>

                                    <div className="flex flex-col sm:flex-row gap-2 mt-4">
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<FaEye />}
                                            onClick={() => handleViewDetails(bus)}
                                            fullWidth
                                            size="small"
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<FaTrash />}
                                            onClick={() => handleDelete(bus)}
                                            fullWidth
                                            size="small"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Delete Confirmation Modal */}
                    <Modal open={confirmDeleteModal} onClose={cancelDelete}>
                        <Box sx={modalStyle}>
                            <h2 className="text-lg md:text-xl font-bold mb-4">Confirm Deletion</h2>
                            <p className="mb-6">
                                Are you sure you want to delete the bus <strong>{busToDelete?.busName}</strong>?
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-end">
                                <Button
                                    variant="outlined"
                                    onClick={cancelDelete}
                                    fullWidth
                                    className="sm:w-auto"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={confirmDelete}
                                    fullWidth
                                    className="sm:w-auto"
                                >
                                    Delete
                                </Button>
                            </div>
                        </Box>
                    </Modal>

                    {/* Bus Details Modal */}
                    {selectedBus && (
                        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                            <Box sx={modalStyle}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg md:text-2xl font-bold break-words pr-4">{selectedBus.busName} Details</h2>
                                    <IconButton onClick={() => setModalOpen(false)} size="small">
                                        <FaTimes className="text-red-600" />
                                    </IconButton>
                                </div>
                                {!editMode ? (
                                    <div className="text-sm md:text-base">
                                        <p>
                                            <strong>Bus Number:</strong> {selectedBus.busNumber}
                                        </p>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Bus Description</label>
                                                <p className="text-gray-900">{formData.busDescription || 'No description provided'}</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Contact Number</label>
                                                <p className="text-gray-900">{formData.primaryContactNumber || 'No primary contact provided'}</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Contact Number</label>
                                                <p className="text-gray-900">{formData.secondaryContactNumber || 'No secondary contact provided'}</p>
                                            </div>
                                        </div>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-2">
                                            <strong>Reservation Policies:</strong>
                                            {selectedBus.reservationPolicies && selectedBus.reservationPolicies.length > 0 ? (
                                                <ul className="ml-4 list-disc mt-1">
                                                    {selectedBus.reservationPolicies.map((policy, index) => (
                                                        <li key={index}>{policy}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="ml-4">N/A</p>
                                            )}
                                        </div>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-2">
                                            <strong>Amenities:</strong>
                                            {selectedBus.amenities && selectedBus.amenities.length > 0 ? (
                                                <ul className="ml-4 list-disc mt-1">
                                                    {selectedBus.amenities.map((amenity, index) => (
                                                        <li key={index}>{amenity}</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <p className="ml-4">N/A</p>
                                            )}
                                        </div>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-2">
                                            <strong>Document Images:</strong>
                                            <div className="mt-1 text-xs md:text-sm bg-amber-50 border border-amber-200 rounded p-2 mb-3">
                                                <p className="flex items-center text-amber-700">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Note: Sign in to your Google account with the same operator email to view document images.
                                                </p>
                                            </div>
                                            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {selectedBus.documents ? (
                                                    Object.entries(selectedBus.documents).map(([key, url], idx) => (
                                                        <div key={idx} className="flex flex-col gap-2">
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<FaImage />}
                                                                onClick={() => handleOpenImage(url)}
                                                                className="w-fit"
                                                            >
                                                                View {key.charAt(0).toUpperCase() + key.slice(1)}
                                                            </Button>
                                                            <ImageUrlDisplay url={url} fileName={fileNames[key]} />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>N/A</p>
                                                )}
                                            </div>
                                        </div>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-2">
                                            <strong>Bus Images:</strong>
                                            <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {selectedBus.images ? (
                                                    Object.entries(selectedBus.images).map(([key, url], idx) => (
                                                        <div key={idx} className="flex flex-col gap-2">
                                                            <Button
                                                                variant="outlined"
                                                                size="small"
                                                                startIcon={<FaImage />}
                                                                onClick={() => handleOpenImage(url)}
                                                                className="w-fit"
                                                            >
                                                                View {key.charAt(0).toUpperCase() + key.slice(1)}
                                                            </Button>
                                                            <ImageUrlDisplay url={url} fileName={fileNames[key]} />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p>N/A</p>
                                                )}
                                            </div>
                                        </div>
                                        <hr className="my-4 border-gray-200" />
                                        <div className="mt-4 flex justify-end">
                                            <Button variant="contained" startIcon={<FaEdit />} onClick={() => setEditMode(true)}>
                                                Edit Details
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // --- Edit Mode Form ---
                                    <div className="text-sm md:text-base">
                                        {/* Description */}
                                        <div className="mb-4">
                                            <label className="block font-semibold mb-1">Description</label>
                                            <TextareaAutosize
                                                name="busDescription"
                                                value={formData.busDescription}
                                                onChange={handleInputChange}
                                                minRows={3}
                                                style={{ width: '100%', padding: '8px' }}
                                                className="border rounded-md"
                                            />
                                        </div>
                                        <hr className="my-4 border-gray-200" />

                                        {/* Contact Numbers */}
                                        <div className="mb-4">
                                            <label className="block font-semibold mb-1">Contact Numbers</label>
                                            <div className="mb-3">
                                                <label className="block text-sm text-gray-600 mb-1">
                                                    Primary Contact Number <span className="text-red-500">*</span>
                                                </label>
                                                <Input
                                                    name="primaryContactNumber"
                                                    value={formData.primaryContactNumber}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    required
                                                    error={!formData.primaryContactNumber}
                                                    placeholder="Enter primary contact number"
                                                />
                                                {!formData.primaryContactNumber && (
                                                    <p className="text-red-500 text-xs mt-1">Primary contact number is required</p>
                                                )}
                                            </div>
                                            <div className="mb-3">
                                                <label className="block text-sm text-gray-600 mb-1">
                                                    Secondary Contact Number (Optional)
                                                </label>
                                                <Input
                                                    name="secondaryContactNumber"
                                                    value={formData.secondaryContactNumber}
                                                    onChange={handleInputChange}
                                                    fullWidth
                                                    placeholder="Enter secondary contact number (optional)"
                                                />
                                            </div>
                                        </div>
                                        <hr className="my-4 border-gray-200" />

                                        {/* Reservation Policies */}
                                        <div className="mb-4">
                                            <label className="block font-semibold mb-1">Reservation Policies</label>
                                            {formData.reservationPolicies.map((policy, index) => (
                                                <div key={index} className="flex items-center mb-2">
                                                    <Input
                                                        name={`reservationPolicy-${index}`}
                                                        value={policy}
                                                        onChange={(e) => handlePolicyChange(e, index)}
                                                        fullWidth
                                                    />
                                                    <IconButton onClick={() => removePolicy(index)} size="small">
                                                        <FaTimes className="text-red-600" />
                                                    </IconButton>
                                                </div>
                                            ))}
                                            <Button variant="outlined" onClick={addPolicy} startIcon={<FaPlusCircle />} size="small">
                                                Add Policy
                                            </Button>
                                        </div>
                                        <hr className="my-4 border-gray-200" />

                                        {/* Amenities */}
                                        <div className="mb-4">
                                            <label className="block font-semibold mb-1">Amenities</label>
                                            {formData.amenities.map((amenity, index) => (
                                                <div key={index} className="flex items-center mb-2">
                                                    <Input
                                                        name={`amenity-${index}`}
                                                        value={amenity}
                                                        onChange={(e) => handleAmenityChange(e, index)}
                                                        fullWidth
                                                    />
                                                    <IconButton onClick={() => removeAmenity(index)} size="small">
                                                        <FaTimes className="text-red-600" />
                                                    </IconButton>
                                                </div>
                                            ))}
                                            <Button variant="outlined" onClick={addAmenity} startIcon={<FaPlusCircle />} size="small">
                                                Add Amenity
                                            </Button>
                                        </div>
                                        <hr className="my-4 border-gray-200" />

                                        {/* Bus Images */}
                                        <div className="mb-4">
                                            <label className="block font-semibold mb-1">Bus Images</label>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {['front', 'back', 'left', 'right'].map((position) => (
                                                    <div key={position} className="mb-3">
                                                        <div className="flex flex-col gap-2">
                                                            <div className="mb-1">
                                                                <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium capitalize">
                                                                    {position} view
                                                                </span>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<FaImage />}
                                                                    onClick={() => handleOpenImage(formData.images[position])}
                                                                    disabled={!formData.images[position]}
                                                                >
                                                                    View
                                                                </Button>
                                                                <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded text-sm">
                                                                    Choose Image
                                                                    <input
                                                                        type="file"
                                                                        accept="image/*"
                                                                        className="hidden"
                                                                        onChange={(e) => handleImageUpload(e, position)}
                                                                    />
                                                                </label>
                                                            </div>
                                                        </div>
                                                        <div className="mt-2">
                                                            <ImageUrlDisplay url={formData.images[position]} fileName={fileNames[position]} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <hr className="my-4 border-gray-200" />

                                        {/* Document Images - only if bus is unverified */}
                                        {!selectedBus.verified && (
                                            <div className="mb-4">
                                                <label className="block font-semibold mb-1">Document Images</label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {['bluebook', 'roadPermit', 'insurance'].map((docKey) => (
                                                        <div key={docKey} className="mb-3">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="mb-1">
                                                                    <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium capitalize">
                                                                        {docKey === 'roadPermit' ? 'Road Permit' : docKey}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <Button
                                                                        variant="outlined"
                                                                        size="small"
                                                                        startIcon={<FaImage />}
                                                                        onClick={() => handleOpenImage(formData.documents[docKey])}
                                                                        disabled={!formData.documents[docKey]}
                                                                    >
                                                                        View
                                                                    </Button>
                                                                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-3 rounded text-sm">
                                                                        Choose Image
                                                                        <input
                                                                            type="file"
                                                                            accept="image/*"
                                                                            className="hidden"
                                                                            onChange={(e) => handleDocumentUpload(e, docKey)}
                                                                        />
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2">
                                                                <ImageUrlDisplay url={formData.documents[docKey]} fileName={fileNames[docKey]} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <hr className="my-4 border-gray-200" />

                                        {/* Action Buttons: Cancel then Save Changes */}
                                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4">
                                            <Button
                                                variant="outlined"
                                                onClick={() => setEditMode(false)}
                                                fullWidth
                                                className="sm:w-auto"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="contained"
                                                onClick={handleSaveChanges}
                                                sx={{ backgroundColor: 'green', '&:hover': { backgroundColor: 'darkgreen' } }}
                                                fullWidth
                                                className="sm:w-auto"
                                            >
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </Box>
                        </Modal>
                    )}
                </div>
            </div>
        </OperatorLayout>
    );
};

export default ManageBus;
