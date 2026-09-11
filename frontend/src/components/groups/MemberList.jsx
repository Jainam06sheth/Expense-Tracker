import React from 'react';
import { Avatar } from '../common/Avatar';
import { StatusBadge } from '../common/StatusBadge';
import { UserMinus, Shield } from 'lucide-react';

export const MemberList = ({
  members = [],
  currentUserId,
  onRemoveMember,
  isGroupAdmin = false,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Members</h3>
          <p className="text-xs text-slate-500">
            {members.length} participants in this group
          </p>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {members.map((member) => {
          const isCurrentUser = member.id === currentUserId;
          const isAdmin = member.role === 'admin';

          return (
            <div
              key={member.id}
              className="flex items-center justify-between py-3 px-1 hover:bg-slate-50/60 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={member.name} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">
                      {member.name}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate">{member.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <StatusBadge status={isAdmin ? 'admin' : 'member'} size="sm" />
                {isGroupAdmin && !isCurrentUser && onRemoveMember && (
                  <button
                    type="button"
                    onClick={() => onRemoveMember(member)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
