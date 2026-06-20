<<<<<<< HEAD
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Store, Search, Eye, CheckCircle, XCircle, Clock, User,
  MapPin, Phone, Mail, Star, DollarSign, Calendar, RefreshCw
=======
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import {
  Users, Store, ShoppingBag, DollarSign,
  TrendingUp, Calendar, AlertCircle,
  ArrowRight, RefreshCw, FileText, Bell, Building2, Scissors
>>>>>>> cc72c060 (Commit)
} from 'lucide-react';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import apiService from '../services/api.service';

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
        status,
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
    const cfg = {
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      rejected:  { color: 'bg-red-100 text-red-800',    label: 'Rejected',  icon: XCircle },
      pending:   { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock }
    };
    const { color, label, icon: Icon } = cfg[status] || cfg.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${color}`}>
        <Icon className="w-3 h-3 mr-1" />{label}
      </span>
    );
  };

  // Use verification_status field (not status)
  const verificationStatus = vendor.verification_status || 'pending';

  return (
    <div className="space-y-4 sm:space-y-6 max-h-[80vh] overflow-y-auto px-1">
      {/* Shop Info */}
      <div className="p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
        <div className="flex flex-col sm:flex-row items-start space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white flex-shrink-0">
            <Store className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="flex-1 w-full min-w-0">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 break-words">
              {vendor.shop_name || 'Shop Name Not Set'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-start text-gray-700">
                <User className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="break-words min-w-0">{vendor.name || 'Owner Unknown'}</span>
              </div>
              <div className="flex items-start text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                <span>{vendor.phone_number || 'No phone'}</span>
              </div>
              <div className="flex items-start text-gray-700 sm:col-span-2">
                <Mail className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="break-all min-w-0 text-xs sm:text-sm">{vendor.email || 'No email'}</span>
              </div>
              <div className="flex items-start text-gray-700 sm:col-span-2">
                <MapPin className="w-4 h-4 mr-2 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="break-words min-w-0">
                  {vendor.shop_city && vendor.shop_state
                    ? `${vendor.shop_city}, ${vendor.shop_state}`
                    : (vendor.user_city && vendor.state ? `${vendor.user_city}, ${vendor.state}` : 'No location')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {vendor.shop_address && (
        <div className="p-3 sm:p-4 bg-white border rounded-lg">
          <h5 className="font-semibold mb-2 text-sm sm:text-base">Shop Address</h5>
          <p className="text-xs sm:text-sm text-gray-700 break-words">{vendor.shop_address}</p>
        </div>
      )}

      {/* Verification + Account Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 bg-white border rounded-lg">
        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Verification Status</p>
          {getVerificationBadge(verificationStatus)}
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Account Status</p>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            vendor.user_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {vendor.user_status || 'active'}
          </span>
        </div>
        <div>
          <p className="text-xs sm:text-sm text-gray-600 mb-1">Created On</p>
          <p className="text-xs sm:text-sm font-medium">
            {new Date(vendor.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        {vendor.verified_at && (
          <div>
            <p className="text-xs sm:text-sm text-gray-600 mb-1">Verified On</p>
            <p className="text-xs sm:text-sm font-medium">
              {new Date(vendor.verified_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Metrics — always show, use 0 as fallback */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border">
        <div className="text-center">
          <div className="flex items-center justify-center text-blue-600 mb-1">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-lg sm:text-2xl font-bold">{vendor.total_bookings ?? 0}</p>
          <p className="text-[10px] sm:text-xs text-gray-600">Total Bookings</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-yellow-600 mb-1">
            <Star className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-lg sm:text-2xl font-bold">{vendor.average_rating ? Number(vendor.average_rating).toFixed(1) : '—'}</p>
          <p className="text-[10px] sm:text-xs text-gray-600">Rating</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-green-600 mb-1">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <p className="text-sm sm:text-xl font-bold">₹{Number(vendor.total_revenue ?? 0).toLocaleString('en-IN')}</p>
          <p className="text-[10px] sm:text-xs text-gray-600">Revenue</p>
        </div>
      </div>

      {vendor.admin_comments && (
        <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-semibold mb-2 text-sm sm:text-base text-blue-900">Previous Admin Comments</h5>
          <p className="text-xs sm:text-sm text-blue-800 break-words">{vendor.admin_comments}</p>
        </div>
      )}

      {/* Verification actions — shown for pending OR to allow re-decision */}
      <div className="p-3 sm:p-4 bg-white border rounded-lg">
        <h5 className="font-semibold mb-3 text-sm sm:text-base">Verification Action</h5>
        <div className="mb-4">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
            Comments {verificationStatus !== 'approved' && <span className="text-gray-400 text-xs">(required for rejection)</span>}
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            rows="3"
            placeholder="Add your comments here..."
          />
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => handleVerification('approved')}
            disabled={isSubmitting || verificationStatus === 'approved'}
            className="w-full sm:flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition font-medium text-sm"
          >
            {isSubmitting ? 'Processing...' : '✓ Approve Vendor'}
          </button>
          <button
            onClick={() => handleVerification('rejected')}
            disabled={isSubmitting || !comments.trim() || verificationStatus === 'rejected'}
            className="w-full sm:flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition font-medium text-sm"
          >
            {isSubmitting ? 'Processing...' : '✗ Reject Vendor'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs sm:text-sm font-medium ${
          message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <div className="flex justify-end pt-4 border-t">
        <button onClick={onClose} className="w-full sm:w-auto px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium text-sm">
          Close
        </button>
      </div>
    </div>
  );
};

const VendorsPage = () => {
  const [allVendors, setAllVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all vendors once
const fetchVendors = useCallback(async () => {
  setLoading(true);
  try {
    const response = await apiService.get('/admin/vendors', { limit: 500, page: 1 });
    // ✅ No status filter here — client-side useMemo handles filtering
    setAllVendors(response.data?.vendors || []);
  } catch (err) {
    setAllVendors([]);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  // Client-side filtering — no extra API calls
  const filteredVendors = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allVendors.filter(v => {
      const matchesSearch = !q ||
        (v.shop_name || '').toLowerCase().includes(q) ||
        (v.name || '').toLowerCase().includes(q) ||
        (v.phone_number || '').includes(q);
      // API returns verification_status field
      const matchesStatus = !statusFilter || v.verification_status === statusFilter;
      const matchesCity = !cityFilter ||
        (v.shop_city || '').toLowerCase().includes(cityFilter.toLowerCase()) ||
        (v.user_city || '').toLowerCase().includes(cityFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [allVendors, search, statusFilter, cityFilter]);

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
      header: 'ID', field: 'user_id',
      render: (row) => <span className="font-mono text-xs">{row.user_id}</span>
    },
    {
      header: 'Shop Name',
      render: (row) => (
        <div className="flex items-center space-x-2">
          <Store className="w-5 h-5 text-purple-600 flex-shrink-0" />
          <span className="font-medium">{row.shop_name || 'Not Set'}</span>
        </div>
      )
    },
    { header: 'Owner', render: (row) => row.name || 'Unknown' },
    { header: 'Phone', field: 'phone_number' },
    {
      header: 'Email',
      render: (row) => <span className="text-sm" style={{wordBreak: 'break-all', maxWidth: '200px', display: 'block'}}>{row.email || '—'}</span>
    },
    {
      header: 'Location',
      render: (row) => <span className="text-sm">{row.shop_city || row.user_city || 'N/A'}</span>
    },
    {
      header: 'Verification',
      render: (row) => {
        // ✅ Use verification_status, not status
        const vs = row.verification_status || 'pending';
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            vs === 'approved' ? 'bg-green-100 text-green-800' :
            vs === 'rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {vs}
          </span>
        );
      }
    },
    {
      header: 'Actions',
      render: (row) => (
        <button onClick={() => handleViewDetails(row)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition" title="View Details">
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  const pendingCount  = allVendors.filter(v => v.verification_status === 'pending').length;
  const approvedCount = allVendors.filter(v => v.verification_status === 'approved').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600 mt-1">Manage vendor accounts and approve new registrations</p>
        </div>
        <button onClick={fetchVendors} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600">Total Vendors</p>
          <p className="text-2xl font-bold text-gray-900">{allVendors.length}</p>
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

      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by shop name, owner, or phone..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Verifications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Filter by city..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm">
        <Table columns={columns} data={filteredVendors} loading={loading} />
      </div>

      {selectedVendor && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Vendor: ${selectedVendor.shop_name || 'Details'}`}>
          <VendorDetailsModal vendor={selectedVendor} onClose={() => setIsModalOpen(false)} onUpdate={fetchVendors} />
        </Modal>
      )}
    </div>
  );
};

export default VendorsPage;