import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Import useNavigate
import {
  Users, Store, ShoppingBag, DollarSign, Clock,
  TrendingUp, Calendar, CheckCircle, XCircle, AlertCircle,
  ArrowRight, RefreshCw, Star, Package, FileText, Bell, Building2, Scissors
} from 'lucide-react';
import apiService from '../services/api.service';

// ─── Reusable Stat Card ───────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, title, value, sub, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 
      ${onClick ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all' : ''}`}
  >
    <div className={`${color} p-3 rounded-xl flex-shrink-0`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-gray-500 truncate">{title}</p>
      <p className="text-2xl font-bold text-gray-900 leading-tight">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
    </div>
  </div>
);

// ─── Progress Row ─────────────────────────────────────────────────────────────
const ProgressRow = ({ label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-800">{value}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── Quick Action Button ──────────────────────────────────────────────────────
const QuickBtn = ({ icon: Icon, label, badge, accent, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border ${accent} hover:opacity-90 active:scale-[0.98] transition-all`}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm">{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {badge != null && badge > 0 && (
        <span className="text-xs bg-white bg-opacity-60 px-2 py-0.5 rounded-full font-bold">
          {badge}
        </span>
      )}
      <ArrowRight className="w-4 h-4 opacity-60" />
    </div>
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardPage = () => {
  const navigate = useNavigate(); // ✅ Use React Router's navigation hook
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);

      const response = await apiService.get('/admin/dashboard/stats');
      console.log('Dashboard API Response:', response);
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { 
    fetchStats(); 
  }, [fetchStats]);

  // ── Navigation helper - USES REACT ROUTER ────────────────────────────────────
  const navigateTo = useCallback((page) => {
    console.log('Navigating to:', page);
    navigate(`/admin/${page}`); // ✅ React Router navigation
  }, [navigate]);

  // ── Derived values from API response ──────────────────────────────────────
  const userStats = stats?.userStats || [];
  const bookingStats = stats?.bookingStats || {};
  const todayStats = stats?.todayStats || {};
  
  // User counts
  const totalUsers = userStats.reduce((sum, u) => sum + Number(u.count || 0), 0);
  const customerCount = Number(userStats.find(u => u.user_type?.toUpperCase() === 'CUSTOMER')?.count || 0);
  const vendorCount = Number(userStats.find(u => u.user_type?.toUpperCase() === 'VENDOR')?.count || 0);
  
  // Booking counts
  const totalBookings = Number(bookingStats.total_bookings || 0);
  const completedBookings = Number(bookingStats.completed_bookings || 0);
  const cancelledBookings = Number(bookingStats.cancelled_bookings || 0);
  const pendingBookings = Number(bookingStats.pending_bookings || 0);
  const revenue = Number(bookingStats.total_revenue || 0);
  
  // Today's counts
  const todayBookings = Number(todayStats.bookings || 0);
  const todayRevenue = Number(todayStats.revenue || 0);
  const todayCompleted = Number(todayStats.completed || 0);
  const todayCancelled = Number(todayStats.cancelled || 0);
  const todayCustomers = Number(todayStats.new_customers || 0);
  const todayVendors = Number(todayStats.new_vendors || 0);
  
  // Other counts
  const pendingVendors = Number(stats?.pendingVendors || 0);
  const categoriesCount = Number(stats?.categoriesCount || 0);
  const servicesCount = Number(stats?.servicesCount || 0);
  
  // Calculations
  const completionRate = totalBookings > 0
    ? ((completedBookings / totalBookings) * 100).toFixed(1) 
    : '0.0';
  
  const recentUsers = stats?.recentUsers || [];
  const recentBookings = stats?.recentBookings || [];

  // ── Loading State ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700" />
          <p className="mt-4 text-gray-500 text-sm">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-red-700">Failed to load dashboard</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <button
              onClick={() => fetchStats()}
              className="mt-3 text-sm text-red-600 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-6 space-y-6 max-w-7xl mx-auto">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* ── Overall Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Total Users"
          value={totalUsers.toLocaleString('en-IN')}
          sub={`${customerCount} customers · ${vendorCount} vendors`}
          color="bg-blue-500"
          onClick={() => navigateTo('customers')}
        />
        <StatCard
          icon={Store}
          title="Pending Vendors"
          value={pendingVendors}
          sub={pendingVendors > 0 ? 'Requires your approval' : 'All up to date'}
          color={pendingVendors > 0 ? 'bg-orange-500' : 'bg-green-500'}
          onClick={() => navigateTo('vendors')}
        />
        <StatCard
          icon={ShoppingBag}
          title="Total Bookings"
          value={totalBookings.toLocaleString('en-IN')}
          sub={`${completionRate}% completion rate`}
          color="bg-purple-500"
          onClick={() => navigateTo('bookings')}
        />
        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`₹${revenue.toLocaleString('en-IN')}`}
          sub={`${completedBookings} completed bookings`}
          color="bg-amber-600"
          onClick={() => navigateTo('bookings')}
        />
      </div>

      {/* ── Today's Snapshot ─────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-amber-700 to-amber-900 rounded-2xl p-5 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 opacity-80" />
          <h2 className="font-bold text-lg">Today's Snapshot</h2>
          <span className="ml-auto text-xs bg-white bg-opacity-20 px-2 py-0.5 rounded-full">
            {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div 
            className="bg-white bg-opacity-10 rounded-xl p-3 text-center cursor-pointer hover:bg-opacity-20 transition-all"
            onClick={() => navigateTo('bookings')}
          >
            <p className="text-2xl font-extrabold">{todayBookings}</p>
            <p className="text-xs opacity-75 mt-0.5">Bookings</p>
          </div>
          <div 
            className="bg-white bg-opacity-10 rounded-xl p-3 text-center cursor-pointer hover:bg-opacity-20 transition-all"
            onClick={() => navigateTo('bookings')}
          >
            <p className="text-2xl font-extrabold">₹{todayRevenue.toLocaleString('en-IN')}</p>
            <p className="text-xs opacity-75 mt-0.5">Earnings</p>
          </div>
          <div 
            className="bg-white bg-opacity-10 rounded-xl p-3 text-center cursor-pointer hover:bg-opacity-20 transition-all"
            onClick={() => navigateTo('bookings')}
          >
            <p className="text-2xl font-extrabold">{todayCompleted}</p>
            <p className="text-xs opacity-75 mt-0.5">Completed</p>
          </div>
          <div 
            className="bg-white bg-opacity-10 rounded-xl p-3 text-center cursor-pointer hover:bg-opacity-20 transition-all"
            onClick={() => navigateTo('bookings')}
          >
            <p className="text-2xl font-extrabold">{todayCancelled}</p>
            <p className="text-xs opacity-75 mt-0.5">Cancelled</p>
          </div>
          <div 
            className="bg-white bg-opacity-10 rounded-xl p-3 text-center cursor-pointer hover:bg-opacity-20 transition-all"
            onClick={() => navigateTo('customers')}
          >
            <p className="text-2xl font-extrabold">{todayCustomers}</p>
            <p className="text-xs opacity-75 mt-0.5">New Customers</p>
          </div>
          <div 
            className="bg-white bg-opacity-10 rounded-xl p-3 text-center cursor-pointer hover:bg-opacity-20 transition-all"
            onClick={() => navigateTo('vendors')}
          >
            <p className="text-2xl font-extrabold">{todayVendors}</p>
            <p className="text-xs opacity-75 mt-0.5">New Vendors</p>
          </div>
        </div>
      </div>

      {/* ── Secondary Stats Row ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigateTo('categories')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{categoriesCount}</p>
            </div>
            <FileText className="w-8 h-8 text-purple-500" />
          </div>
        </div>
        
        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigateTo('services')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Services</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{servicesCount}</p>
            </div>
            <Scissors className="w-8 h-8 text-pink-500" />
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigateTo('customers')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Customers</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{customerCount}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 cursor-pointer hover:shadow-md transition-all"
          onClick={() => navigateTo('vendors')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Vendors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{vendorCount}</p>
            </div>
            <Store className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* ── Bottom Grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Booking Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Booking Breakdown
          </h2>
          <div className="space-y-4">
            <ProgressRow 
              label="Completed" 
              value={completedBookings} 
              total={totalBookings} 
              color="bg-green-500" 
            />
            <ProgressRow 
              label="Pending" 
              value={pendingBookings} 
              total={totalBookings} 
              color="bg-yellow-400" 
            />
            <ProgressRow 
              label="Cancelled" 
              value={cancelledBookings} 
              total={totalBookings} 
              color="bg-red-400" 
            />
            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium">Total</span>
              <span className="font-bold text-gray-900">{totalBookings.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <button
            onClick={() => navigateTo('bookings')}
            className="w-full mt-4 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-all text-sm font-medium"
          >
            View All Bookings →
          </button>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Users
            </h2>
            <button
              onClick={() => navigateTo('customers')}
              className="text-xs text-amber-700 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {recentUsers.length > 0 ? (
              recentUsers.slice(0, 5).map((user, i) => (
                <div 
                  key={user.user_id || i} 
                  className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 rounded-lg px-2 transition-all"
                  onClick={() => navigateTo('customers')}
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(user.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {user.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{user.user_type}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(user.created_at).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">No recent users</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Quick Actions
          </h2>
          <div className="space-y-2.5">
            <QuickBtn
              icon={Users}
              label="Manage Customers"
              accent="bg-blue-50 text-blue-700 border-blue-100"
              onClick={() => navigateTo('customers')}
            />
            <QuickBtn
              icon={Store}
              label="Manage Vendors"
              badge={pendingVendors}
              accent="bg-purple-50 text-purple-700 border-purple-100"
              onClick={() => navigateTo('vendors')}
            />
            <QuickBtn
              icon={Building2}
              label="Manage Shops"
              accent="bg-cyan-50 text-cyan-700 border-cyan-100"
              onClick={() => navigateTo('shops')}
            />
            <QuickBtn
              icon={ShoppingBag}
              label="View Bookings"
              accent="bg-green-50 text-green-700 border-green-100"
              onClick={() => navigateTo('bookings')}
            />
            <QuickBtn
              icon={Scissors}
              label="Manage Services"
              accent="bg-pink-50 text-pink-700 border-pink-100"
              onClick={() => navigateTo('services')}
            />
            <QuickBtn
              icon={FileText}
              label="Categories"
              accent="bg-indigo-50 text-indigo-700 border-indigo-100"
              onClick={() => navigateTo('categories')}
            />
            <QuickBtn
              icon={Bell}
              label="Notifications"
              accent="bg-orange-50 text-orange-700 border-orange-100"
              onClick={() => navigateTo('notifications')}
            />
          </div>
        </div>
      </div>

      {/* ── Recent Bookings Table ──────────────────────────────────────────*/}
      {recentBookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Recent Bookings
            </h2>
            <button
              onClick={() => navigateTo('bookings')}
              className="text-xs text-amber-700 hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <th className="pb-3 font-medium">ID</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Vendor</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.slice(0, 5).map((booking) => (
                  <tr 
                    key={booking.booking_id} 
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => navigateTo('bookings')}
                  >
                    <td className="py-3 text-sm text-gray-600">#{booking.booking_id}</td>
                    <td className="py-3 text-sm text-gray-800">
                      {booking.customer_name || booking.customer_email}
                    </td>
                    <td className="py-3 text-sm text-gray-800">
                      {booking.shop_name || booking.vendor_name || 'N/A'}
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {new Date(booking.booking_date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-900">
                      ₹{Number(booking.total_amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        booking.booking_status === 'completed' 
                          ? 'bg-green-100 text-green-700'
                          : booking.booking_status === 'cancelled'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.booking_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;