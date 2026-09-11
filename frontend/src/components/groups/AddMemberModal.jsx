import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { UserPlus, Search, Check } from 'lucide-react';

export const AddMemberModal = ({ isOpen, onClose, onAddMember, loading = false, users = [], groupMembers = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Debouncing the search term by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const existingIds = new Set(groupMembers.map((m) => m.id));

  // Filter users based on debounced term
  const suggestions = debouncedTerm.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(debouncedTerm.toLowerCase())
      )
    : [];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    onAddMember(selectedUser, () => {
      setSearchTerm('');
      setSelectedUser(null);
      onClose();
    });
  };

  const handleClose = () => {
    setSearchTerm('');
    setSelectedUser(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Group Member"
      subtitle="Search and invite a registered user to this group."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            label="Search Registered Users"
            placeholder="Type name (e.g. Bharat) or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (selectedUser) setSelectedUser(null);
            }}
            icon={Search}
          />

          {debouncedTerm && !selectedUser && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
              {suggestions.length > 0 ? (
                suggestions.map((u) => {
                  const isExisting = existingIds.has(u.id);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      disabled={isExisting}
                      onClick={() => {
                        if (!isExisting) {
                          setSelectedUser(u);
                          setSearchTerm(u.name);
                        }
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors border-b border-slate-50 last:border-0 ${
                        isExisting ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      {isExisting && (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">
                          In Group
                        </span>
                      )}
                    </button>
                  );
                })
              ) : (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  No matching registered users found.
                </div>
              )}
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-3">
              <Avatar name={selectedUser.name} size="sm" />
              <div>
                <p className="text-sm font-semibold text-emerald-900">{selectedUser.name}</p>
                <p className="text-xs text-emerald-700">{selectedUser.email}</p>
              </div>
            </div>
            <Check className="w-5 h-5 text-emerald-600" />
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!selectedUser} icon={UserPlus}>
            Add Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
