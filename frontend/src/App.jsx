import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout
import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Groups } from './pages/Groups';
import { GroupDetails } from './pages/GroupDetails';
import { Expenses } from './pages/Expenses';
import { AddExpense } from './pages/AddExpense';
import { ExpenseDetails } from './pages/ExpenseDetails';
import { Balances } from './pages/Balances';
import { Settlements } from './pages/Settlements';
import { Activity } from './pages/Activity';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';

export function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 600,
            padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
            <Route path="/groups/:id" element={<GroupDetails />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/expenses/add" element={<AddExpense />} />
            <Route path="/expenses/:id" element={<ExpenseDetails />} />
            <Route path="/balances" element={<Balances />} />
            <Route path="/settlements" element={<Settlements />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
