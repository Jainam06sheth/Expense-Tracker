import React, { useState, useMemo } from 'react';
import { groupService } from '../services/groupService';
import { expenseService } from '../services/expenseService';
import { paymentService } from '../services/paymentService';
import { userService } from '../services/userService';
import { calculateGroupBalances } from '../utils/balanceCalculator';
import { GroupCard } from '../components/groups/GroupCard';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Modal } from '../components/common/Modal';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { EmptyState } from '../components/common/EmptyState';
import { Plus, Search, FolderPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';

export const Groups = () => {
  const currentUser = userService.getCurrentUser();
  const [groups, setGroups] = useState(() => groupService.getAll());
  const [expenses, setExpenses] = useState(() => expenseService.getAll());
  const [payments, setPayments] = useState(() => paymentService.getAll());

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [groupToEdit, setGroupToEdit] = useState(null);
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Form State for Create/Edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'Travel',
    description: '',
  });

  const categories = ['All', 'Travel', 'Hostel', 'Food', 'College', 'Bills', 'Other'];

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === 'All' || g.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [groups, searchQuery, selectedCategory]);

  const handleOpenCreate = () => {
    setFormData({ name: '', category: 'Travel', description: '' });
    setCreateModalOpen(true);
  };

  const handleOpenEdit = (group) => {
    setGroupToEdit(group);
    setFormData({
      name: group.name,
      category: group.category || 'Travel',
      description: group.description || '',
    });
    setEditModalOpen(true);
  };

  const handleSaveCreate = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    const created = groupService.create(formData, currentUser);
    setGroups((prev) => [created, ...prev]);
    toast.success(`Group "${created.name}" created successfully`);
    setCreateModalOpen(false);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !groupToEdit) return;

    const updated = groupService.update(groupToEdit.id, formData, currentUser);
    setGroups((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    toast.success('Group updated successfully');
    setEditModalOpen(false);
    setGroupToEdit(null);
  };

  const handleOpenDelete = (group) => {
    setGroupToDelete(group);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!groupToDelete) return;
    const ok = groupService.delete(groupToDelete.id, currentUser);
    if (ok) {
      setGroups((prev) => prev.filter((g) => g.id !== groupToDelete.id));
      setExpenses((prev) => prev.filter((e) => e.groupId !== groupToDelete.id));
      setPayments((prev) => prev.filter((p) => p.groupId !== groupToDelete.id));
      toast.success(`Group "${groupToDelete.name}" deleted`);
    } else {
      toast.error('Unable to delete group');
    }
    setDeleteConfirmOpen(false);
    setGroupToDelete(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Groups
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Organize trips, hostel flatshares, and split bills with friends.
          </p>
        </div>

        <Button variant="primary" icon={Plus} onClick={handleOpenCreate}>
          Create Group
        </Button>
      </div>

      {/* Search & Category Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search groups by name or details..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Group Grid */}
      {filteredGroups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No groups found"
          description={
            searchQuery
              ? 'No groups match your current search query.'
              : 'Create your first group to start organizing expenses.'
          }
          actionLabel="Create a Group"
          onAction={handleOpenCreate}
          actionIcon={Plus}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((group) => {
            const groupExpenses = expenses.filter((e) => e.groupId === group.id);
            const groupPayments = payments.filter((p) => p.groupId === group.id);
            const balances = calculateGroupBalances(
              groupExpenses,
              groupPayments,
              group.members || []
            );

            const totalSpent = groupExpenses.reduce(
              (acc, e) => acc + (Number(e.amount) || 0),
              0
            );
            const userNet = balances.netBalances[currentUser?.id || 'user-bharat'] || 0;

            return (
              <GroupCard
                key={group.id}
                group={group}
                totalSpent={totalSpent}
                userNetBalance={userNet}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            );
          })}
        </div>
      )}

      {/* Modal: Create Group */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Group"
        subtitle="Set up a shared expense pot with friends"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCreate} className="space-y-4">
          <Input
            label="Group Name"
            placeholder="e.g. Goa Trip, Flat 304, Campus Hackathon"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
          />

          <Input
            label="Category"
            placeholder="Travel, Hostel, Food, etc."
            value={formData.category}
            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
            required
          />

          <Input
            label="Description"
            placeholder="Optional purpose notes"
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" icon={FolderPlus}>
              Create Group
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Group */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Group"
        subtitle="Modify group details and title"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <Input
            label="Group Name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
          />

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Group Deletion */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Group?"
        message={`Are you sure you want to delete "${groupToDelete?.name}"? All associated expenses, splits, and settlement logs will be permanently removed.`}
        confirmText="Delete Group"
      />
    </div>
  );
};
