import React, { useState, useEffect } from 'react';
import { Users, Store, ShoppingBag, DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import apiService from '../services/api.service';

const DashboardPage = ({ token, setCurrentPage }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await apiService.get('/admin/dashboard/stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        console.error('Dashboard stats error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error loading dashboard: {error}</p>
        </div>
      </div>
    );
  }

  // Process stats
  const totalUsers = stats?.userStats?.reduce((sum, u) => sum + Number(u.count), 0) || 0;
  const customerCount = stats?.userStats?.find(u => u.user_type === 'CUSTOMER')?.count || 0;
  const vendorCount = stats?.userStats?.find(u => u.user_type === 'VENDOR')?.count || 0;
  const totalBookings = stats?.bookingStats?.total_bookings || 0;
  const completedBookings = stats?.bookingStats?.completed_bookings || 0;
  const cancelledBookings = stats?.bookingStats?.cancelled_bookings || 0;
  const revenue = Number(stats?.bookingStats?.total_revenue || 0);
  const pendingVendors = stats?.pendingVendors || 0;

  // Calculate completion rate
  const completionRate = totalBookings > 0 
    ? ((completedBookings / totalBookings) * 100).toFixed(1) 
    : 0;

  return (
    <div className="p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <StatCard
          icon={Users}
          title="Total Users"
          value={totalUsers}
          change={`${customerCount} customers, ${vendorCount} vendors`}
          color="bg-blue-500"
        />

        <StatCard
          icon={Store}
          title="Pending Vendors"
          value={pendingVendors}
          change={pendingVendors > 0 ? 'Requires approval' : 'All approved'}
          color={pendingVendors > 0 ? 'bg-orange-500' : 'bg-green-500'}
        />

        <StatCard
          icon={ShoppingBag}
          title="Total Bookings"
          value={totalBookings}
          change={`${completionRate}% completion rate`}
          color="bg-purple-500"
        />

        <StatCard
          icon={DollarSign}
          title="Total Revenue"
          value={`₹${revenue.toLocaleString('en-IN')}`}
          change={`${completedBookings} completed`}
          color="bg-yellow-500"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Booking Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Booking Statistics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{completedBookings}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full" 
                style={{ width: `${(completedBookings / totalBookings) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-semibold text-red-600">{cancelledBookings}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-500 h-2 rounded-full" 
                style={{ width: `${(cancelledBookings / totalBookings) * 100}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="font-bold text-gray-900">{totalBookings}</span>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Recent Users</h2>
          <div className="space-y-3">
            {stats?.recentUsers?.map((user, idx) => (
              <div key={idx} className="border-b pb-3 last:border-b-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{user.user_type}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
            {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
              <p className="text-gray-500 text-sm">No recent users</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">Quick Actions</h2>
          <div className="space-y-3">
            <button onClick={() => setCurrentPage('customers')} className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-left flex items-center">
              <Users className="w-5 h-5 mr-3" />
              <span>Manage Users</span>
            </button>
            <button onClick={() => setCurrentPage('vendors')} className="w-full px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition text-left flex items-center">
              <Store className="w-5 h-5 mr-3" />
              <span>View Vendors</span>
            </button>
            {pendingVendors > 0 && (
              <button className="w-full px-4 py-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition text-left flex items-center">
                <Clock className="w-5 h-5 mr-3" />
                <span>Review Approvals ({pendingVendors})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;