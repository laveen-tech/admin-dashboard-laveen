import React, { useState, useEffect, useCallback } from 'react';
import { 
  Tag, Search, Eye, Edit, Trash2, Plus, X, Save,
  Grid, List, CheckCircle, XCircle, AlertCircle
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

// Category Form Component
// Enhanced Category Form Component with Responsive Design
const CategoryForm = ({ category, onSubmit, onCancel, isSubmitting }) => {
  const [formData, setFormData] = useState({
    category_name: category?.category_name || '',
    description: category?.description || '',
    icon: category?.icon || '',
    color: category?.color || '#3B82F6',
    display_order: category?.display_order || 1,
    is_active: category?.is_active !== undefined ? category.is_active : true
  });

  const [errors, setErrors] = useState({});

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

    if (!formData.category_name.trim()) {
      newErrors.category_name = 'Category name is required';
    } else if (formData.category_name.length < 2) {
      newErrors.category_name = 'Category name must be at least 2 characters';
    } else if (formData.category_name.length > 50) {
      newErrors.category_name = 'Category name cannot exceed 50 characters';
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = 'Description cannot exceed 200 characters';
    }

    if (formData.icon && formData.icon.length > 20) {
      newErrors.icon = 'Icon is too long (max 20 characters)';
    }

    if (formData.display_order && (formData.display_order < 1 || formData.display_order > 100)) {
      newErrors.display_order = 'Display order must be between 1 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Sanitize data
      const sanitizedData = {
        category_name: formData.category_name.trim(),
        description: formData.description?.trim() || null,
        icon: formData.icon?.trim() || null,
        color: formData.color || '#3B82F6',
        display_order: parseInt(formData.display_order) || 1,
        is_active: formData.is_active
      };
      onSubmit(sanitizedData);
    }
  };

  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#9333EA' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Yellow', value: '#F59E0B' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Cyan', value: '#06B6D4' },
    { name: 'Lime', value: '#84CC16' },
    { name: 'Rose', value: '#F43F5E' }
  ];

  const iconOptions = [
    '✂️', '💇', '💆', '💅', '🧖', '💄', '🪒', '🎨', 
    '💐', '🌸', '✨', '⭐', '💫', '🎯', '🏆', '👑',
    '🎭', '🌟', '💎', '🔥', '🌈', '🦋', '🌺', '🎪'
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Basic Information */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2 text-sm sm:text-base">Basic Information</h4>
        
        {/* Category Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="category_name"
            value={formData.category_name}
            onChange={handleChange}
            className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition ${
              errors.category_name ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="e.g., Hair Cut, Facial, Massage"
            maxLength="50"
          />
          {errors.category_name ? (
            <p className="text-red-500 text-xs mt-1">{errors.category_name}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              {formData.category_name.length}/50 characters
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Optional)
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            rows="3"
            placeholder="Brief description of this category..."
            maxLength="200"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.description && (
              <p className="text-red-500 text-xs">{errors.description}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {formData.description.length}/200 characters
            </p>
          </div>
        </div>
      </div>

      {/* Visual Settings */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2 text-sm sm:text-base">Visual Settings</h4>

        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
          
          {/* ✅ Enhanced Icon Selector - Responsive */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Icon (Optional)
            </label>
            
            {/* Icon Grid - Responsive columns: 4 on mobile, 6 on tablet, 8 on desktop */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-6 xl:grid-cols-8 gap-2 mb-3">
              {iconOptions.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`
                    aspect-square 
                    flex items-center justify-center
                    text-xl sm:text-2xl
                    border-2 rounded-xl
                    transition-all duration-200
                    hover:scale-110 hover:shadow-lg active:scale-95
                    ${formData.icon === icon 
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105 ring-2 ring-blue-200' 
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/50'
                    }
                  `}
                  title={icon}
                >
                  <span className="select-none">{icon}</span>
                </button>
              ))}
            </div>
            
            {/* Custom Icon Input */}
            <div className="relative">
              <input
                type="text"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2.5 pl-10 sm:pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition"
                placeholder="Or enter custom emoji (e.g., 🎨)"
                maxLength="20"
              />
              {formData.icon && (
                <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 text-xl sm:text-2xl pointer-events-none">
                  {formData.icon}
                </div>
              )}
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Click an icon above or type your own emoji
            </p>
          </div>

          {/* ✅ Enhanced Color Selector - Responsive */}
         
        </div>
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 sm:gap-6">
         <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Color Theme
            </label>
            
            {/* Color Grid - Responsive */}
            <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-3">
              {colorOptions.map(color => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`
                    aspect-square rounded-xl
                    border-4 transition-all duration-200
                    hover:scale-110 hover:shadow-lg active:scale-95
                    ${formData.color === color.value 
                      ? 'border-gray-900 scale-110 shadow-lg ring-2 ring-gray-400' 
                      : 'border-white hover:border-gray-300'
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {formData.color === color.value && (
                    <div className="flex items-center justify-center h-full">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Custom Color Picker */}
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-16 h-10 sm:w-20 sm:h-12 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition"
                title="Choose custom color"
              />
              <span className="text-xs sm:text-sm text-gray-600 font-mono">
                {formData.color}
              </span>
            </div>
            
            <p className="text-xs text-gray-500 mt-2">
              Select a preset or choose custom color
            </p>
          </div>
          </div>

        {/* ✅ Enhanced Preview - Responsive */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200">
          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-3">Preview</p>
          <div className="flex items-center justify-center">
            <div 
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
              style={{ backgroundColor: formData.color }}
            >
              {formData.icon && (
                <span className="mr-2 text-xl sm:text-2xl">{formData.icon}</span>
              )}
              <span className="break-words">
                {formData.category_name || 'Category Name'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Display Settings */}
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2 text-sm sm:text-base">Display Settings</h4>

        {/* Display Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Display Order
          </label>
          <input
            type="number"
            name="display_order"
            value={formData.display_order}
            onChange={handleChange}
            min="1"
            max="100"
            className={`w-full px-3 sm:px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base transition ${
              errors.display_order ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.display_order && (
            <p className="text-red-500 text-xs mt-1">{errors.display_order}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Lower numbers appear first (1-100)
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2 sm:space-x-3 p-3 sm:p-4 bg-gray-50 rounded-lg border">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="is_active" className="text-xs sm:text-sm font-medium text-gray-700 cursor-pointer">
            Category is active and visible to users
          </label>
        </div>
      </div>

      {/* Action Buttons - Responsive */}
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 text-sm sm:text-base font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center text-sm sm:text-base font-medium"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {category ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {category ? 'Update Category' : 'Create Category'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

// Category Details Modal Component
const CategoryDetailsModal = ({ category, onClose, onEdit }) => {
  return (
    <div className="space-y-6">
      
      {/* Category Header */}
      <div 
        className="p-6 rounded-lg text-white"
        style={{ backgroundColor: category.color || '#3B82F6' }}
      >
        <div className="flex items-center space-x-3">
          {category.icon && (
            <div className="text-4xl">{category.icon}</div>
          )}
          <div className="flex-1">
            <h4 className="text-2xl font-bold mb-1">{category.category_name}</h4>
            {category.description && (
              <p className="text-white/90 text-sm">{category.description}</p>
            )}
          </div>
          <div>
            {category.is_active ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur">
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur">
                <XCircle className="w-3 h-3 mr-1" />
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Display Order</p>
          <p className="text-xl font-bold text-gray-900">{category.display_order}</p>
        </div>
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Services Count</p>
          <p className="text-xl font-bold text-gray-900">
            {category.services_count || 0}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="p-4 bg-gray-50 rounded-lg text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Category ID</p>
            <p className="font-mono font-medium">{category.category_id}</p>
          </div>
          <div>
            <p className="text-gray-600">Created</p>
            <p className="font-medium">
              {new Date(category.created_at).toLocaleDateString()}
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
          Edit Category
        </button>
      </div>
    </div>
  );
};

// Main Categories Page Component
const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    is_active: '',
    search: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllCategories({
        page: filters.page,
        limit: filters.limit,
        is_active: filters.is_active,
        search: debouncedSearch
      });
      
      setCategories(response.data?.categories || response.categories || []);
      setPagination(response.data?.pagination || response.pagination || {
        page: filters.page,
        limit: filters.limit,
        total: (response.data?.categories || response.categories || []).length,
        totalPages: Math.ceil((response.data?.categories || response.categories || []).length / filters.limit)
      });
    } catch (err) {
      console.error('❌ Failed to fetch categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleViewDetails = (category) => {
    setSelectedCategory(category);
    setIsDetailsModalOpen(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setEditMode(false);
    setIsFormModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setEditMode(true);
    setIsDetailsModalOpen(false);
    setIsFormModalOpen(true);
  };

  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editMode && selectedCategory) {
        await apiService.updateCategory(selectedCategory.category_id, formData);
        alert('Category updated successfully!');
      } else {
        await apiService.createCategory(formData);
        alert('Category created successfully!');
      }
      setIsFormModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('❌ Failed to save category:', error);
      alert(error.message || `Failed to ${editMode ? 'update' : 'create'} category`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await apiService.deleteCategory(categoryToDelete.category_id);
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
      alert('Category deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete category:', error);
      alert(`Failed to delete category: ${error.message}`);
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await apiService.updateCategory(category.category_id, {
        is_active: !category.is_active
      });
      fetchCategories();
      alert(`Category ${!category.is_active ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('❌ Failed to toggle category:', error);
      alert('Failed to update category status');
    }
  };

  // Grid View Component
  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map(category => (
        <div
          key={category.category_id}
          className="border rounded-lg overflow-hidden hover:shadow-lg transition group"
        >
          <div 
            className="p-6 text-white relative"
            style={{ backgroundColor: category.color || '#3B82F6' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="text-3xl">{category.icon || '📁'}</div>
              <button
                onClick={() => handleToggleActive(category)}
                className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur ${
                  category.is_active 
                    ? 'bg-white/20 hover:bg-white/30' 
                    : 'bg-black/20 hover:bg-black/30'
                }`}
              >
                {category.is_active ? 'Active' : 'Inactive'}
              </button>
            </div>
            <h3 className="text-lg font-bold">{category.category_name}</h3>
            {category.description && (
              <p className="text-sm text-white/80 mt-1 line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
          <div className="p-4 bg-white">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
              <span>Order: {category.display_order}</span>
              <span>{category.services_count || 0} services</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleViewDetails(category)}
                className="flex-1 px-3 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                View
              </button>
              <button
                onClick={() => handleEditCategory(category)}
                className="flex-1 px-3 py-2 text-sm text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition"
              >
                Edit
              </button>
              <button
                onClick={() => {
                  setCategoryToDelete(category);
                  setIsDeleteModalOpen(true);
                }}
                className="px-3 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // Table columns
  const columns = [
    { 
      header: 'ID', 
      field: 'category_id',
      render: (row) => <span className="font-mono text-xs">{row.category_id}</span>
    },
    {
      header: 'Category',
      render: (row) => (
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xl"
            style={{ backgroundColor: row.color || '#3B82F6' }}
          >
            {row.icon || <Tag className="w-5 h-5" />}
          </div>
          <div>
            <span className="font-medium block">{row.category_name}</span>
            {row.description && (
              <span className="text-xs text-gray-500 line-clamp-1">{row.description}</span>
            )}
          </div>
        </div>
      )
    },
    {
      header: 'Order',
      render: (row) => (
        <span className="text-sm font-medium">{row.display_order}</span>
      )
    },
    {
      header: 'Services',
      render: (row) => (
        <span className="text-sm">{row.services_count || 0}</span>
      )
    },
    {
      header: 'Status',
      render: (row) => (
        <button
          onClick={() => handleToggleActive(row)}
          className={`px-2 py-1 rounded-full text-xs font-medium transition ${
            row.is_active 
              ? 'bg-green-100 text-green-800 hover:bg-green-200' 
              : 'bg-red-100 text-red-800 hover:bg-red-200'
          }`}
        >
          {row.is_active ? 'Active' : 'Inactive'}
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
            onClick={() => handleEditCategory(row)}
            className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition"
            title="Edit Category"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setCategoryToDelete(row);
              setIsDeleteModalOpen(true);
            }}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition"
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const activeCount = categories.filter(c => c.is_active).length;
  const inactiveCount = categories.filter(c => !c.is_active).length;

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage service categories for better organization</p>
        </div>
        <button
          onClick={handleCreateCategory}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Category
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Categories</p>
          <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Inactive</p>
          <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
        </div>
      </div>

      {/* Filters & View Toggle */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search categories..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value, page: 1})}
              />
            </div>

            {/* Status Filter */}
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.is_active}
              onChange={(e) => setFilters({...filters, is_active: e.target.value, page: 1})}
            >
              <option value="">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 flex items-center space-x-2 transition ${
                viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span className="text-sm font-medium">Grid</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 flex items-center space-x-2 transition ${
                viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <List className="w-4 h-4" />
              <span className="text-sm font-medium">Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No categories found</p>
          <button
            onClick={handleCreateCategory}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create First Category
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <GridView />
          ) : (
            <div className="bg-white rounded-lg shadow-sm">
              <Table columns={columns} data={categories} loading={loading} />
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} categories
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
        </>
      )}

      {/* Modals */}
      {selectedCategory && isDetailsModalOpen && (
        <Modal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title="Category Details"
          size="large"
        >
          <CategoryDetailsModal
            category={selectedCategory}
            onClose={() => setIsDetailsModalOpen(false)}
            onEdit={() => handleEditCategory(selectedCategory)}
          />
        </Modal>
      )}

      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editMode ? 'Edit Category' : 'Create New Category'}
        size="large"
      >
        <CategoryForm
          category={editMode ? selectedCategory : null}
          onSubmit={handleSubmitForm}
          onCancel={() => setIsFormModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete category <strong>{categoryToDelete?.category_name}</strong>?
          </p>
          {categoryToDelete?.services_count > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Warning!</p>
                <p>This category has {categoryToDelete.services_count} service(s) associated with it.</p>
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCategory}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete Category
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesPage;