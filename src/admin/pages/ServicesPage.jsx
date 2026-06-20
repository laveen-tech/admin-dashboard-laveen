import React, { useState, useEffect, useCallback } from 'react';
import { 
  Scissors, Search, Eye, Edit, Trash2, Plus, X, Save,
  Clock, DollarSign, Tag, FileText, CheckCircle, XCircle, AlertCircle
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

// Service Form Component
const ServiceForm = ({ service, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    service_name: service?.service_name || '',
    description: service?.description || '',
    duration_minutes: service?.duration_minutes || 30,
    base_price: service?.base_price || '',
    category: service?.category || '',
    is_available: service?.is_available !== undefined ? service.is_available : true,
    image_url: service?.image_url || '',
    requirements: service?.requirements || '',
    benefits: service?.benefits || ''
  });

  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await apiService.getAllCategories({ is_active: 'true' });
        const cats = response.data?.categories || response.categories || [];
        setCategories(cats);
      } catch (error) {
        console.error('Failed to load categories:', error);
        // Fallback to hardcoded categories if API fails
        setCategories([
          { category_id: 1, category_name: 'Hair Cut' },
          { category_id: 2, category_name: 'Hair Styling' },
          { category_id: 3, category_name: 'Beard & Shave' },
          { category_id: 4, category_name: 'Facial' },
          { category_id: 5, category_name: 'Massage' }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.service_name.trim()) {
      newErrors.service_name = 'Service name is required';
    } else if (formData.service_name.length < 3) {
      newErrors.service_name = 'Service name must be at least 3 characters';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    if (!formData.duration_minutes || formData.duration_minutes < 5) {
      newErrors.duration_minutes = 'Duration must be at least 5 minutes';
    } else if (formData.duration_minutes > 480) {
      newErrors.duration_minutes = 'Duration cannot exceed 480 minutes (8 hours)';
    }

    if (!formData.base_price || formData.base_price < 0) {
      newErrors.base_price = 'Base price is required and must be positive';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Sanitize data
      const sanitizedData = {
        ...formData,
        service_name: formData.service_name.trim(),
        description: formData.description?.trim() || null,
        duration_minutes: parseInt(formData.duration_minutes),
        base_price: parseFloat(formData.base_price),
        category: formData.category.trim(),
        image_url: formData.image_url?.trim() || null,
        requirements: formData.requirements?.trim() || null,
        benefits: formData.benefits?.trim() || null
      };
      onSubmit(sanitizedData);
    }
  };

  const durationOptions = [
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 45, label: '45 minutes' },
    { value: 60, label: '1 hour' },
    { value: 90, label: '1.5 hours' },
    { value: 120, label: '2 hours' },
    { value: 180, label: '3 hours' },
    { value: 240, label: '4 hours' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
        
        {/* Service Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="service_name"
            value={formData.service_name}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.service_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Premium Hair Cut, Bridal Makeup, etc."
          />
          {errors.service_name && (
            <p className="text-red-500 text-xs mt-1">{errors.service_name}</p>
          )}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          {loadingCategories ? (
            <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <span className="text-gray-500">Loading categories...</span>
            </div>
          ) : (
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.category_id} value={cat.category_name}>
                  {cat.icon && `${cat.icon} `}{cat.category_name}
                </option>
              ))}
            </select>
          )}
          {errors.category && (
            <p className="text-red-500 text-xs mt-1">{errors.category}</p>
          )}
          {!loadingCategories && categories.length === 0 && (
            <p className="text-yellow-600 text-xs mt-1">
              ⚠️ No categories available. Please create categories first.
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="3"
            placeholder="Describe the service in detail..."
            maxLength="500"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.description.length}/500 characters
            </p>
          </div>
        </div>
      </div>

      {/* Pricing & Duration */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Pricing & Duration</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration <span className="text-red-500">*</span>
            </label>
            <select
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.duration_minutes ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {durationOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            {errors.duration_minutes && (
              <p className="text-red-500 text-xs mt-1">{errors.duration_minutes}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Default: 30 minutes for new services
            </p>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={handleChange}
              min="0"
              step="0.01"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.base_price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter base price"
            />
            {errors.base_price && (
              <p className="text-red-500 text-xs mt-1">{errors.base_price}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              This is the starting price. Vendors can adjust.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Details */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Additional Details</h4>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Requirements (Optional)
          </label>
          <textarea
            name="requirements"
            value={formData.requirements}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="e.g., Clean hair, No makeup, etc."
          />
          <p className="text-xs text-gray-500 mt-1">
            Special requirements or preparations needed
          </p>
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Benefits (Optional)
          </label>
          <textarea
            name="benefits"
            value={formData.benefits}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="e.g., Reduces hair fall, Improves skin texture, etc."
          />
          <p className="text-xs text-gray-500 mt-1">
            Key benefits customers will get from this service
          </p>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Image URL (Optional)
          </label>
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/service-image.jpg"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL of service image for display
          </p>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_available"
            name="is_available"
            checked={formData.is_available}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
            Service is available for booking
          </label>
        </div>
      </div>

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
              {service ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {service ? 'Update Service' : 'Create Service'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Service Details Modal Component
const ServiceDetailsModal = ({ service, onClose, onEdit }) => {
  const getAvailabilityBadge = (isAvailable) => {
    return isAvailable ? (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Available
      </span>
    ) : (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Unavailable
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Service Header */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
            <Scissors className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">
                  {service.service_name}
                </h4>
               <p className="text-sm text-gray-600 flex items-center mt-1">
  <Tag className="w-4 h-4 mr-1" />
  Category:&nbsp;
  <span className="inline-flex items-center px-2 py-0.5 ml-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
    {service.category}
  </span>
</p>
              </div>
              {getAvailabilityBadge(service.is_available)}
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {service.description && (
        <div className="p-4 bg-white border rounded-lg">
          <h5 className="font-semibold mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gray-600" />
            Description
          </h5>
          <p className="text-sm text-gray-700">{service.description}</p>
        </div>
      )}
<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <h5 className="font-semibold mb-2 text-blue-900 flex items-center">
    <Tag className="w-4 h-4 mr-2" />
    Category
  </h5>
  <span className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-semibold rounded-lg">
    {service.category}
  </span>
</div>

      {/* Pricing & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white border rounded-lg">
          <p className="text-sm text-gray-600 mb-1 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Duration
          </p>
          <p className="text-2xl font-bold text-blue-600">
            {service.duration_minutes} min
          </p>
        </div>
        <div className="p-4 bg-white border rounded-lg">
          <p className="text-sm text-gray-600 mb-1 flex items-center">
            <DollarSign className="w-4 h-4 mr-1" />
            Base Price
          </p>
          <p className="text-2xl font-bold text-green-600">
            ₹{parseFloat(service.base_price).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Requirements */}
      {service.requirements && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h5 className="font-semibold mb-2 text-yellow-900 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Requirements
          </h5>
          <p className="text-sm text-yellow-800">{service.requirements}</p>
        </div>
      )}

      {/* Benefits */}
      {service.benefits && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h5 className="font-semibold mb-2 text-green-900 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Benefits
          </h5>
          <p className="text-sm text-green-800">{service.benefits}</p>
        </div>
      )}

      {/* Image */}
      {service.image_url && (
        <div className="p-4 bg-white border rounded-lg">
          <h5 className="font-semibold mb-3">Service Image</h5>
          <img 
            src={service.image_url} 
            alt={service.service_name}
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Metadata */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Service ID</p>
            <p className="font-mono font-medium">{service.service_id}</p>
          </div>
          <div>
            <p className="text-gray-600">Created</p>
            <p className="font-medium">
              {new Date(service.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          Close
        </button>
        <button
          onClick={onEdit}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit Service
        </button>
      </div>
    </div>
  );
};

// Main Services Page Component
const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    is_available: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedService, setSelectedService] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState([]);

  useEffect(() => {
    apiService.getAllCategories({ is_active: 'true', limit: 100 })
      .then(res => setCategoryOptions(res.data?.categories || []))
      .catch(() => {});
  }, []);

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllServices({
        page: filters.page,
        limit: filters.limit,
        category: filters.category,
        is_available: filters.is_available,
        search: debouncedSearch
      });
      
      setServices(response.data?.services || response.services || []);
      setPagination(response.data?.pagination || response.pagination || {
        page: filters.page,
        limit: filters.limit,
        total: (response.data?.services || response.services || []).length,
        totalPages: Math.ceil((response.data?.services || response.services || []).length / filters.limit)
      });
    } catch (err) {
      console.error('❌ Failed to fetch services:', err);
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setIsDetailsModalOpen(true);
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setEditMode(false);
    setIsFormModalOpen(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setEditMode(true);
    setIsDetailsModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editMode && selectedService) {
        await apiService.updateService(selectedService.service_id, formData);
        alert('Service updated successfully!');
      } else {
        await apiService.createService(formData);
        alert('Service created successfully!');
      }
      setIsFormModalOpen(false);
      setSelectedService(null);
      fetchServices();
    } catch (error) {
      console.error('❌ Failed to save service:', error);
      alert(error.message || `Failed to ${editMode ? 'update' : 'create'} service`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    try {
      await apiService.deleteService(serviceToDelete.service_id);
      setIsDeleteModalOpen(false);
      setServiceToDelete(null);
      fetchServices();
      alert('Service deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete service:', error);
      alert(`Failed to delete service: ${error.message}`);
    }
  };

  const handleToggleAvailability = async (service) => {
    try {
      await apiService.updateService(service.service_id, {
        is_available: !service.is_available
      });
      fetchServices();
      alert(`Service ${!service.is_available ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      console.error('❌ Failed to toggle availability:', error);
      alert('Failed to update service availability');
    }
  };

  const columns = [
    { 
      header: 'ID', 
      field: 'service_id',
      render: (row) => <span className="font-mono text-xs">{row.service_id}</span>
    },
    {
  header: 'Service Name',
  render: (row) => (
    <div className="flex items-center space-x-2">
      <Scissors className="w-5 h-5 text-blue-600 flex-shrink-0" />
      <div>
        <span className="font-medium block">{row.service_name}</span>
        <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
          <Tag className="w-3 h-3" />
          {row.category || '—'}
        </span>
      </div>
    </div>
  )
},
    {
      header: 'Duration',
      render: (row) => (
        <span className="text-sm flex items-center">
          <Clock className="w-4 h-4 mr-1 text-gray-500" />
          {row.duration_minutes} min
        </span>
      )
    },
{
  header: 'Created By',
  render: (row) => (
    <span className={`text-sm font-medium ${
      row.created_by_label === 'Admin' 
        ? 'text-purple-700' 
        : 'text-blue-600'
    }`}>
      {row.created_by_label === 'Admin' ? '🔧 Admin' : `🏪 ${row.created_by_label}`}
    </span>
  )
},
    {
      header: 'Base Price',
      render: (row) => (
        <span className="text-sm font-semibold text-green-600">
          ₹{parseFloat(row.base_price).toFixed(2)}
        </span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <button
          onClick={() => handleToggleAvailability(row)}
          className={`px-2 py-1 rounded-full text-xs font-medium transition ${
            row.is_available 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {row.is_available ? 'Available' : 'Unavailable'}
        </button>
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
          <button
            onClick={() => handleEditService(row)}
            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition"
            title="Edit Service"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setServiceToDelete(row);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="Delete Service"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const availableCount = services.filter(s => s.is_available).length;
  const unavailableCount = services.filter(s => !s.is_available).length;

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
          <p className="text-gray-600 mt-1">Manage salon/shop services and pricing</p>
        </div>
        <button
          onClick={handleCreateService}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Service
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Services</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Available</p>
          <p className="text-2xl font-bold text-green-600">{availableCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Unavailable</p>
          <p className="text-2xl font-bold text-red-600">{unavailableCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search services..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
            />
          </div>

          {/* Category Filter */}
        <select
  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
  value={filters.category}
  onChange={(e) => setFilters({...filters, category: e.target.value, page: 1})}
>
  <option value="">All Categories</option>
  {categoryOptions.map(cat => (
    <option key={cat.category_id} value={cat.category_name}>
      {cat.icon ? `${cat.icon} ` : ''}{cat.category_name}
    </option>
  ))}
</select>

          {/* Availability Filter */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.is_available}
            onChange={(e) => setFilters({...filters, is_available: e.target.value, page: 1})}
          >
            <option value="">All Status</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table columns={columns} data={services} loading={loading} />
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} services
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
      {selectedService && isDetailsModalOpen && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={`Service Details: ${selectedService.service_name}`}
          size="large"
        >
          <ServiceDetailsModal
            service={selectedService}
            onClose={() => setIsDetailsModalOpen(false)}
            onEdit={() => handleEditService(selectedService)}
          />
        </Modal>
      )}

      {/* Create/Edit Form Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editMode ? 'Edit Service' : 'Create New Service'}
        size="large"
      >
        <ServiceForm
          service={editMode ? selectedService : null}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsFormModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete service <strong>{serviceToDelete?.service_name}</strong>?
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
              onClick={handleDeleteService}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete Service
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServicesPage;