import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';

const AdminDashboard = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
<<<<<<< HEAD
    <div className="h-screen overflow-hidden bg-gray-50 flex">
=======
    <div className="flex h-screen bg-gray-100 overflow-hidden">
>>>>>>> 5467c3d (Bugs resolved)
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
<<<<<<< HEAD
      
      <div className="flex-1 flex flex-col h-screen">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
=======

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header replaces the old mobile-only header */}
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />

        <div className="flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </div>
>>>>>>> 5467c3d (Bugs resolved)
      </div>
    </div>
  );
};

export default AdminDashboard;