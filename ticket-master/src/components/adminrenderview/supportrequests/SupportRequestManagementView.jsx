import React, { useState, useEffect, useCallback } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { FaSearch, FaFilter, FaEllipsisV, FaCheck, FaClock } from 'react-icons/fa';
import { Menu, MenuItem, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import TableController from '../usermanagement/TableController';
import DataFilter from '../usermanagement/DataFilter';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AdminAppContext } from '../../../context/AdminAppContext';

const SupportRequestManagementView = ({
    supportRequests,
    searchQuery,
    onSearchChange,
    statusFilter,
    onFilterChange,
    fetchSupportRequests
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [updateStatusOpen, setUpdateStatusOpen] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const { backendUrl, adminData } = React.useContext(AdminAppContext);

    // Prepare data for DataGrid - ensure ID field is correctly mapped
    const rowData = React.useMemo(() => {
        if (!supportRequests || !Array.isArray(supportRequests)) return [];
        return supportRequests.map(request => ({
            id: request._id || request.id, // Handle both _id and id formats
            ...request,
            // Ensure required fields are present
            name: request.name || 'Unknown',
            email: request.email || 'N/A',
            phone: request.phone || 'N/A',
            category: request.category || 'other',
            status: request.status || 'pending',
            message: request.message || '',
            createdAt: request.createdAt || new Date().toISOString(),
        }));
    }, [supportRequests]);

    useEffect(() => {
        console.log('Support Requests data:', supportRequests);
        console.log('Prepared row data:', rowData);
    }, [supportRequests, rowData]);

    useEffect(() => {
        console.log('Selected Request:', selectedRequest);
        console.log('Details Dialog Open:', detailsOpen);
    }, [selectedRequest, detailsOpen]);

    const handleMenuOpen = useCallback((event, request) => {
        event.stopPropagation(); // Prevent event bubbling
        console.log('Menu opened for request:', request);
        setAnchorEl(event.currentTarget);
        setSelectedRequest(request);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleViewDetails = useCallback(() => {
        console.log('View details clicked for:', selectedRequest);
        setDetailsOpen(true);
        handleMenuClose();
    }, [selectedRequest, handleMenuClose]);

    const handleUpdateStatus = useCallback(() => {
        console.log('Update status clicked for:', selectedRequest);
        setUpdateStatusOpen(true);
        setNewStatus(selectedRequest?.status || 'pending');
        handleMenuClose();
    }, [selectedRequest, handleMenuClose]);

    const handleDetailsClose = useCallback(() => {
        setDetailsOpen(false);
    }, []);

    const handleUpdateStatusClose = useCallback(() => {
        setUpdateStatusOpen(false);
    }, []);

    const submitStatusUpdate = useCallback(async () => {
        try {
            if (!selectedRequest) {
                toast.error('No request selected');
                return;
            }

            const requestId = selectedRequest._id || selectedRequest.id; // Handle both _id and id
            if (!requestId) {
                toast.error('Invalid request ID');
                return;
            }

            console.log('Submitting status update:', {
                requestId,
                newStatus,
                token: adminData?.token
            });

            const response = await axios.patch(
                `${backendUrl}/api/support/admin/${requestId}`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${adminData?.token}` } }
            );

            if (response.data && response.data.success) {
                toast.success('Support request status updated successfully');
                fetchSupportRequests();
                handleUpdateStatusClose();
            } else {
                toast.error(response.data?.message || 'Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'An error occurred');
        }
    }, [selectedRequest, newStatus, adminData, backendUrl, fetchSupportRequests, handleUpdateStatusClose]);

    const getStatusChip = (status) => {
        if (!status) return 'Unknown';

        if (status === 'pending') {
            return (
                <div className="flex items-center">
                    <FaClock className="text-yellow-500 mr-2" />
                    <span className="text-yellow-700 font-medium">Pending</span>
                </div>
            );
        } else if (status === 'complete') {
            return (
                <div className="flex items-center">
                    <FaCheck className="text-green-500 mr-2" />
                    <span className="text-green-700 font-medium">Complete</span>
                </div>
            );
        }
        return status;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid date';
            return date.toLocaleString();
        } catch (error) {
            console.error('Error formatting date:', dateString, error);
            return 'Invalid date';
        }
    };

    const columns = [
        {
            field: 'sno',
            headerName: 'S.No',
            width: 70,
            renderCell: (params) => {
                const rowIndex = params.api.getRowIndexRelativeToVisibleRows(params.id) + 1;
                return <span className="text-gray-600">{rowIndex || 'N/A'}</span>;
            }
        },
        { field: 'name', headerName: 'Name', width: 180 },
        { field: 'email', headerName: 'Email', width: 220 },
        { field: 'phone', headerName: 'Phone', width: 150 },
        {
            field: 'category',
            headerName: 'Category',
            width: 130,
            renderCell: (params) => (
                <span className="capitalize">{params.value || 'N/A'}</span>
            )
        },
        {
            field: 'createdAt',
            headerName: 'Submitted On',
            width: 180,
            renderCell: (params) => formatDate(params.value)
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => getStatusChip(params.value)
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            width: 100,
            renderCell: (params) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Button
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={(e) => handleMenuOpen(e, params.row)}
                    >
                        <FaEllipsisV className="text-gray-600" />
                    </Button>
                </div>
            )
        }
    ];

    // Handle row click to view details
    const handleRowClick = (params) => {
        console.log('Row clicked:', params.row);
        setSelectedRequest(params.row);
        setDetailsOpen(true);
    };

    // Error handling - log current data state
    useEffect(() => {
        if (!supportRequests) {
            console.error('Support Requests is null or undefined');
        } else if (!Array.isArray(supportRequests)) {
            console.error('Support Requests is not an array:', typeof supportRequests);
        } else if (supportRequests.length === 0) {
            console.log('Support Requests array is empty');
        } else {
            console.log(`Support Requests contains ${supportRequests.length} items`);
        }
    }, [supportRequests]);

    // Render nothing if supportRequests is not an array
    if (!supportRequests) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <TableController title="Support Request Management" headerComponent={null}>
                    <div className="text-center py-8">
                        <p className="text-red-500">Error: Support requests data is missing</p>
                    </div>
                </TableController>
            </div>
        );
    }

    if (!Array.isArray(supportRequests)) {
        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <TableController title="Support Request Management" headerComponent={null}>
                    <div className="text-center py-8">
                        <p className="text-red-500">Error: Invalid support requests data format</p>
                    </div>
                </TableController>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <TableController
                title="Support Request Management"
                headerComponent={null}
            >
                <div className="flex justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary w-full"
                                placeholder="Search requests..."
                                value={searchQuery}
                                onChange={onSearchChange}
                            />
                        </div>

                        <div className="relative inline-block">
                            <div className="flex items-center">
                                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={onFilterChange}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary appearance-none bg-white"
                                >
                                    <option value="all">All Requests</option>
                                    <option value="pending">Pending</option>
                                    <option value="complete">Complete</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </TableController>

            <div style={{ height: 600, width: '100%', minWidth: '800px' }} className="border border-gray-200 rounded-md">
                {rowData.length > 0 ? (
                    <DataGrid
                        rows={rowData}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                        onRowClick={handleRowClick}
                        disableSelectionOnClick
                        getRowId={(row) => row.id}
                        autoHeight={false}
                    />
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-500">No support requests found</p>
                    </div>
                )}
            </div>

            {/* Context Menu */}
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleViewDetails}>View Details</MenuItem>
                <MenuItem onClick={handleUpdateStatus}>Update Status</MenuItem>
            </Menu>

            {/* Details Dialog */}
            {selectedRequest && (
                <Dialog
                    open={detailsOpen}
                    onClose={handleDetailsClose}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Support Request Details</DialogTitle>
                    <DialogContent dividers>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium">{selectedRequest.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium">{selectedRequest.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium">{selectedRequest.phone || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Category</p>
                                <p className="font-medium capitalize">{selectedRequest.category || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Booking ID</p>
                                <p className="font-medium">{selectedRequest.bookingId || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                <p className="font-medium">{getStatusChip(selectedRequest.status)}</p>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">Submitted On</p>
                            <p className="font-medium">{formatDate(selectedRequest.createdAt)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Message</p>
                            <div className="p-4 bg-gray-50 rounded-lg mt-1 whitespace-pre-wrap">
                                {selectedRequest.message || 'No message provided'}
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleDetailsClose} color="primary">
                            Close
                        </Button>
                        <Button
                            onClick={() => {
                                handleDetailsClose();
                                handleUpdateStatus();
                            }}
                            color="primary"
                        >
                            Update Status
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {/* Update Status Dialog */}
            {selectedRequest && (
                <Dialog open={updateStatusOpen} onClose={handleUpdateStatusClose}>
                    <DialogTitle>Update Support Request Status</DialogTitle>
                    <DialogContent>
                        <div className="p-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                            >
                                <option value="pending">Pending</option>
                                <option value="complete">Complete</option>
                            </select>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleUpdateStatusClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={submitStatusUpdate} color="primary">
                            Update
                        </Button>
                    </DialogActions>
                </Dialog>
            )}
        </div>
    );
};

export default SupportRequestManagementView; 