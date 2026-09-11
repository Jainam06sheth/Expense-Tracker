import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { userService } from '../../services/userService';

export const ProtectedRoute = () => {
  const currentUser = userService.getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
