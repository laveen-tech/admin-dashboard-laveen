import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, Search, Eye, Trash2, CheckCircle, XCircle,
  User, Phone, Mail, MapPin, Calendar, Shield
} from 'lucide-react';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import apiService from '../services/api.service';

// Utility hook for debouncing search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    setMessage('');
    
    try {
      await apiService.put(`/admin/users/${user.user_id}/status`, { status: newStatus });
      setMessage(`✅ Status updated to ${newStatus}`);
      onStatusChange();
      setTimeout(onClose, 1500);
    } catch (error) {
      setMessage(`❌ Failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', label: 'Active', icon: CheckCircle },
      inactive: { color: 'bg-yellow-100 text-yellow-800', label: 'Inactive', icon: XCircle },
      suspended: { color: 'bg-red-100 text-red-800', label: 'Suspended', icon: Shield }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* User Info Card */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h4 className="text-xl font-bold text-gray-900 mb-2">{user.name || 'Unknown User'}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-gray-700">
                <Mail className="w-4 h-4 mr-2 text-blue-500" />
                {user.email || 'No email'}
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-blue-500" />
                {user.phone_number || 'No phone'}
              </div>
              <div className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                {user.city && user.state ? `${user.city}, ${user.state}` : 'No location'}
              </div>
              <div className="flex items-center text-gray-700">
                <User className="w-4 h-4 mr-2 text-blue-500" />
                {user.gender || 'Not specified'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Details */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-white border rounded-lg">
        <div>
          <p className="text-sm text-gray-600 mb-1">User ID</p>
          <p className="font-mono text-sm font-medium">{user.user_id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">User Type</p>
          <p className="font-semibold capitalize">{user.user_type || 'CUSTOMER'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Status</p>
          {getStatusBadge(user.status)}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Phone Verified</p>
          <span className={`font-semibold ${user.phone_verified ? 'text-green-600' : 'text-red-600'}`}>
            {user.phone_verified ? '✓ Verified' : '✗ Not Verified'}
          </span>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Created On</p>
          <p className="text-sm font-medium">
            {new Date(user.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Last Login</p>
          <p className="text-sm font-medium">
            {user.last_login_at 
              ? new Date(user.last_login_at).toLocaleString()
              : 'Never'}
          </p>
        </div>
      </div>

      {/* Status Actions */}
      {user.user_type !== 'SUPERADMIN' && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h5 className="font-semibold mb-3">Change User Status</h5>
          <div className="flex flex-wrap gap-2">
            {['active', 'inactive', 'suspended'].map((status) => (
              <button
                key={status}
                onClick={() => handleStatusChange(status)}
                disabled={isUpdating || user.status === status}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  user.status === status
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : status === 'active'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : status === 'suspended'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-yellow-600 text-white hover:bg-yellow-700'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
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

      {/* Actions */}
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

// Main Users Page Component
const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    user_type: 'CUSTOMER',
    status: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.get('/admin/users', {
        ...filters,
        search: debouncedSearch
      });
      setUsers(response.data.users || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      console.error('❌ Failed to fetch users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleViewDetails = async (user) => {
    try {
      const response = await apiService.get(`/admin/users/${user.user_id}`);
      setSelectedUser(response.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error('❌ Failed to fetch user details:', err);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await apiService.delete(`/admin/users/${userToDelete.user_id}`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (error) {
      console.error('❌ Failed to delete user:', error);
      alert(`Failed to delete user: ${error.message}`);
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
      header: 'Name',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
            {row.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span className="font-medium">{row.name || 'Unknown'}</span>
        </div>
      )
    },
    { header: 'Email', field: 'email' },
    { header: 'Phone', field: 'phone_number' },
    { 
      header: 'Location',
      render: (row) => (
        <span className="text-sm">{row.city || 'N/A'}</span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.status === 'active' ? 'bg-green-100 text-green-800' :
          row.status === 'suspended' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          {row.user_type !== 'SUPERADMIN' && (
            <button
              onClick={() => {
                setUserToDelete(row);
                setIsDeleteModalOpen(true);
              }}
              className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
        <p className="text-gray-600 mt-1">Manage all customers and their accounts</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
            />
          </div>

          {/* Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table columns={columns} data={users} loading={loading} />
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} users
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

      {/* View Details Modal */}
      {selectedUser && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`User Details: ${selectedUser.name}`}
        >
          <UserDetailsModal
            user={selectedUser}
            onClose={() => setIsModalOpen(false)}
            onStatusChange={fetchUsers}
          />
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete user <strong>{userToDelete?.name}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteUser}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;