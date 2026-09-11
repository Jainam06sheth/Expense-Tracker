import React from 'react';
import { Check, Users } from 'lucide-react';
import { Avatar } from '../common/Avatar';
import { formatCurrency } from '../../utils/currencyFormatter';

export const MemberSelector = ({
  items = [],
  members = [],
  splitMethod = 'item-based',
  selectedOverallParticipants = [],
  onToggleOverallParticipant,
  onToggleItemParticipant,
  onSelectAllForItem,
}) => {
  if (splitMethod === 'equal') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Select Participants for Equal Split
            </h4>
            <p className="text-xs text-slate-500">
              The bill will be shared equally among all checked members.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const allIds = members.map((m) => m.id);
              if (selectedOverallParticipants.length === members.length) {
                onToggleOverallParticipant([]);
              } else {
                onToggleOverallParticipant(allIds);
              }
            }}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
          >
            {selectedOverallParticipants.length === members.length
              ? 'Deselect All'
              : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map((member) => {
            const isSelected = selectedOverallParticipants.includes(member.id);
            return (
              <div
                key={member.id}
                onClick={() => {
                  if (isSelected) {
                    onToggleOverallParticipant(
                      selectedOverallParticipants.filter((id) => id !== member.id)
                    );
                  } else {
                    onToggleOverallParticipant([...selectedOverallParticipants, member.id]);
                  }
                }}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-300 shadow-xs ring-1 ring-blue-400/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={member.name} size="sm" />
                  <div>
                    <p className="text-sm font-bold text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-400">{member.email}</p>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Item-Based Assignment
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-bold text-slate-900">
          Assign Members to Each Item
        </h4>
        <p className="text-xs text-slate-500">
          Select who ate or consumed each specific line item below.
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, itemIndex) => {
          const itemParticipants = item.participants || [];

          return (
            <div
              key={item.id || itemIndex}
              className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs"
            >
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div>
                  <h5 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{item.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {formatCurrency(item.amount)}
                    </span>
                  </h5>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {itemParticipants.length} participant
                    {itemParticipants.length !== 1 ? 's' : ''} sharing this item
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectAllForItem(itemIndex, members.map((m) => m.id))}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  {itemParticipants.length === members.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>

              {/* Members chip grid */}
              <div className="flex flex-wrap gap-2">
                {members.map((member) => {
                  const isChecked = itemParticipants.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => onToggleItemParticipant(itemIndex, member.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Avatar
                        name={member.name}
                        size="xs"
                        color={isChecked ? 'bg-blue-800' : undefined}
                      />
                      <span>{member.name}</span>
                      {isChecked && <Check className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
