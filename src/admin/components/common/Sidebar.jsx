import React from 'react';
import { LayoutDashboard, Users, Store, Building2, Scissors, Tag, Calendar, Bell, LogOut, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // ✅ ADD THIS

const Sidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'vendors', label: 'Vendors', icon: Store },
    { id: 'shops', label: 'Shops', icon: Building2 },
    { id: 'services', label: 'Services', icon: Scissors },
    { id: 'categories', label: 'Categories', icon: Tag },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth(); // ✅ FIX: was missing

  const handleMenuClick = (id) => {
    navigate(`/admin/${id}`);
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ FIX: derive active item from URL instead of prop
  const activePage = location.pathname.split('/')[2] || 'dashboard';

  return (
    <>
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="h-full flex flex-col">

          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-gray-400 mt-1">Booking System</p>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  activePage === item.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;