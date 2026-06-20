import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

const AdminDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header replaces the old mobile-only header */}
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <div className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;