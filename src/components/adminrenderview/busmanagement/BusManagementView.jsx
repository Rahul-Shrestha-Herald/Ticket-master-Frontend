import React, { useState, useContext, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Select, MenuItem, Button, Modal, Box, IconButton } from '@mui/material';
import { FaImage, FaTimes, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import DataFilter from './DataFilter';
import TableController from './TableController';
import { AdminAppContext } from '../../../context/AdminAppContext';

const BusManagementView = ({
  buses,
  searchQuery,
  selectedFilter,
  onSearchChange,
  onFilterChange
}) => {
  const { backendUrl, adminData } = useContext(AdminAppContext);

  // Define filter options: All Buses, Verified, Unverified
  const filterOptions = [
    { value: 'all', label: 'All Buses' },
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' }
  ];

  // Local state for detail modal and deletion modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  // Lightbox state for viewing images
  const [lightboxSrc, setLightboxSrc] = useState(null);

  const openLightbox = (src) => { if (src) setLightboxSrc(src); };
  const closeLightbox = () => setLightboxSrc(null);
  const [busToDelete, setBusToDelete] = useState(null);

  // Maintain a local copy of buses so we can update the UI instantly
  const [localBuses, setLocalBuses] = useState(buses);

  useEffect(() => {
    setLocalBuses(buses);
  }, [buses]);

  // Open modal with bus details
  const handleOpenModal = (bus) => {
    setSelectedBus(bus);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedBus(null);
  };

  // Open delete confirmation modal
  const openDeleteConfirmation = (bus) => {
    setBusToDelete(bus);
    setOpenDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setBusToDelete(null);
  };

  // Handle verified status change and update UI immediately
  const handleVerifiedChange = async (id, value) => {
    const newVerified = value === 'verified';
    try {
      await axios.put(
        `${backendUrl}/api/admin/buses/${id}/status`,
        { verified: newVerified },
        { headers: { Authorization: `Bearer ${adminData?.token}` } }
      );
      // Update local state to reflect the change instantly
      setLocalBuses(prevBuses =>
        prevBuses.map(bus => bus._id === id ? { ...bus, verified: newVerified } : bus)
      );
      toast.success('Bus verification status updated successfully!');
    } catch (error) {
      toast.error('Failed to update bus verification status');
    }
  };

  // Handle bus deletion from database
  const handleDeleteBus = async () => {
    try {
      await axios.delete(
        `${backendUrl}/api/admin/buses/${busToDelete._id}`,
        { headers: { Authorization: `Bearer ${adminData?.token}` } }
      );
      // Update local state to remove the deleted bus
      setLocalBuses(prevBuses => prevBuses.filter(bus => bus._id !== busToDelete._id));
      toast.success('Bus deleted successfully!');
      closeDeleteModal();
    } catch (error) {
      toast.error('Failed to delete bus');
    }
  };

  // Filter local buses based on search query and selected filter
  const filteredBuses = localBuses.filter((bus) => {
    const matchesSearch =
      bus.busName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.busNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === 'all'
        ? true
        : selectedFilter === 'verified'
          ? bus.verified
          : !bus.verified;
    return matchesSearch && matchesFilter;
  });

  // Define DataGrid columns including the new "Delete" column
  const columns = [
    {
      field: 'sno',
      headerName: 'S.No',
      width: 100,
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        return <span>{rowIndex}</span>;
      }
    },
    { field: 'busName', headerName: 'Bus Name', width: 350 },
    { field: 'busNumber', headerName: 'Bus Number', width: 300 },
    {
      field: 'verified',
      headerName: 'Verified Status',
      width: 170,
      renderCell: (params) => (
        <Select
          value={params.value ? 'verified' : 'unverified'}
          onChange={(e) => handleVerifiedChange(params.row._id, e.target.value)}
          variant="standard"
          className="w-full"
          sx={{
            '& .MuiSelect-select': {
              color: params.value ? '#16a34a' : '#dc2626',
              fontWeight: 500
            }
          }}
        >
          <MenuItem
            value="verified"
            sx={{ color: '#16a34a', '&:hover': { backgroundColor: '#f0fdf4' } }}
          >
            Verified
          </MenuItem>
          <MenuItem
            value="unverified"
            sx={{ color: '#dc2626', '&:hover': { backgroundColor: '#fef2f2' } }}
          >
            Unverified
          </MenuItem>
        </Select>
      )
    },
    {
      field: 'moreDetails',
      headerName: 'More Details',
      width: 150,
      renderCell: (params) => (
        <Button variant="contained" onClick={() => handleOpenModal(params.row)}>
          View More
        </Button>
      )
    },
    {
      field: 'delete',
      headerName: 'Delete',
      width: 80,
      renderCell: (params) => (
        <IconButton
          onClick={() => openDeleteConfirmation(params.row)}
          color="error"
        >
          <FaTrash />
        </IconButton>
      )
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Header with search and filter */}
      <TableController title="Bus Management" headerComponent={null}>
        <DataFilter
          searchQuery={searchQuery}
          selectedFilter={selectedFilter}
          onSearchChange={onSearchChange}
          onFilterChange={onFilterChange}
          filterOptions={filterOptions}
          placeholder="Search by Bus Name or Number"
        />
      </TableController>

      {/* DataGrid */}
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredBuses}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
          getRowId={(row) => row._id}
        />
      </div>

      {/* Modal for More Details */}
      <Modal open={openModal} onClose={handleCloseModal}>
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
            <h2 style={{ margin: 0 }}>{selectedBus?.busName} Details</h2>
            <IconButton onClick={handleCloseModal} sx={{ color: '#dc2626' }}>
              <FaTimes />
            </IconButton>
          </div>
          <hr style={{ margin: '1rem 0' }} />

          {/* Bus Description */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Description</h3>
            <p>{selectedBus?.busDescription || 'N/A'}</p>
          </div>

          {/* Contact Numbers */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Contact Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>Primary Contact: </span>
                <span>{selectedBus?.primaryContactNumber || 'N/A'}</span>
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>Secondary Contact: </span>
                <span>{selectedBus?.secondaryContactNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          <hr style={{ margin: '1rem 0' }} />

          {/* Reservation Policies */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Reservation Policies</h3>
            {selectedBus?.reservationPolicies && selectedBus.reservationPolicies.length > 0 ? (
              <ul style={{ marginLeft: '20px', paddingLeft: '0', listStyleType: 'none' }}>
                {selectedBus.reservationPolicies.map((policy, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    <span style={{ marginRight: '8px' }}>&#8226;</span>
                    {policy}
                  </li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <hr style={{ margin: '1rem 0' }} />

          {/* Amenities */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Amenities</h3>
            {selectedBus?.amenities && selectedBus.amenities.length > 0 ? (
              <ul style={{ marginLeft: '20px', paddingLeft: '0', listStyleType: 'none' }}>
                {selectedBus.amenities.map((amenity, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>
                    <span style={{ marginRight: '8px' }}>&#8226;</span>
                    {amenity}
                  </li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <hr style={{ margin: '1rem 0' }} />

          {/* Documents */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Documents</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {selectedBus?.documents ? (
                Object.keys(selectedBus.documents).map((docKey) => (
                  <div key={docKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {selectedBus.documents[docKey] ? (
                      <img
                        src={selectedBus.documents[docKey]}
                        alt={docKey}
                        onClick={() => openLightbox(selectedBus.documents[docKey])}
                        style={{ width: 90, height: 70, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd', cursor: 'zoom-in' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: 90, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: 6, border: '1px dashed #ccc', fontSize: 11, color: '#bbb' }}>Not uploaded</div>
                    )}
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#555' }}>{docKey}</span>
                  </div>
                ))
              ) : (
                <p>N/A</p>
              )}
            </div>
          </div>
          <hr style={{ margin: '1rem 0' }} />

          {/* Bus Images */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Bus Images</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
              {selectedBus?.images ? (
                Object.keys(selectedBus.images).map((imgKey) => (
                  <div key={imgKey} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    {selectedBus.images[imgKey] ? (
                      <img
                        src={selectedBus.images[imgKey]}
                        alt={imgKey}
                        onClick={() => openLightbox(selectedBus.images[imgKey])}
                        style={{ width: 110, height: 80, objectFit: 'cover', borderRadius: 6, border: '1px solid #ddd', cursor: 'zoom-in' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: 110, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: 6, border: '1px dashed #ccc', fontSize: 11, color: '#bbb' }}>Not uploaded</div>
                    )}
                    <span style={{ fontSize: 11, textTransform: 'uppercase', color: '#555' }}>{imgKey}</span>
                  </div>
                ))
              ) : (
                <p>N/A</p>
              )}
            </div>
          </div>
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
          <p>Are you sure you want to delete the bus <strong>{busToDelete?.busName}</strong>?</p>
          <div className="mt-6 flex justify-end space-x-4">
            <Button variant="outlined" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDeleteBus}>
              Delete
            </Button>
          </div>
        </Box>
      </Modal>

      {/* Lightbox for viewing images */}
      {lightboxSrc && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out'
          }}
        >
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'rgba(255,255,255,0.15)', border: 'none',
              borderRadius: '50%', width: 36, height: 36,
              color: '#fff', fontSize: 18, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >✕</button>
          <img
            src={lightboxSrc}
            alt="Preview"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          />
        </div>
      )}
    </div>
  );
};

export default BusManagementView;