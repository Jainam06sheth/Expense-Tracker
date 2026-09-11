import React, { useState, useMemo } from 'react';
import { activityService } from '../services/activityService';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { EmptyState } from '../components/common/EmptyState';
import { formatDistanceToNow, format, parseISO } from 'date-fns';
import {
  History,
  Search,
  PlusCircle,
  CheckCircle2,
  Trash2,
  Users,
  Activity as ActivityIcon,
} from 'lucide-react';

export const Activity = () => {
  const [activities] = useState(() => activityService.getAll());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchSearch =
        act.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (act.groupName || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchType =
        selectedType === 'all' ||
        (selectedType === 'expense' && act.type.startsWith('expense_')) ||
        (selectedType === 'payment' && act.type.startsWith('payment_')) ||
        (selectedType === 'group' && act.type.startsWith('group_')) ||
        (selectedType === 'member' && act.type.startsWith('member_'));

      return matchSearch && matchType;
    });
  }, [activities, searchQuery, selectedType]);

  const getIcon = (type) => {
    if (type.startsWith('expense_')) {
      return <PlusCircle className="w-4 h-4 text-blue-600" />;
    }
    if (type.startsWith('payment_')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    }
    if (type.includes('delete')) {
      return <Trash2 className="w-4 h-4 text-rose-600" />;
    }
    if (type.startsWith('group_') || type.startsWith('member_')) {
      return <Users className="w-4 h-4 text-indigo-600" />;
    }
    return <ActivityIcon className="w-4 h-4 text-slate-600" />;
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Activity Timeline
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete audit trail of all expenses, settlements, group updates, and members.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search activities by description or member..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            options={[
              { value: 'all', label: 'All Activities' },
              { value: 'expense', label: 'Expenses' },
              { value: 'payment', label: 'Settlements' },
              { value: 'group', label: 'Groups' },
              { value: 'member', label: 'Members' },
            ]}
          />
        </div>
      </div>

      {/* Timeline list */}
      {filteredActivities.length === 0 ? (
        <EmptyState
          icon={History}
          title="No activities recorded"
          description="Actions performed across CampusSettle will be logged here."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          <div className="relative pl-7 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {filteredActivities.map((act) => {
              let relativeTime = 'Recently';
              let fullDate = '';
              try {
                const parsed = parseISO(act.date);
                relativeTime = formatDistanceToNow(parsed, { addSuffix: true });
                fullDate = format(parsed, 'dd MMM yyyy, hh:mm a');
              } catch {
                relativeTime = 'Recently';
              }

              return (
                <div key={act.id} className="relative group">
                  <div className="absolute -left-7 top-0.5 w-6 h-6 rounded-full bg-white flex items-center justify-center ring-4 ring-white shadow-xs">
                    {getIcon(act.type)}
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100 group-hover:border-blue-100 group-hover:bg-blue-50/20 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <p className="text-sm font-bold text-slate-900 leading-snug">
                        {act.description}
                      </p>
                      <span className="text-[11px] font-semibold text-blue-600 sm:text-right whitespace-nowrap">
                        {relativeTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                      <span>{fullDate}</span>
                      {act.groupName && (
                        <>
                          <span>•</span>
                          <span className="font-medium text-slate-600">
                            {act.groupName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
