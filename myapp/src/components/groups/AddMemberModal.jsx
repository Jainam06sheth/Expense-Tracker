import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { validateRequired, validateEmail, validateMinLength } from '../../utils/validation';
import { UserPlus, Search, Check, UserCheck, Sparkles } from 'lucide-react';

export const AddMemberModal = ({
  isOpen,
  onClose,
  onAddMember,
  loading = false,
  users = [],
  groupMembers = [],
}) => {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'manual'
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Manual entry state
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Debouncing search term by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const existingIds = new Set(groupMembers.map((m) => m.id));
  const existingEmails = new Set(groupMembers.map((m) => (m.email || '').toLowerCase()));

  // Filter users based on debounced term
  const suggestions = debouncedTerm.trim()
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(debouncedTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(debouncedTerm.toLowerCase())
      )
    : [];

  const handleSelectUser = (u) => {
    setSelectedUser(u);
    setSearchTerm(u.name);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    onAddMember(
      {
        id: selectedUser.id,
        name: selectedUser.name,
        email: selectedUser.email,
        avatar: selectedUser.avatar,
        avatarColor: selectedUser.avatarColor,
      },
      () => {
        handleReset();
        onClose();
      }
    );
  };

  const validateManualField = (field, value) => {
    if (field === 'name') {
      const req = validateRequired(value, 'Name');
      if (req) return req;
      return validateMinLength(value, 2, 'Name');
    }
    if (field === 'email') {
      return validateEmail(value);
    }
    return '';
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateManualField(name, value) }));
    }
  };

  const handleManualBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateManualField(name, value) }));
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const nameErr = validateManualField('name', formData.name);
    const emailErr = validateManualField('email', formData.email);

    if (nameErr || emailErr) {
      setTouched({ name: true, email: true });
      setErrors({ name: nameErr, email: emailErr });
      return;
    }

    onAddMember(formData, () => {
      handleReset();
      onClose();
    });
  };

  const handleReset = () => {
    setSearchTerm('');
    setDebouncedTerm('');
    setSelectedUser(null);
    setFormData({ name: '', email: '' });
    setTouched({});
    setErrors({});
  };

  const handleModalClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title="Add Group Member"
      subtitle="Search registered friends or invite a new member to split bills."
      maxWidth="max-w-md"
    >
      {/* Mode toggle */}
      <div className="flex rounded-xl bg-slate-100 p-1 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'search'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Search Registered Users
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'manual'
              ? 'bg-white text-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Manual Invite
        </button>
      </div>

      {activeTab === 'search' ? (
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="relative">
            <Input
              label="Search Users by Name or Email"
              placeholder="Type name (e.g. Bharat, Jainam) or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (selectedUser) setSelectedUser(null);
              }}
              icon={Search}
              autoFocus
            />

            {debouncedTerm && !selectedUser && (
              <div className="absolute z-20 w-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-slate-100">
                {suggestions.length > 0 ? (
                  suggestions.map((u) => {
                    const isExisting =
                      existingIds.has(u.id) ||
                      existingEmails.has((u.email || '').toLowerCase());
                    return (
                      <button
                        key={u.id}
                        type="button"
                        disabled={isExisting}
                        onClick={() => !isExisting && handleSelectUser(u)}
                        className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                          isExisting
                            ? 'opacity-60 bg-slate-50 cursor-not-allowed'
                            : 'hover:bg-blue-50/60 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            name={u.name}
                            avatar={u.avatar}
                            color={u.avatarColor}
                            size="sm"
                          />
                          <div className="truncate">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {u.name}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{u.email}</p>
                          </div>
                        </div>
                        {isExisting ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-200/80 px-2 py-0.5 rounded-full flex-shrink-0">
                            In Group
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-blue-600 flex-shrink-0">
                            Select
                          </span>
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-4 py-4 text-xs text-slate-500 text-center">
                    No registered user matching "{debouncedTerm}".
                  </div>
                )}
              </div>
            )}
          </div>

          {selectedUser && (
            <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar
                  name={selectedUser.name}
                  avatar={selectedUser.avatar}
                  color={selectedUser.avatarColor}
                  size="md"
                />
                <div className="truncate">
                  <p className="text-sm font-bold text-blue-950 truncate">
                    {selectedUser.name}
                  </p>
                  <p className="text-xs text-blue-700 truncate">{selectedUser.email}</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0">
                <Check className="w-4 h-4" />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={!selectedUser}
              icon={UserPlus}
            >
              Add Selected Member
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Priya Sharma"
            value={formData.name}
            onChange={handleManualChange}
            onBlur={handleManualBlur}
            error={touched.name ? errors.name : ''}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="e.g. priya@campussettle.com"
            value={formData.email}
            onChange={handleManualChange}
            onBlur={handleManualBlur}
            error={touched.email ? errors.email : ''}
            required
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={handleModalClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading} icon={UserPlus}>
              Add Member
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
