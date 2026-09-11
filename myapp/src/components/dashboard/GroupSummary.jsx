import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../../utils/currencyFormatter';

export const GroupSummary = ({ groups = [], expenses = [] }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">My Groups</h3>
          <p className="text-xs text-slate-500">Active expense groups</p>
        </div>
        <Link
          to="/groups"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="space-y-3">
        {groups.slice(0, 4).map((group) => {
          const groupTotal = expenses
            .filter((e) => e.groupId === group.id)
            .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

          return (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {group.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {group.name}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {group.members?.length || 0} members
                    </span>
                    <span>•</span>
                    <span>{group.category}</span>
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-3">
                <p className="text-xs text-slate-400 font-medium">Total Spent</p>
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(groupTotal)}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
