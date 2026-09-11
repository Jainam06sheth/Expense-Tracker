import React from 'react';
import { Menu, Plus, Bell } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { getCurrencyCode } from '../../utils/currencyFormatter';

export const Header = ({ onMenuClick, currentUser, title = 'Dashboard' }) => {
  const navigate = useNavigate();
  const currency = getCurrencyCode();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Currency badge */}
        <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200/60">
          Currency: {currency}
        </span>

        {/* Quick Add Expense button */}
        <Button
          size="sm"
          icon={Plus}
          onClick={() => navigate('/expenses/add')}
          className="hidden sm:inline-flex"
        >
          Add Expense
        </Button>

        {/* Notification Icon */}
        <Link
          to="/activity"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors relative"
          title="Recent Activity"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
        </Link>

        {/* User avatar */}
        {currentUser && (
          <Link
            to="/profile"
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-400/40 transition-all"
            title="View Profile"
          >
            <Avatar
              name={currentUser.name}
              avatar={currentUser.avatar}
              size="sm"
              color={currentUser.avatarColor}
            />
          </Link>
        )}
      </div>
    </header>
  );
};
