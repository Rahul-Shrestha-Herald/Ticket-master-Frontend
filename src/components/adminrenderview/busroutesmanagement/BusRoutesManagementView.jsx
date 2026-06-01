import React, { useState, useContext, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Button, Modal, Box, IconButton } from '@mui/material';
import { FaTimes, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';
import DataFilter from './DataFilter';
import TableController from './TableController';
import { AdminAppContext } from '../../../context/AdminAppContext';

const BusRouteManagementView = ({ routes, searchQuery, onSearchChange }) => {
  const { backendUrl, adminData } = useContext(AdminAppContext);
  
  // Local state for routes to update UI instantly
  const [localRoutes, setLocalRoutes] = useState(routes);
  useEffect(() => {
    setLocalRoutes(routes);
  }, [routes]);

  // State for detail modal and deletion confirmation modal
  const [openModal, setOpenModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState(null);

  // Open the modal to show route details
  const handleOpenModal = (route) => {
    setSelectedRoute(route);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRoute(null);
  };

  // Open delete confirmation modal
  const openDeleteConfirmation = (route) => {
    setRouteToDelete(route);
    setOpenDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setOpenDeleteModal(false);
    setRouteToDelete(null);
  };

  // Handle deletion of a route
  const handleDeleteRoute = async () => {
    try {
      await axios.delete(`${backendUrl}/api/admin/routes/${routeToDelete._id}`, {
        headers: { Authorization: `Bearer ${adminData?.token}` }
      });
      setLocalRoutes(prevRoutes =>
        prevRoutes.filter(route => route._id !== routeToDelete._id)
      );
      toast.success('Route deleted successfully!');
      closeDeleteModal();
    } catch (error) {
      toast.error('Failed to delete route');
    }
  };

  // Filter routes by search query across bus name, from, and to
  const filteredRoutes = localRoutes.filter((route) => {
    const query = searchQuery.toLowerCase();
    const busName = route.bus?.busName?.toLowerCase() || '';
    const from = route.from.toLowerCase();
    const to = route.to.toLowerCase();
    return busName.includes(query) || from.includes(query) || to.includes(query);
  });

  // Define DataGrid columns
  const columns = [
    {
      field: 'sno',
      headerName: 'S.No',
      width: 90,
      renderCell: (params) => {
        const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
        return <span>{rowIndex}</span>;
      }
    },
    {
      field: 'busName',
      headerName: 'Bus Name',
      width: 265,
      renderCell: (params) => (
        <span>{params.row.bus?.busName || 'N/A'}</span>
      )
    },
    { field: 'from', headerName: 'From', width: 225 },
    { field: 'to', headerName: 'To', width: 225 },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      renderCell: (params) => <span>Rs. {params.row.price}</span>
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
        <IconButton onClick={() => openDeleteConfirmation(params.row)} color="error">
          <FaTrash />
        </IconButton>
      )
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      {/* Header with search field and search button */}
      <TableController title="Route Management" headerComponent={null}>
        <DataFilter
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          placeholder="Search by Bus Name, From, or To"
        />
      </TableController>

      {/* DataGrid Table */}
      <div style={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={filteredRoutes}
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
            <h2 style={{ margin: 0 }}>Route Details</h2>
            <IconButton onClick={handleCloseModal} sx={{ color: '#dc2626' }}>
              <FaTimes />
            </IconButton>
          </div>
          <hr style={{ margin: '1rem 0' }} />
          
          {/* Display Pickup Points */}
          <div style={{ marginBottom: '1rem' }}>
            <h3>Pickup Points</h3>
            {selectedRoute?.pickupPoints && selectedRoute.pickupPoints.length > 0 ? (
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                {selectedRoute.pickupPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <hr style={{ margin: '1rem 0' }} />
          
          {/* Display Drop Points */}
          <div style={{ marginBottom: '1rem' }}>
            <h3>Drop Points</h3>
            {selectedRoute?.dropPoints && selectedRoute.dropPoints.length > 0 ? (
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                {selectedRoute.dropPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
          </div>
          <hr style={{ margin: '1rem 0' }} />
          
          {/* Display Custom Prices */}
          <div style={{ marginBottom: '1rem' }}>
            <h3>Custom Prices</h3>
            {selectedRoute?.customPrices && selectedRoute.customPrices.length > 0 ? (
              <ul style={{ paddingLeft: '20px', listStyleType: 'disc' }}>
                {selectedRoute.customPrices.map((item, index) => (
                  <li key={index}>
                    {item.origin} → {item.drop}: Rs. {item.price}
                  </li>
                ))}
              </ul>
            ) : (
              <p>N/A</p>
            )}
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
          <p>
            Are you sure you want to delete the route from{' '}
            <strong>{routeToDelete?.from}</strong> to <strong>{routeToDelete?.to}</strong>?
          </p>
          <div className="mt-6 flex justify-end space-x-4">
            <Button variant="outlined" onClick={closeDeleteModal}>
              Cancel
            </Button>
            <Button variant="contained" color="error" onClick={handleDeleteRoute}>
              Delete
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default BusRouteManagementView;
