import React, { useState } from 'react';
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import VendorsPage from './pages/VendorsPage';
import ShopsPage from './pages/ShopsPage';
import ServicesPage from './pages/ServicesPage';
import PendingApprovalsPage from './pages/PendingApprovalsPage';
import NotificationsPage from './pages/NotificationsPage';
import CategoriesPage from './pages/CategoriesPage';
import BookingsPage from './pages/BookingsPage';

export default function AdminDashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'customers':
        return <UsersPage />;
      case 'vendors':
        return <VendorsPage />;
      case 'shops':
        return <ShopsPage />;
      case 'services':
        return <ServicesPage />;
      case 'categories':
        return <CategoriesPage />;  
      case 'approvals':
        return <PendingApprovalsPage />;
      case 'bookings':
        return <BookingsPage />;  
      case 'notifications':
        return <NotificationsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <div className="flex-1 flex flex-col h-screen">
        <Header setIsMobileMenuOpen={setIsMobileMenuOpen} />
        <main className="flex-1 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}