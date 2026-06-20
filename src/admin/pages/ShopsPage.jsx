import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Store, Search, Eye, Edit, Trash2, Plus, Save,
  MapPin, Phone, Clock, Users, CheckCircle, XCircle,
  Image as ImageIcon, FileText, AlertCircle, RefreshCw, Settings
} from 'lucide-react';
import Table from '../components/common/Table';
import Modal from '../components/common/Modal';
import ShopDocumentsModal from '../components/shops/ShopDocumentsModal';
import ShopImagesManager from '../components/shops/ShopImagesManager';
import apiService from '../services/api.service';

const VendorServicesModal = ({ shop, onClose }) => {
  const [allServices, setAllServices]       = useState([]);
  const [vendorServices, setVendorServices] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [search, setSearch]                 = useState('');
  const [priceMap, setPriceMap]             = useState({}); // serviceId → price

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [masterRes, vendorRes] = await Promise.all([
        apiService.get('/admin/services', { limit: 500, page: 1 }),
        apiService.get(`/admin/vendors/${shop.user_id}/services`),
      ]);
      const master  = masterRes.data?.services  || [];
      const current = vendorRes.data?.services  || [];
      setAllServices(master);
      setVendorServices(current);
      // pre-fill price map from existing vendor services
      const pm = {};
      current.forEach(s => { pm[s.service_id] = s.price; });
      setPriceMap(pm);
    } catch (e) {
      alert('Failed to load services: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, [shop.user_id]);

  useEffect(() => { loadData(); }, [loadData]);

  const vendorServiceIds = new Set(vendorServices.map(s => s.service_id));

  const handleAdd = async (service) => {
    const price = parseFloat(priceMap[service.service_id] || service.base_price || 0);
    if (!price || price <= 0) {
      alert('Please enter a valid price before adding.');
      return;
    }
    setSaving(true);
    try {
      await apiService.post(`/admin/vendors/${shop.user_id}/services/add`, {
        service_id: service.service_id,
        price,
        is_available: true,
      });
      await loadData();
    } catch (e) {
      alert('Failed to add service: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (vendorServiceId) => {
    if (!window.confirm('Remove this service from the shop?')) return;
    setSaving(true);
    try {
      await apiService.delete(`/admin/vendors/${shop.user_id}/services/${vendorServiceId}`);
      await loadData();
    } catch (e) {
      alert('Failed to remove service: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  const filtered = allServices.filter(s =>
    !search || s.service_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.category || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-green-700">{vendorServices.length}</span> services active for <span className="font-semibold">{shop.shop_name}</span>
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text" placeholder="Search services..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto space-y-2">
          {filtered.map(service => {
            const isAdded = vendorServiceIds.has(service.service_id);
            const vendorSvc = vendorServices.find(v => v.service_id === service.service_id);
            return (
              <div key={service.service_id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isAdded ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                }`}>
                <div className="flex-1 min-w-0 mr-3">
                  <p className="font-medium text-sm truncate">{service.service_name}</p>
                  <p className="text-xs text-gray-500">{service.category} · {service.duration_minutes}min · Base ₹{service.base_price}</p>
                </div>

                {!isAdded ? (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      placeholder="Price ₹"
                      min="1"
                      value={priceMap[service.service_id] || ''}
                      onChange={e => setPriceMap(prev => ({ ...prev, [service.service_id]: e.target.value }))}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleAdd(service)}
                      disabled={saving}
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-sm font-semibold text-green-700">₹{vendorSvc?.price}</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                    <button
                      onClick={() => handleRemove(vendorSvc?.vendor_service_id)}
                      disabled={saving}
                      className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded-lg hover:bg-red-200 transition disabled:opacity-50 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8">No services found.</p>
          )}
        </div>
      )}

      <div className="flex justify-end pt-3 border-t">
        <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
          Close
        </button>
      </div>
    </div>
  );
};

// ─── ShopForm ────────────────────────────────────────────────────────────────
const ShopForm = ({ shop, onSubmit, onCancel, isSubmitting }) => {
  // ── FIX 1: trim time strings to HH:MM for <input type="time"> ──
  const trimTime = (t) => {
    if (!t) return '';
    return String(t).substring(0, 5); // "09:00:00" → "09:00"
  };

  // ── FIX 2: use shop as initializer key so form re-initializes when shop changes ──
  const [formData, setFormData] = useState(() => ({
    user_id:            shop?.user_id            ?? '',
    shop_name:          shop?.shop_name          ?? '',
    shop_address:       shop?.shop_address       ?? '',
    city:               shop?.city               ?? '',
    state:              shop?.state              ?? '',
    latitude:           shop?.latitude           ?? '',
    longitude:          shop?.longitude          ?? '',
    open_time:          trimTime(shop?.open_time ?? shop?.opening_time ?? shop?.open_at) || '09:00',
    close_time:         trimTime(shop?.close_time ?? shop?.closing_time ?? shop?.close_at) || '20:00',
    break_start_time:   trimTime(shop?.break_start_time)   ?? '',
    break_end_time:     trimTime(shop?.break_end_time)     ?? '',
    weekly_holiday:     shop?.weekly_holiday     ?? '',
    no_of_seats:        shop?.no_of_seats ?? shop?.seat_count ?? shop?.seats ?? shop?.num_seats ?? 1,
    no_of_workers:      shop?.no_of_workers ?? shop?.num_workers ?? shop?.workers ?? 1,
    business_license:   shop?.business_license   ?? '',
    tax_number:         shop?.tax_number         ?? '',
    bank_account_number: shop?.bank_account_number ?? '',
    bank_ifsc_code:     shop?.bank_ifsc_code     ?? '',
  }));

  // ── FIX 3: re-sync when shop prop changes (e.g. modal reopened with new shop) ──
  useEffect(() => {
    if (shop) {
      setFormData({
        user_id:             shop.user_id            ?? '',
        shop_name:           shop.shop_name          ?? '',
        shop_address:        shop.shop_address       ?? '',
        city:                shop.city               ?? '',
        state:               shop.state              ?? '',
        latitude:            shop.latitude           ?? '',
        longitude:           shop.longitude          ?? '',
        open_time:           trimTime(shop.open_time ?? shop.opening_time ?? shop.open_at) || '09:00',
        close_time:          trimTime(shop.close_time ?? shop.closing_time ?? shop.close_at) || '20:00',
        break_start_time:    trimTime(shop.break_start_time)   ?? '',
        break_end_time:      trimTime(shop.break_end_time)     ?? '',
        weekly_holiday:      shop.weekly_holiday     ?? '',
        no_of_seats:         shop.no_of_seats ?? shop.seat_count ?? shop.seats ?? shop.num_seats ?? 1,
        no_of_workers:       shop.no_of_workers ?? shop.num_workers ?? shop.workers ?? 1,
        business_license:    shop.business_license   ?? '',
        tax_number:          shop.tax_number         ?? '',
        bank_account_number: shop.bank_account_number ?? '',
        bank_ifsc_code:      shop.bank_ifsc_code     ?? '',
      });
    }
  }, [shop]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!shop && !formData.user_id) newErrors.user_id = 'Vendor is required';
    if (!formData.shop_name.trim()) newErrors.shop_name = 'Shop name is required';
    if (!formData.shop_address.trim()) newErrors.shop_address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.open_time) newErrors.open_time = 'Opening time is required';
    if (!formData.close_time) newErrors.close_time = 'Closing time is required';
    if (formData.open_time && formData.close_time && formData.open_time >= formData.close_time)
      newErrors.close_time = 'Closing time must be after opening time';
    if (formData.break_start_time && formData.break_end_time &&
      formData.break_start_time >= formData.break_end_time)
      newErrors.break_end_time = 'Break end time must be after break start time';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const weekDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  const field = (label, name, type = 'text', required = false, placeholder = '', extra = {}) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors[name] ? 'border-red-500' : 'border-gray-300'
        }`}
        {...extra}
      />
      {errors[name] && <p className="text-red-500 text-xs mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Basic Information</h4>
        {!shop && field('Vendor ID', 'user_id', 'number', true, 'Enter vendor user ID')}
        {field('Shop Name', 'shop_name', 'text', true, 'Enter shop name')}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Shop Address <span className="text-red-500">*</span>
          </label>
          <textarea
            name="shop_address"
            value={formData.shop_address}
            onChange={handleChange}
            rows="3"
            placeholder="Enter complete shop address"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.shop_address ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.shop_address && <p className="text-red-500 text-xs mt-1">{errors.shop_address}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('City', 'city', 'text', true, 'Enter city')}
          {field('State', 'state', 'text', true, 'Enter state')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Latitude (Optional)', 'latitude', 'text', false, 'e.g. 18.5204')}
          {field('Longitude (Optional)', 'longitude', 'text', false, 'e.g. 73.8567')}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Operating Hours</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Opening Time', 'open_time', 'time', true)}
          {field('Closing Time', 'close_time', 'time', true)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Break Start Time (Optional)', 'break_start_time', 'time')}
          {field('Break End Time (Optional)', 'break_end_time', 'time')}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Holiday (Optional)</label>
          <select
            name="weekly_holiday"
            value={formData.weekly_holiday}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No weekly holiday</option>
            {weekDays.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Capacity</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Number of Seats', 'no_of_seats', 'number', false, '', { min: 1 })}
          {field('Number of Workers', 'no_of_workers', 'number', false, '', { min: 1 })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900 border-b pb-2">Business Details (Optional)</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Business License Number', 'business_license', 'text', false, 'Enter license number')}
          {field('Tax Number (GST/PAN)', 'tax_number', 'text', false, 'Enter tax number')}
          {field('Bank Account Number', 'bank_account_number', 'text', false, 'Enter account number')}
          {field('Bank IFSC Code', 'bank_ifsc_code', 'text', false, 'Enter IFSC code')}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button type="button" onClick={onCancel} disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center">
          {isSubmitting
            ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />{shop ? 'Updating...' : 'Creating...'}</>
            : <><Save className="w-4 h-4 mr-2" />{shop ? 'Update Shop' : 'Create Shop'}</>}
        </button>
      </div>
    </form>
  );
};

// ─── ShopDetailsModal ─────────────────────────────────────────────────────────
const ShopDetailsModal = ({ shop, onClose, onEdit }) => {
  const verificationBadge = (status) => {
    const cfg = {
      approved: { color: 'bg-green-100 text-green-800', label: 'Approved', icon: CheckCircle },
      rejected:  { color: 'bg-red-100 text-red-800',   label: 'Rejected',  icon: XCircle },
      pending:   { color: 'bg-yellow-100 text-yellow-800', label: 'Pending', icon: Clock }
    };
    const { color, label, icon: Icon } = cfg[status] || cfg.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${color}`}>
        <Icon className="w-3 h-3 mr-1" />{label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white flex-shrink-0">
            <Store className="w-8 h-8" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xl font-bold text-gray-900 mb-2">{shop.shop_name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                {shop.city}, {shop.state}
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0" />
                {shop.phone_number || 'Not available'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border rounded-lg">
        <h5 className="font-semibold mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-2 text-gray-600" />Shop Address
        </h5>
        <p className="text-sm text-gray-700">{shop.shop_address || '—'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 p-4 bg-white border rounded-lg">
        <div>
          <p className="text-sm text-gray-600 mb-1">Verification Status</p>
          {verificationBadge(shop.verification_status)}
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">Owner</p>
          <p className="text-sm font-medium">{shop.owner_name || '—'}</p>
        </div>
      </div>

      <div className="p-4 bg-white border rounded-lg">
        <h5 className="font-semibold mb-3 flex items-center">
          <Clock className="w-4 h-4 mr-2 text-gray-600" />Operating Hours
        </h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-600">Opening</p><p className="font-medium">{shop.open_time}</p></div>
          <div><p className="text-gray-600">Closing</p><p className="font-medium">{shop.close_time}</p></div>
          {shop.break_start_time && <div><p className="text-gray-600">Break Start</p><p className="font-medium">{shop.break_start_time}</p></div>}
          {shop.break_end_time && <div><p className="text-gray-600">Break End</p><p className="font-medium">{shop.break_end_time}</p></div>}
          {shop.weekly_holiday && <div className="col-span-2"><p className="text-gray-600">Weekly Holiday</p><p className="font-medium">{shop.weekly_holiday}</p></div>}
        </div>
      </div>

      <div className="p-4 bg-white border rounded-lg">
        <h5 className="font-semibold mb-3 flex items-center">
          <Users className="w-4 h-4 mr-2 text-gray-600" />Capacity
        </h5>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-600">Seats</p><p className="font-medium">{shop.no_of_seats}</p></div>
          <div><p className="text-gray-600">Workers</p><p className="font-medium">{shop.no_of_workers}</p></div>
        </div>
      </div>

      {(shop.business_license || shop.tax_number || shop.bank_account_number) && (
        <div className="p-4 bg-white border rounded-lg">
          <h5 className="font-semibold mb-3">Business Details</h5>
          <div className="space-y-2 text-sm">
            {shop.business_license && <div><p className="text-gray-600">Business License</p><p className="font-medium">{shop.business_license}</p></div>}
            {shop.tax_number && <div><p className="text-gray-600">Tax Number</p><p className="font-medium">{shop.tax_number}</p></div>}
            {shop.bank_account_number && <div><p className="text-gray-600">Bank Account</p><p className="font-medium">{shop.bank_account_number}</p></div>}
            {shop.bank_ifsc_code && <div><p className="text-gray-600">IFSC Code</p><p className="font-medium">{shop.bank_ifsc_code}</p></div>}
          </div>
        </div>
      )}

      <div className="p-4 bg-gray-50 rounded-lg text-sm flex items-center justify-between">
        <div><p className="text-gray-600">Created</p><p className="font-medium">{shop.created_at ? new Date(shop.created_at).toLocaleDateString('en-IN') : '—'}</p></div>
        {shop.verified_at && <div><p className="text-gray-600">Verified</p><p className="font-medium">{new Date(shop.verified_at).toLocaleDateString('en-IN')}</p></div>}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button onClick={onClose} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">Close</button>
        <button onClick={onEdit} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center">
          <Edit className="w-4 h-4 mr-2" />Edit Shop
        </button>
      </div>
    </div>
  );
};

// ─── ShopsPage ────────────────────────────────────────────────────────────────
const ShopsPage = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [allShops, setAllShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedShop, setSelectedShop] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [shopToDelete, setShopToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isImagesModalOpen, setIsImagesModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // ── Client-side filtered list ───────────────────────────────────────────────
  const shops = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allShops.filter(s => {
      const matchesSearch = !q ||
        (s.shop_name || '').toLowerCase().includes(q) ||
        (s.owner_name || '').toLowerCase().includes(q);
      const matchesStatus = !statusFilter || s.verification_status === statusFilter;
      const matchesCity = !cityFilter ||
        (s.city || '').toLowerCase().includes(cityFilter.toLowerCase());
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [allShops, search, statusFilter, cityFilter]);

  // ── Fetch all shops once ────────────────────────────────────────────────────
  const fetchShops = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllVendors({ limit: 500, page: 1 });
      const vendorData = response.data?.vendors || response.vendors || [];
   const shopsData = vendorData.map(v => ({
  shop_id:             v.shop_id,
  user_id:             v.user_id,
  shop_name:           v.shop_name           ?? 'Not Set',
  shop_address:        v.shop_address         ?? '',
  city:                v.shop_city            ?? v.user_city ?? '',
  state:               v.shop_state           ?? v.user_state ?? '',
  open_time:           v.open_time            ?? '',
  close_time:          v.close_time           ?? '',
  break_start_time:    v.break_start_time     ?? '',
  break_end_time:      v.break_end_time       ?? '',
  weekly_holiday:      v.weekly_holiday       ?? '',
  no_of_seats:         v.no_of_seats          ?? 1,
  no_of_workers:       v.no_of_workers        ?? 1,
  business_license:    v.business_license     ?? '',
  tax_number:          v.tax_number           ?? '',
  bank_account_number: v.bank_account_number  ?? '',
  bank_ifsc_code:      v.bank_ifsc_code       ?? '',
  verification_status: v.verification_status  ?? 'pending',
  owner_name:          v.name                 ?? 'Unknown',
  phone_number:        v.phone_number         ?? '',
  email:               v.email                ?? '',
  created_at:          v.created_at,
  verified_at:         v.verified_at,
  user_status:         v.user_status          ?? 'active',
  latitude:            v.latitude             ?? '',
  longitude:           v.longitude            ?? '',
}));
      setAllShops(shopsData);
    } catch (err) {
      console.error('❌ Failed to fetch shops:', err);
      setAllShops([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchShops(); }, [fetchShops]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleViewDetails = async (shop) => {
    try {
      const response = await apiService.getVendorById(shop.user_id);
      const vendorData = response.data || response;
      setSelectedShop({ ...shop, documents: vendorData.documents || [], services: vendorData.services || [] });
      setIsDetailsModalOpen(true);
    } catch (err) {
      alert('Failed to load shop details. Please try again.');
    }
  };

  const handleCreateShop = () => { setSelectedShop(null); setEditMode(false); setIsFormModalOpen(true); };

const handleEditShop = (shop) => {
  setSelectedShop(shop);
  setEditMode(true);
  setIsDetailsModalOpen(false);
  setIsFormModalOpen(true);
};

  const handleSubmitForm = async (formData) => {
    setIsSubmitting(true);
    try {
      const sanitized = {
        ...formData,
        latitude: formData.latitude?.trim() || null,
        longitude: formData.longitude?.trim() || null,
        break_start_time: formData.break_start_time?.trim() || null,
        break_end_time: formData.break_end_time?.trim() || null,
        weekly_holiday: formData.weekly_holiday?.trim() || null,
        business_license: formData.business_license?.trim() || null,
        tax_number: formData.tax_number?.trim() || null,
        bank_account_number: formData.bank_account_number?.trim() || null,
        bank_ifsc_code: formData.bank_ifsc_code?.trim() || null,
        no_of_seats: parseInt(formData.no_of_seats) || 1,
        no_of_workers: parseInt(formData.no_of_workers) || 1
      };
      const vendorId = editMode ? selectedShop.user_id : sanitized.user_id;
      if (!vendorId) throw new Error('Vendor ID is required');
      await apiService.updateVendorShopDetails(vendorId, sanitized);
      setIsFormModalOpen(false);
      setSelectedShop(null);
      fetchShops();
      alert(`Shop ${editMode ? 'updated' : 'created'} successfully!`);
    } catch (error) {
      alert(error.message || `Failed to ${editMode ? 'update' : 'create'} shop`);
    } finally {
      setIsSubmitting(false);
    }
  };

 const handleDeleteShop = async () => {
  if (!shopToDelete) return;
  try {
    // ✅ Deactivate user account status, NOT verification_status
    await apiService.put(`/admin/users/${shopToDelete.user_id}/status`, {
      status: 'inactive'
    });
    setIsDeleteModalOpen(false);
    setShopToDelete(null);
    fetchShops();
    alert('Shop has been deactivated successfully');
  } catch (error) {
    alert(`Failed to deactivate shop: ${error.message}`);
  }
};

  const handleViewDocuments = async (shop) => {
    try {
      const response = await apiService.getVendorById(shop.user_id);
      const vendorData = response.data || response;
      setSelectedShop({ ...shop, documents: vendorData.documents || [] });
      setIsDocumentsModalOpen(true);
    } catch (error) {
      alert('Failed to load documents. Please try again.');
    }
  };

  const handleApproveShop = async (approvalData) => {
    setIsSubmitting(true);
    try {
      await apiService.updateVendorVerification(selectedShop.user_id, {
        verification_status: 'approved',
        admin_comments: approvalData.admin_comments
      });
      setIsDocumentsModalOpen(false);
      fetchShops();
      alert('Shop approved successfully!');
    } catch (error) {
      alert(`Failed to approve shop: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectShop = async (rejectionData) => {
    setIsSubmitting(true);
    try {
      await apiService.updateVendorVerification(selectedShop.user_id, {
        verification_status: 'rejected',
        admin_comments: rejectionData.admin_comments
      });
      setIsDocumentsModalOpen(false);
      fetchShops();
      alert('Shop rejected.');
    } catch (error) {
      alert(`Failed to reject shop: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isServicesModalOpen, setIsServicesModalOpen] = useState(false);

  const handleManageServices = (shop) => {
    setSelectedShop(shop);
    setIsServicesModalOpen(true);
  };

  const handleManageImages = async (shop) => {
    try {
      const response = await apiService.getVendorById(shop.user_id);
      const vendorData = response.data || response;
      const allDocs = vendorData.documents || [];
      setSelectedShop({
        ...shop,
        profile_image: allDocs.find(d => d.document_type === 'shop_profile_image' && d.status !== 'inactive') || null,
        gallery_images: allDocs.filter(d => d.document_type === 'shop_gallery_image' && d.status !== 'inactive')
      });
      setIsImagesModalOpen(true);
    } catch (error) {
      alert('Failed to load images. Please try again.');
    }
  };

  const handleUploadProfileImage = async (file) => {
    if (!selectedShop) return;
    setIsUploading(true);
    try {
      await apiService.uploadShopProfileImage(selectedShop.user_id, file);
      alert('Profile image uploaded successfully!');
    } catch (error) {
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadGalleryImages = async (files) => {
    if (!selectedShop) return;
    setIsUploading(true);
    try {
      await apiService.uploadShopGalleryImages(selectedShop.user_id, files);
      alert(`${files.length} image(s) uploaded successfully!`);
    } catch (error) {
      alert(`Failed to upload images: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async (imageId, imageType) => {
    if (!selectedShop || !window.confirm(`Delete this ${imageType} image?`)) return;
    setIsUploading(true);
    try {
      await apiService.deleteShopImage(selectedShop.user_id, imageId, imageType);
      alert('Image deleted successfully!');
    } catch (error) {
      alert(`Failed to delete image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimaryImage = async (imageId) => {
    if (!selectedShop) return;
    setIsUploading(true);
    try {
      await apiService.setShopPrimaryImage(selectedShop.user_id, imageId);
      alert('Primary image updated successfully!');
    } catch (error) {
      alert(`Failed to set primary image: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // ── Derived counts ──────────────────────────────────────────────────────────
  const pendingCount  = allShops.filter(s => s.verification_status === 'pending').length;
  const approvedCount = allShops.filter(s => s.verification_status === 'approved').length;

  // ── Table columns ───────────────────────────────────────────────────────────
const columns = [
  { header: 'ID', render: (row) => <span className="font-mono text-xs">{row.shop_id}</span> },
  {
    header: 'Shop Name',
    render: (row) => (
      <div className="flex items-center space-x-2">
        <Store className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <span className="font-medium">{row.shop_name}</span>
      </div>
    )
  },
  { header: 'Owner', render: (row) => <span className="text-sm">{row.owner_name}</span> },
  { header: 'Location', render: (row) => <span className="text-sm">{row.city || 'N/A'}</span> },
  { header: 'Hours', render: (row) => <span className="text-sm">{row.open_time} – {row.close_time}</span> },
  {
    // ✅ NEW: User account status
    header: 'User Status',
    render: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        (row.user_status || 'active') === 'active'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-600'
      }`}>
        {row.user_status || 'active'}
      </span>
    )
  },
  {
    header: 'Verification',
    render: (row) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        row.verification_status === 'approved' ? 'bg-green-100 text-green-800' :
        row.verification_status === 'rejected'  ? 'bg-red-100 text-red-800' :
        'bg-yellow-100 text-yellow-800'
      }`}>
        {row.verification_status || 'pending'}
      </span>
    )
  },
  {
    header: 'Actions',
    render: (row) => (
      <div className="flex space-x-1">
        <button onClick={() => handleViewDetails(row)}   className="p-1.5 text-blue-600   hover:bg-blue-100   rounded-lg transition" title="View Details"><Eye      className="w-4 h-4" /></button>
        <button onClick={() => handleViewDocuments(row)} className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition" title="View Documents"><FileText className="w-4 h-4" /></button>
        {/* ✅ Image button REMOVED (Fix 4) */}
        <button onClick={() => handleEditShop(row)}      className="p-1.5 text-green-600  hover:bg-green-100  rounded-lg transition" title="Edit Shop"><Edit      className="w-4 h-4" /></button>
        <button onClick={() => handleManageServices(row)}
          className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-lg transition" title="Manage Services">
          <Settings className="w-4 h-4" />
        </button>
        <button onClick={() => { setShopToDelete(row); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition" title="Deactivate Shop"><Trash2 className="w-4 h-4" /></button>
      </div>
    )
  }
];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shop Management</h1>
          <p className="text-gray-600 mt-1">Manage shop details and verification</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchShops} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm">
            <RefreshCw className="w-4 h-4" />Refresh
          </button>
          <button onClick={handleCreateShop} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center shadow-lg">
            <Plus className="w-5 h-5 mr-2" />Add New Shop
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Total Shops</p>
          <p className="text-2xl font-bold text-gray-900">{allShops.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
          <p className="text-sm text-gray-600">Pending Verification</p>
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
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text" placeholder="Search by shop name or owner..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Verifications</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <input
            type="text" placeholder="Filter by city..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={cityFilter} onChange={(e) => setCityFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Table — uses client-side filtered `shops` */}
      <div className="bg-white rounded-lg shadow-sm">
        <Table columns={columns} data={shops} loading={loading} />
        {shops.length === 0 && !loading && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No shops match your filters.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedShop && isServicesModalOpen && (
        <Modal isOpen={isServicesModalOpen} onClose={() => setIsServicesModalOpen(false)}
          title={`Manage Services: ${selectedShop.shop_name}`} size="large">
          <VendorServicesModal shop={selectedShop} onClose={() => setIsServicesModalOpen(false)} />
        </Modal>
      )}

      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)}
        title={editMode ? 'Edit Shop' : 'Create New Shop'} size="large">
        <ShopForm shop={editMode ? selectedShop : null} onSubmit={handleSubmitForm}
          onCancel={() => setIsFormModalOpen(false)} isSubmitting={isSubmitting} />
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deactivation">
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to deactivate shop <strong>{shopToDelete?.shop_name}</strong>?
            The shop owner's account status will be set to <strong>inactive</strong>.
          </p>
          <div className="flex justify-end space-x-3">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition">Cancel</button>
            <button onClick={handleDeleteShop} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Deactivate Shop</button>
          </div>
        </div>
      </Modal>

      <ShopDocumentsModal
        isOpen={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
        shop={selectedShop}
        onApprove={handleApproveShop}
        onReject={handleRejectShop}
        isSubmitting={isSubmitting}
      />

      <Modal isOpen={isImagesModalOpen} onClose={() => setIsImagesModalOpen(false)}
        title={`Manage Images: ${selectedShop?.shop_name || 'Shop'}`} size="large">
        <ShopImagesManager
          shop={selectedShop}
          profileImage={selectedShop?.profile_image}
          galleryImages={selectedShop?.gallery_images || []}
          onUploadProfile={handleUploadProfileImage}
          onUploadGallery={handleUploadGalleryImages}
          onDeleteImage={handleDeleteImage}
          onSetPrimary={handleSetPrimaryImage}
          isUploading={isUploading}
        />
      </Modal>
    </div>
  );
};

export default ShopsPage;