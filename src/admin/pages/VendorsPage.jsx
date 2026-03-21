import React, { useState, useEffect, useCallback } from 'react';
import { 
  Store, Search, Eye, CheckCircle, XCircle, Clock,User,
  MapPin, Phone, Mail, Star, DollarSign, Calendar
} from 'lucide-react';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import apiService from '../services/api.service';

// Utility hook for debouncing
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// Vendor Details Modal Component
const VendorDetailsModal = ({ vendor, onClose, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [comments, setComments] = useState('');

  const handleVerification = async (status) => {
    if (status === 'rejected' && !comments.trim()) {
      setMessage('❌ Please provide rejection comments');
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      await apiService.put(`/admin/vendors/${vendor.user_id}/verification`, {
        status: status,
        admin_comments: comments
      });
      setMessage(`✅ Vendor ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      onUpdate();
      setTimeout(onClose, 1500);
    } catch (error) {
      setMessage(`❌ Failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerificationBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected', icon: XCircle },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-h-[80vh] overflow-y-auto">
      
      {/* Shop Info Card */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">{vendor.shop_name || 'Shop Name Not Set'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-gray-700">
                <User className="w-4 h-4 mr-2 text-purple-500" />
                {vendor.name || 'Owner Unknown'}
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-purple-500" />
                {vendor.phone_number || 'No phone'}
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-purple-500" />
                {vendor.email || 'No email'}
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-purple-500" />
                {vendor.shop_city && vendor.shop_state 
                  ? `${vendor.shop_city}, ${vendor.shop_state}` 
                  : 'No location'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop Details */}
      {vendor.shop_address && (
        <div className="p-4 bg-white border rounded-lg">
          <h5 className="font-semibold mb-2">Shop Address</h5>
          <p className="text-sm text-gray-700">{vendor.shop_address}</p>
        </div>
      )}

      {/* Verification Status */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-white border rounded-lg">
        <div>
          <p className="text-sm text-gray-600 mb-1">Verification Status</p>
          {getVerificationBadge(vendor.status)}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Account Status</p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            vendor.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {vendor.status || 'inactive'}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Created On</p>
          <p className="text-sm font-medium">
            {new Date(vendor.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        {vendor.verified_at && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Verified On</p>
            <p className="text-sm font-medium">
              {new Date(vendor.verified_at).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Shop Metrics */}
      {(vendor.total_bookings > 0 || vendor.average_rating) && (
        <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg border">
          <div className="text-center">
            <div className="flex items-center justify-center text-blue-600 mb-1">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{vendor.total_bookings || 0}</p>
            <p className="text-xs text-gray-600">Total Bookings</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-yellow-600 mb-1">
              <Star className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">{vendor.average_rating || '0.0'}</p>
            <p className="text-xs text-gray-600">Rating</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center text-green-600 mb-1">
              <DollarSign className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold">₹{Number(vendor.total_revenue || 0).toLocaleString()}</p>
            <p className="text-xs text-gray-600">Revenue</p>
          </div>
        </div>
      )}

      {/* Admin Comments */}
      {vendor.admin_comments && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-semibold mb-2 text-blue-900">Previous Admin Comments</h5>
          <p className="text-sm text-blue-800">{vendor.admin_comments}</p>
        </div>
      )}

      {/* Verification Actions */}
      {vendor.status === 'pending' && (
        <div className="p-4 bg-white border rounded-lg">
          <h5 className="font-semibold mb-3">Verification Action</h5>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comments {vendor.status === 'rejected' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Add your comments here..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => handleVerification('approved')}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium"
            >
              {isSubmitting ? 'Processing...' : 'Approve Vendor'}
            </button>
            <button
              onClick={() => handleVerification('rejected')}
              disabled={isSubmitting || !comments.trim()}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium"
            >
              {isSubmitting ? 'Processing...' : 'Reject Vendor'}
            </button>
          </div>
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`p-3 rounded-lg text-sm font-medium ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      {/* Close Button */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main Vendors Page Component
const VendorsPage = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/admin/vendors', {
        ...filters,
        search: debouncedSearch
      });
      setVendors(response.data.vendors || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error('❌ Failed to fetch vendors:', err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const handleViewDetails = async (vendor) => {
    try {
      const response = await apiService.get(`/admin/vendors/${vendor.user_id}`);
      setSelectedVendor(response.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('❌ Failed to fetch vendor details:', err);
    }
  };

  const columns = [
    { 
      header: 'ID', 
      field: 'user_id',
      render: (row) => (
        <span className="font-mono text-xs">{row.user_id}</span>
      )
    },
    {
      header: 'Shop Name',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Store className="w-5 h-5 text-purple-600" />
          <span className="font-medium">{row.shop_name || 'Not Set'}</span>
        </div>
      )
    },
    { 
      header: 'Owner', 
      field: 'name',
      render: (row) => row.name || 'Unknown'
    },
    { header: 'Phone', field: 'phone_number' },
    { 
      header: 'Location',
      render: (row) => (
        <span className="text-sm">{row.shop_city || 'N/A'}</span>
      )
    },
    {
      header: 'Verification',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'approved' ? 'bg-green-100 text-green-800' :
          row.status === 'rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status || 'pending'}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
          title="View Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  // Calculate stats
  const pendingCount = vendors.filter(v => v.status === 'pending').length;
  const approvedCount = vendors.filter(v => v.status === 'approved').length;

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
        <p className="text-gray-600 mt-1">Manage vendor accounts and approve new registrations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Total Vendors</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Pending Approval</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Approved</p>
          <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by shop name, owner, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
            />
          </div>

          {/* Verification Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
          >
            <option value="">All Verifications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* City Filter */}
          <input
            type="text"
            placeholder="Filter by city..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={filters.city}
            onChange={(e) => setFilters({...filters, city: e.target.value, page: 1})}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table columns={columns} data={vendors} loading={loading} />
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} vendors
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setFilters({...filters, page: filters.page - 1})}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters({...filters, page: filters.page + 1})}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View/Verify Modal */}
      {selectedVendor && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Vendor: ${selectedVendor.shop_name || 'Details'}`}
        >
          <VendorDetailsModal
            vendor={selectedVendor}
            onClose={() => setIsModalOpen(false)}
            onUpdate={fetchVendors}
          />
        </Modal>
      )}
    </div>
  );
};

export default VendorsPage;