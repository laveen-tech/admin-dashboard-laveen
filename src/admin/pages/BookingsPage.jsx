import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, Search, Eye, Edit, Trash2, Plus, X, Save,
  Clock, DollarSign, User, Store, CheckCircle, XCircle, 
  AlertCircle, Filter, Download, RefreshCw
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

// Booking Status Badge Component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    confirmed: { color: 'blue', label: 'Confirmed', icon: CheckCircle },
    completed: { color: 'green', label: 'Completed', icon: CheckCircle },
    cancelled: { color: 'red', label: 'Cancelled', icon: XCircle },
    pending: { color: 'yellow', label: 'Pending', icon: Clock },
    no_show: { color: 'gray', label: 'No Show', icon: AlertCircle }
  };

  const config = statusConfig[status] || statusConfig.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.label}
    </span>
  );
};

// Payment Status Badge Component
const PaymentBadge = ({ status }) => {
  const statusConfig = {
    paid: { color: 'green', label: 'Paid' },
    pending: { color: 'yellow', label: 'Pending' },
    failed: { color: 'red', label: 'Failed' },
    refunded: { color: 'purple', label: 'Refunded' }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
      {config.label}
    </span>
  );
};

// Create Booking Form Component
const CreateBookingForm = ({ onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    vendor_id: '',
    booking_date: '',
    services: [],
    payment_method: 'cash',
    payment_status: 'pending'
  });

  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState({ customers: false, vendors: false, services: false });
  const [errors, setErrors] = useState({});

  // Load customers
  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(prev => ({ ...prev, customers: true }));
      try {
        const response = await apiService.getAllUsers({ limit: 1000 });
        console.log('👥 Customers API response:', response);
        
        // Handle multiple possible response structures
        let users = [];
        if (response.data?.users) {
          users = response.data.users;
        } else if (response.users) {
          users = response.users;
        } else if (response.data && Array.isArray(response.data)) {
          users = response.data;
        } else if (Array.isArray(response)) {
          users = response;
        }
        
        console.log('👥 Parsed users:', users);
        
        // Filter for customers only
        const customerList = users.filter(u => u.user_type === 'customer' || u.user_type === 'CUSTOMER');
        console.log('👥 Filtered customers:', customerList);
        
        setCustomers(customerList);
      } catch (error) {
        console.error('❌ Failed to load customers:', error);
        setCustomers([]);
      } finally {
        setLoading(prev => ({ ...prev, customers: false }));
      }
    };
    loadCustomers();
  }, []);

  // Load vendors
  useEffect(() => {
    const loadVendors = async () => {
      setLoading(prev => ({ ...prev, vendors: true }));
      try {
        const response = await apiService.getAllVendors({ limit: 1000 });
        console.log('🏪 Vendors API response:', response);
        
        // Handle multiple possible response structures
        let vendorsList = [];
        if (response.data?.vendors) {
          vendorsList = response.data.vendors;
        } else if (response.vendors) {
          vendorsList = response.vendors;
        } else if (response.data && Array.isArray(response.data)) {
          vendorsList = response.data;
        } else if (Array.isArray(response)) {
          vendorsList = response;
        }
        
        console.log('🏪 Parsed vendors:', vendorsList);
        
        // Filter for approved vendors only
        const approvedVendors = vendorsList.filter(v => 
          v.verification_status === 'approved' || v.verification_status === 'APPROVED'
        );
        console.log('🏪 Approved vendors:', approvedVendors);
        
        setVendors(approvedVendors);
      } catch (error) {
        console.error('❌ Failed to load vendors:', error);
        setVendors([]);
      } finally {
        setLoading(prev => ({ ...prev, vendors: false }));
      }
    };
    loadVendors();
  }, []);

  // Load services when vendor is selected
  useEffect(() => {
    const loadServices = async () => {
      if (!formData.vendor_id) {
        setAvailableServices([]);
        return;
      }

      setLoading(prev => ({ ...prev, services: true }));
      try {
        const response = await apiService.getVendorServicesForBooking(formData.vendor_id);
        console.log('🔧 Services API response:', response);
        
        // Handle multiple possible response structures
        let servicesList = [];
        if (response.data?.services) {
          servicesList = response.data.services;
        } else if (response.services) {
          servicesList = response.services;
        } else if (response.data && Array.isArray(response.data)) {
          servicesList = response.data;
        } else if (Array.isArray(response)) {
          servicesList = response;
        }
        
        console.log('🔧 Parsed services:', servicesList);
        
        // Filter for available services only
        const availableList = servicesList.filter(s => 
          s.is_available !== false && 
          (s.status === 'active' || s.status === 'ACTIVE' || !s.status)
        );
        console.log('🔧 Available services:', availableList);
        
        setAvailableServices(availableList);
      } catch (error) {
        console.error('❌ Failed to load services:', error);
        setAvailableServices([]);
      } finally {
        setLoading(prev => ({ ...prev, services: false }));
      }
    };
    loadServices();
  }, [formData.vendor_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleAddService = (service) => {
    if (selectedServices.find(s => s.service_id === service.service_id)) {
      alert('Service already added');
      return;
    }

    const lastService = selectedServices[selectedServices.length - 1];
    const startTime = lastService 
      ? calculateEndTime(lastService.start_time, lastService.duration_minutes)
      : '09:00';

    setSelectedServices([...selectedServices, {
      service_id: service.service_id,
      service_name: service.service_name,
      service_price: parseFloat(service.price || service.base_price || 0),
      duration_minutes: service.duration_minutes || 30,
      start_time: startTime,
      end_time: calculateEndTime(startTime, service.duration_minutes || 30)
    }]);
  };

  const handleRemoveService = (index) => {
    const newServices = selectedServices.filter((_, i) => i !== index);
    // Recalculate times
    const recalculated = recalculateServiceTimes(newServices);
    setSelectedServices(recalculated);
  };

  const handleServiceTimeChange = (index, field, value) => {
    const newServices = [...selectedServices];
    newServices[index][field] = value;
    
    if (field === 'start_time') {
      newServices[index].end_time = calculateEndTime(value, newServices[index].duration_minutes);
    }
    
    setSelectedServices(newServices);
  };

  const calculateEndTime = (startTime, durationMinutes) => {
    if (!startTime) return '';
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  };

  const recalculateServiceTimes = (services) => {
    let currentTime = '09:00';
    return services.map(service => {
      const startTime = currentTime;
      const endTime = calculateEndTime(startTime, service.duration_minutes);
      currentTime = endTime;
      return { ...service, start_time: startTime, end_time: endTime };
    });
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, service) => sum + parseFloat(service.service_price), 0);
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.customer_id) {
      newErrors.customer_id = 'Customer is required';
    }

    if (!formData.vendor_id) {
      newErrors.vendor_id = 'Vendor is required';
    }

    if (!formData.booking_date) {
      newErrors.booking_date = 'Booking date is required';
    } else {
      const selectedDate = new Date(formData.booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.booking_date = 'Booking date cannot be in the past';
      }
    }

    if (selectedServices.length === 0) {
      newErrors.services = 'At least one service is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const bookingData = {
        customer_id: parseInt(formData.customer_id),
        vendor_id: parseInt(formData.vendor_id),
        booking_date: formData.booking_date,
        total_amount: calculateTotal(),
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
        services: selectedServices.map(s => ({
          service_id: s.service_id,
          service_name: s.service_name,
          service_price: s.service_price,
          start_time: s.start_time,
          end_time: s.end_time,
          duration_minutes: s.duration_minutes
        }))
      };
      onSubmit(bookingData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Customer & Vendor Selection */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Booking Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Customer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.user_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading.customers}
            >
              <option value="">
                {loading.customers ? 'Loading customers...' : 'Select customer'}
              </option>
              {customers.map(customer => (
                <option key={customer.user_id} value={customer.user_id}>
                  {customer.full_name || customer.name || 'Unnamed'} 
                  {' - '}
                  {customer.phone_number || customer.phone || customer.email || 'No contact'}
                </option>
              ))}
            </select>
            {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
            {!loading.customers && customers.length === 0 && (
              <p className="text-yellow-600 text-xs mt-1">⚠️ No customers found. Please add customers first.</p>
            )}
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salon/Vendor <span className="text-red-500">*</span>
            </label>
            <select
              name="vendor_id"
              value={formData.vendor_id}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.vendor_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading.vendors}
            >
              <option value="">
                {loading.vendors ? 'Loading vendors...' : 'Select vendor'}
              </option>
              {vendors.map(vendor => (
                <option key={vendor.user_id} value={vendor.user_id}>
                  {vendor.full_name || vendor.name || 'Unnamed'} 
                  {vendor.shop_name || vendor.shop_details?.shop_name ? ` - ${vendor.shop_name || vendor.shop_details?.shop_name}` : ''}
                </option>
              ))}
            </select>
            {errors.vendor_id && <p className="text-red-500 text-xs mt-1">{errors.vendor_id}</p>}
            {!loading.vendors && vendors.length === 0 && (
              <p className="text-yellow-600 text-xs mt-1">⚠️ No approved vendors found. Please approve vendors first.</p>
            )}
          </div>
        </div>

        {/* Booking Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Booking Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="booking_date"
            value={formData.booking_date}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.booking_date ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.booking_date && <p className="text-red-500 text-xs mt-1">{errors.booking_date}</p>}
        </div>

        {/* Payment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Status
            </label>
            <select
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Services Selection */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">
          Select Services <span className="text-red-500">*</span>
        </h4>

        {!formData.vendor_id ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
            <Store className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Please select a vendor first</p>
          </div>
        ) : loading.services ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading services...</p>
          </div>
        ) : availableServices.length === 0 ? (
          <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-2" />
            <p className="text-yellow-800">No services available for this vendor</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2">
            {availableServices.map(service => (
              <button
                key={service.service_id}
                type="button"
                onClick={() => handleAddService(service)}
                className="p-3 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition text-left"
              >
                <div className="font-medium">{service.service_name}</div>
                <div className="text-sm text-gray-600 flex items-center justify-between mt-1">
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {service.duration_minutes || 30} min
                  </span>
                  <span className="font-semibold text-green-600">
                    ₹{parseFloat(service.price || service.base_price || 0).toFixed(2)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {errors.services && <p className="text-red-500 text-xs mt-1">{errors.services}</p>}
      </div>

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900 border-b pb-2">
            Selected Services ({selectedServices.length})
          </h4>

          <div className="space-y-3">
            {selectedServices.map((service, index) => (
              <div key={index} className="p-4 border border-gray-300 rounded-lg bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h5 className="font-medium">{service.service_name}</h5>
                    <p className="text-sm text-gray-600">
                      Duration: {service.duration_minutes} minutes
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-green-600">
                      ₹{parseFloat(service.service_price).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(index)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      value={service.start_time}
                      onChange={(e) => handleServiceTimeChange(index, 'start_time', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Time</label>
                    <input
                      type="time"
                      value={service.end_time}
                      readOnly
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total Amount */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Create Booking
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Booking Details Modal Component
const BookingDetailsModal = ({ booking, onClose, onUpdateStatus, onCancel }) => {
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(booking.booking_status);
  const [newPaymentStatus, setNewPaymentStatus] = useState(booking.payment_status);

  const handleUpdateStatus = async () => {
    setUpdating(true);
    try {
      await onUpdateStatus(booking.booking_id, {
        booking_status: newStatus,
        payment_status: newPaymentStatus
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-xl font-bold text-gray-900">Booking #{booking.booking_id}</h4>
            <p className="text-sm text-gray-600 mt-1">
              Created: {new Date(booking.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <StatusBadge status={booking.booking_status} />
            <PaymentBadge status={booking.payment_status} />
          </div>
        </div>
      </div>

      {/* Customer & Vendor Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="flex items-center mb-2">
            <User className="w-5 h-5 text-gray-600 mr-2" />
            <h5 className="font-semibold">Customer</h5>
          </div>
          <p className="text-sm"><span className="font-medium">Name:</span> {booking.customer_name}</p>
          <p className="text-sm"><span className="font-medium">Email:</span> {booking.customer_email}</p>
          <p className="text-sm"><span className="font-medium">Phone:</span> {booking.customer_phone}</p>
        </div>

        <div className="p-4 border rounded-lg">
          <div className="flex items-center mb-2">
            <Store className="w-5 h-5 text-gray-600 mr-2" />
            <h5 className="font-semibold">Vendor</h5>
          </div>
          <p className="text-sm"><span className="font-medium">Name:</span> {booking.vendor_name}</p>
          <p className="text-sm"><span className="font-medium">Shop:</span> {booking.shop_name || 'N/A'}</p>
          <p className="text-sm"><span className="font-medium">Phone:</span> {booking.vendor_phone}</p>
        </div>
      </div>

      {/* Booking Details */}
      <div className="p-4 border rounded-lg">
        <h5 className="font-semibold mb-3">Booking Details</h5>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Date:</span>
            <span className="ml-2 font-medium">{new Date(booking.booking_date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-600">Payment Method:</span>
            <span className="ml-2 font-medium capitalize">{booking.payment_method}</span>
          </div>
          <div>
            <span className="text-gray-600">Total Amount:</span>
            <span className="ml-2 font-bold text-green-600">₹{parseFloat(booking.total_amount).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="p-4 border rounded-lg">
        <h5 className="font-semibold mb-3">Services ({booking.services?.length || 0})</h5>
        <div className="space-y-2">
          {booking.services && booking.services.map((service, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
              <div className="flex-1">
                <p className="font-medium">{service.service_name}</p>
                <p className="text-xs text-gray-600">
                  <Clock className="w-3 h-3 inline mr-1" />
                  {service.start_time} - {service.end_time} ({service.duration_minutes} min)
                </p>
              </div>
              <span className="font-semibold text-green-600">
                ₹{parseFloat(service.service_price).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Update Status */}
      {booking.booking_status !== 'cancelled' && (
        <div className="p-4 bg-gray-50 border rounded-lg">
          <h5 className="font-semibold mb-3">Update Status</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Booking Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="no_show">No Show</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleUpdateStatus}
            disabled={updating}
            className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
          >
            {updating ? 'Updating...' : 'Update Status'}
          </button>
        </div>
      )}

      {/* Cancellation Info */}
      {booking.booking_status === 'cancelled' && booking.cancellation_reason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h5 className="font-semibold text-red-900 mb-2">Cancellation Details</h5>
          <p className="text-sm text-red-800">
            <span className="font-medium">Reason:</span> {booking.cancellation_reason}
          </p>
          <p className="text-sm text-red-800">
            <span className="font-medium">Cancelled by:</span> {booking.cancelled_by}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        {booking.booking_status !== 'cancelled' && booking.booking_status !== 'completed' && (
          <button
            onClick={() => onCancel(booking.booking_id)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Cancel Booking
          </button>
        )}
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Main Bookings Page Component
const BookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    booking_status: '',
    payment_status: '',
    search: '',
    date_from: '',
    date_to: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllBookings({
        page: filters.page,
        limit: filters.limit,
        booking_status: filters.booking_status,
        payment_status: filters.payment_status,
        date_from: filters.date_from,
        date_to: filters.date_to,
        search: debouncedSearch
      });
      
      setBookings(response.data?.bookings || response.bookings || []);
      setPagination(response.data?.pagination || response.pagination || {
        page: filters.page,
        limit: filters.limit,
        total: (response.data?.bookings || response.bookings || []).length,
        totalPages: 1
      });
    } catch (err) {
      console.error('❌ Failed to fetch bookings:', err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleViewDetails = async (booking) => {
    try {
      const response = await apiService.getBookingById(booking.booking_id);
      setSelectedBooking(response.data || response);
      setIsDetailsModalOpen(true);
    } catch (error) {
      console.error('Failed to load booking details:', error);
      alert('Failed to load booking details');
    }
  };

  const handleCreateBooking = async (bookingData) => {
    setIsSubmitting(true);
    try {
      await apiService.createBooking(bookingData);
      alert('Booking created successfully!');
      setIsCreateModalOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('❌ Failed to create booking:', error);
      alert(error.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (bookingId, statusData) => {
    try {
      await apiService.updateBookingStatus(bookingId, statusData);
      alert('Status updated successfully!');
      setIsDetailsModalOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      alert('Failed to update status');
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingToCancel || !cancellationReason.trim()) {
      alert('Please provide a cancellation reason');
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.cancelBooking(bookingToCancel, {
        cancellation_reason: cancellationReason,
        cancelled_by: 'admin'
      });
      alert('Booking cancelled successfully');
      setIsCancelModalOpen(false);
      setBookingToCancel(null);
      setCancellationReason('');
      setIsDetailsModalOpen(false);
      fetchBookings();
    } catch (error) {
      console.error('❌ Failed to cancel booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { 
      header: 'ID', 
      field: 'booking_id',
      render: (row) => <span className="font-mono text-xs">#{row.booking_id}</span>
    },
    {
      header: 'Customer',
      render: (row) => (
        <div>
          <span className="font-medium block">{row.customer_name}</span>
          <span className="text-xs text-gray-500">{row.customer_email}</span>
        </div>
      )
    },
    {
      header: 'Vendor',
      render: (row) => (
        <div>
          <span className="font-medium block">{row.vendor_name}</span>
          <span className="text-xs text-gray-500">{row.shop_name || 'No shop'}</span>
        </div>
      )
    },
    {
      header: 'Date',
      render: (row) => (
        <span className="text-sm">{new Date(row.booking_date).toLocaleDateString()}</span>
      )
    },
    {
      header: 'Services',
      render: (row) => (
        <span className="text-sm">{row.services_count || 0} service(s)</span>
      )
    },
    {
      header: 'Amount',
      render: (row) => (
        <span className="text-sm font-semibold text-green-600">
          ₹{parseFloat(row.total_amount).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => <StatusBadge status={row.booking_status} />
    },
    {
      header: 'Payment',
      render: (row) => <PaymentBadge status={row.payment_status} />
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

  const totalBookings = pagination.total || 0;
  const confirmedCount = bookings.filter(b => b.booking_status === 'confirmed').length;
  const completedCount = bookings.filter(b => b.booking_status === 'completed').length;
  const cancelledCount = bookings.filter(b => b.booking_status === 'cancelled').length;

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
          <p className="text-gray-600 mt-1">Manage all bookings and appointments</p>
        </div>
        <div className="flex space-x-3">
         <button
  onClick={() => {
    setFilters({
      booking_status: '',
      payment_status: '',
      search: '',
      date_from: '',
      date_to: '',
      page: 1,
      limit: 10
    });
    // fetchBookings will re-run automatically via the useEffect dependency on `filters`
  }}
  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center"
>
  <RefreshCw className="w-4 h-4 mr-2" />
  Refresh
</button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Booking
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Bookings</p>
          <p className="text-2xl font-bold text-gray-900">{totalBookings}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold text-yellow-600">{confirmedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Completed</p>
          <p className="text-2xl font-bold text-green-600">{completedCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{cancelledCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search bookings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
            />
          </div>

          {/* Booking Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.booking_status}
            onChange={(e) => setFilters({...filters, booking_status: e.target.value, page: 1})}
          >
            <option value="">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>

          {/* Payment Status Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.payment_status}
            onChange={(e) => setFilters({...filters, payment_status: e.target.value, page: 1})}
          >
            <option value="">All Payments</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Date From */}
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.date_from}
            onChange={(e) => setFilters({...filters, date_from: e.target.value, page: 1})}
            placeholder="From Date"
          />

          {/* Date To */}
          <input
            type="date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.date_to}
            onChange={(e) => setFilters({...filters, date_to: e.target.value, page: 1})}
            placeholder="To Date"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table columns={columns} data={bookings} loading={loading} />
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} bookings
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

      {/* Modals */}
      {selectedBooking && isDetailsModalOpen && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Booking #${selectedBooking.booking_id} Details`}
          size="large"
        >
          <BookingDetailsModal
            booking={selectedBooking}
            onClose={() => setIsDetailsModalOpen(false)}
            onUpdateStatus={handleUpdateStatus}
            onCancel={(bookingId) => {
              setBookingToCancel(bookingId);
              setIsCancelModalOpen(true);
            }}
          />
        </Modal>
      )}

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Booking"
        size="large"
      >
        <CreateBookingForm
          onSubmit={handleCreateBooking}
          onCancel={() => setIsCreateModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Booking"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to cancel this booking? This action cannot be undone.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Please provide a reason for cancellation..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsCancelModalOpen(false)}
              disabled={isSubmitting}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Keep Booking
            </button>
            <button
              onClick={handleCancelBooking}
              disabled={isSubmitting || !cancellationReason.trim()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BookingsPage;