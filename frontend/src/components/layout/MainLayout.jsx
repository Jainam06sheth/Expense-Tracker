import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { userService } from '../../services/userService';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/groups': 'Groups',
  '/expenses': 'Expenses',
  '/expenses/add': 'Add Expense',
  '/balances': 'Balances',
  '/settlements': 'Settlements',
  '/activity': 'Activity Timeline',
  '/profile': 'My Profile',
  '/settings': 'Settings',
};

export const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const currentUser = userService.getCurrentUser();

  // Determine current title based on route prefix
  let currentTitle = 'CampusSettle';
  const path = location.pathname;
  if (pageTitles[path]) {
    currentTitle = pageTitles[path];
  } else if (path.startsWith('/groups/')) {
    currentTitle = 'Group Details';
  } else if (path.startsWith('/expenses/')) {
    currentTitle = 'Expense Details';
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          currentUser={currentUser}
          title={currentTitle}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
