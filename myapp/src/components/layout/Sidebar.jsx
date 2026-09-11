import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Scale,
  HandCoins,
  History,
  User,
  Settings as SettingsIcon,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { userService } from '../../services/userService';
import toast from 'react-hot-toast';

export const Sidebar = ({ isOpen, onClose, currentUser }) => {
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
    { name: 'Groups', to: '/groups', icon: Users },
    { name: 'Expenses', to: '/expenses', icon: Receipt },
    { name: 'Balances', to: '/balances', icon: Scale },
    { name: 'Settlements', to: '/settlements', icon: HandCoins },
    { name: 'Activity', to: '/activity', icon: History },
  ];

  const secondaryNav = [
    { name: 'Profile', to: '/profile', icon: User },
    { name: 'Settings', to: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    userService.logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
      isActive
        ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand & Close Button */}
        <div>
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <NavLink
              to="/dashboard"
              onClick={() => onClose?.()}
              className="flex items-center gap-2.5 text-blue-600 hover:opacity-90"
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900">
                  Campus<span className="text-blue-600">Settle</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-600 -mt-1">
                  Expense Splitter
                </span>
              </div>
            </NavLink>

            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="p-4 space-y-1.5">
            <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Menu
            </div>
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => onClose?.()}
                  className={navItemClass}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 space-y-3">
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Account
            </div>
            {secondaryNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  onClick={() => onClose?.()}
                  className={navItemClass}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <span>Log Out</span>
            </button>
          </div>

          {/* User profile card */}
          {currentUser && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <Avatar
                name={currentUser.name}
                avatar={currentUser.avatar}
                size="sm"
                color={currentUser.avatarColor}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
