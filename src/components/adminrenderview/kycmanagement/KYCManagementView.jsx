import React, { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaEye, FaFileImage } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AdminAppContext } from '../../../context/AdminAppContext';

const KYCManagementView = ({
  kycSubmissions,
  searchQuery,
  statusFilter,
  onSearchChange,
  onFilterChange,
  onViewDetails,
  onApprove,
  onReject,
  selectedKYC,
  onCloseDetails,
  fetchKYCs
}) => {
  const { backendUrl } = React.useContext(AdminAppContext);
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredKYCs = kycSubmissions.filter(kyc => {
    const matchesSearch = !searchQuery || 
      kyc.operator?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kyc.operator?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      kyc.panNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || kyc.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      submitted: { color: 'bg-blue-100 text-blue-800', text: 'Submitted' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    const statusConfig = config[status] || config.pending;
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.color}`}>
        {statusConfig.text}
      </span>
    );
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    onReject(selectedKYC._id, rejectionReason);
    setRejectionReason('');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">KYC Verification Management</h2>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by operator name, email, or PAN number..."
            value={searchQuery}
            onChange={onSearchChange}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={onFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* KYC List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PAN Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKYCs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No KYC submissions found
                  </td>
                </tr>
              ) : (
                filteredKYCs.map((kyc) => (
                  <tr key={kyc._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{kyc.operator?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{kyc.operator?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{kyc.panNumber || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{kyc.businessName || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(kyc.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => onViewDetails(kyc)}
                        className="text-blue-600 hover:text-blue-900 mr-3 flex items-center"
                      >
                        <FaEye className="mr-1" /> View
                      </button>
                      {kyc.status === 'submitted' && (
                        <>
                          <button
                            onClick={() => onApprove(kyc._id)}
                            className="text-green-600 hover:text-green-900 mr-3 flex items-center"
                          >
                            <FaCheckCircle className="mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => onViewDetails(kyc)}
                            className="text-red-600 hover:text-red-900 flex items-center"
                          >
                            <FaTimesCircle className="mr-1" /> Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KYC Details Modal */}
      {selectedKYC && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">KYC Details</h3>
                <button
                  onClick={onCloseDetails}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Operator Info */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Operator Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Name</label>
                    <p className="font-medium">{selectedKYC.operator?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <p className="font-medium">{selectedKYC.operator?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">PAN Number</label>
                    <p className="font-medium">{selectedKYC.operator?.panNo || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* PAN Details */}
              <div>
                <h4 className="text-lg font-semibold mb-3">PAN Details</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">PAN Number</label>
                    <p className="font-medium">{selectedKYC.panNumber || 'N/A'}</p>
                  </div>
                  {selectedKYC.panImage && (
                    <div>
                      <label className="text-sm text-gray-500">PAN Image</label>
                      <div className="mt-2">
                        <a
                          href={`${backendUrl}/${selectedKYC.panImage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FaFileImage className="mr-2" /> View PAN Image
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Business Details</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">Business Name</label>
                    <p className="font-medium">{selectedKYC.businessName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Business Address</label>
                    <p className="font-medium">{selectedKYC.businessAddress || 'N/A'}</p>
                  </div>
                  {selectedKYC.businessRegistrationNumber && (
                    <div>
                      <label className="text-sm text-gray-500">Registration Number</label>
                      <p className="font-medium">{selectedKYC.businessRegistrationNumber}</p>
                    </div>
                  )}
                  {selectedKYC.businessRegistrationImage && (
                    <div>
                      <label className="text-sm text-gray-500">Registration Document</label>
                      <div className="mt-2">
                        <a
                          href={`${backendUrl}/${selectedKYC.businessRegistrationImage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FaFileImage className="mr-2" /> View Document
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ID Proof */}
              <div>
                <h4 className="text-lg font-semibold mb-3">ID Proof</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-500">ID Proof Type</label>
                    <p className="font-medium capitalize">{selectedKYC.idProofType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">ID Proof Number</label>
                    <p className="font-medium">{selectedKYC.idProofNumber || 'N/A'}</p>
                  </div>
                  {selectedKYC.idProofImage && (
                    <div>
                      <label className="text-sm text-gray-500">ID Proof Image</label>
                      <div className="mt-2">
                        <a
                          href={`${backendUrl}/${selectedKYC.idProofImage}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <FaFileImage className="mr-2" /> View ID Proof
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* License & Permits */}
              {(selectedKYC.drivingLicenseNumber || selectedKYC.busPermitNumber || selectedKYC.vehicleRegistrationNumber) && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">License & Permits</h4>
                  <div className="space-y-2">
                    {selectedKYC.drivingLicenseNumber && (
                      <div>
                        <label className="text-sm text-gray-500">Driving License Number</label>
                        <p className="font-medium">{selectedKYC.drivingLicenseNumber}</p>
                        {selectedKYC.drivingLicenseImage && (
                          <div className="mt-2">
                            <a
                              href={`${backendUrl}/${selectedKYC.drivingLicenseImage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <FaFileImage className="mr-2" /> View License
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    {selectedKYC.busPermitNumber && (
                      <div>
                        <label className="text-sm text-gray-500">Bus Permit Number</label>
                        <p className="font-medium">{selectedKYC.busPermitNumber}</p>
                        {selectedKYC.busPermitImage && (
                          <div className="mt-2">
                            <a
                              href={`${backendUrl}/${selectedKYC.busPermitImage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <FaFileImage className="mr-2" /> View Permit
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                    {selectedKYC.vehicleRegistrationNumber && (
                      <div>
                        <label className="text-sm text-gray-500">Vehicle Registration Number</label>
                        <p className="font-medium">{selectedKYC.vehicleRegistrationNumber}</p>
                        {selectedKYC.vehicleRegistrationImage && (
                          <div className="mt-2">
                            <a
                              href={`${backendUrl}/${selectedKYC.vehicleRegistrationImage}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <FaFileImage className="mr-2" /> View Registration
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection Reason if rejected */}
              {selectedKYC.status === 'rejected' && selectedKYC.rejectionReason && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Rejection Reason</h4>
                  <p className="text-red-600">{selectedKYC.rejectionReason}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedKYC.status === 'submitted' && (
                <div className="border-t pt-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows="3"
                      placeholder="Enter reason for rejection..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={onCloseDetails}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => onApprove(selectedKYC._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                    >
                      <FaCheckCircle className="mr-2" /> Approve
                    </button>
                    <button
                      onClick={handleReject}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                    >
                      <FaTimesCircle className="mr-2" /> Reject
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYCManagementView;
