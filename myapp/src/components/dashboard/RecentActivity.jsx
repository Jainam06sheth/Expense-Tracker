import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Activity, PlusCircle, CheckCircle2, Trash2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';

export const RecentActivity = ({ activities = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'expense_created':
        return <PlusCircle className="w-4 h-4 text-blue-600" />;
      case 'payment_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'expense_deleted':
      case 'group_deleted':
        return <Trash2 className="w-4 h-4 text-rose-600" />;
      default:
        return <Activity className="w-4 h-4 text-indigo-600" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
          <p className="text-xs text-slate-500">Timeline of updates</p>
        </div>
        <Link
          to="/activity"
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          View all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8 text-xs text-slate-400">
          No activity recorded yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {activities.slice(0, 5).map((act) => {
            let relativeTime = 'Recently';
            try {
              relativeTime = formatDistanceToNow(parseISO(act.date), {
                addSuffix: true,
              });
            } catch {
              relativeTime = 'Recently';
            }

            return (
              <div key={act.id} className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-white flex items-center justify-center ring-4 ring-white">
                  {getIcon(act.type)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {act.description}
                  </p>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {relativeTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
