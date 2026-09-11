import React, { useState, useEffect, useMemo } from 'react';
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
  const [currentUser, setCurrentUser] = useState(
    userService.getCurrentUser()
  );

  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const categories = [
    'All',
    'Travel',
    'Hostel',
    'Food',
    'College',
    'Bills',
    'Other',
  ];

  /*
   * Load groups and related data from backend
   */
  useEffect(() => {
    const loadGroupsData = async () => {
      try {
        setLoading(true);

        const profileResult =
          await userService.loadProfile();

        if (
          profileResult.success &&
          profileResult.user
        ) {
          setCurrentUser(profileResult.user);
        }

        const groupsData =
          await groupService.getAll();

        setGroups(groupsData || []);

        /*
         * Expenses and payments are loaded group-wise
         * because the backend does not have:
         *
         * GET /api/expenses
         * GET /api/payments
         *
         * It provides group-specific endpoints instead.
         */
        const allExpenses = [];
        const allPayments = [];

        for (const group of groupsData || []) {
          const groupId =
            group.id || group._id;

          const [
            groupExpenses,
            groupPayments,
          ] = await Promise.all([
            expenseService.getByGroup(groupId),
            paymentService.getByGroup(groupId),
          ]);

          allExpenses.push(
            ...(groupExpenses || [])
          );

          allPayments.push(
            ...(groupPayments || [])
          );
        }

        setExpenses(allExpenses);
        setPayments(allPayments);
      } catch (error) {
        console.error(
          'Error loading groups:',
          error
        );

        toast.error(
          error.message ||
            'Unable to load groups'
        );
      } finally {
        setLoading(false);
      }
    };

    loadGroupsData();
  }, []);

  const filteredGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchSearch =
        g.name
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          ) ||
        (g.description || '')
          .toLowerCase()
          .includes(
            searchQuery.toLowerCase()
          );

      const matchCat =
        selectedCategory === 'All' ||
        g.category === selectedCategory;

      return matchSearch && matchCat;
    });
  }, [
    groups,
    searchQuery,
    selectedCategory,
  ]);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      category: 'Travel',
      description: '',
    });

    setCreateModalOpen(true);
  };

  const handleOpenEdit = (group) => {
    setGroupToEdit(group);

    setFormData({
      name: group.name,
      category:
        group.category || 'Travel',
      description:
        group.description || '',
    });

    setEditModalOpen(true);
  };

  /*
   * CREATE GROUP
   */
  const handleSaveCreate = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error(
        'Group name is required'
      );

      return;
    }

    try {
      const created =
        await groupService.create(
          {
            name: formData.name.trim(),
            category:
              formData.category,
            description:
              formData.description.trim(),
          },
          currentUser
        );

      if (!created) {
        toast.error(
          'Unable to create group'
        );

        return;
      }

      setGroups((prev) => [
        created,
        ...prev,
      ]);

      toast.success(
        `Group "${created.name}" created successfully`
      );

      setCreateModalOpen(false);
    } catch (error) {
      console.error(
        'Error creating group:',
        error
      );

      toast.error(
        error.message ||
          'Unable to create group'
      );
    }
  };

  /*
   * UPDATE GROUP
   */
  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !groupToEdit
    ) {
      return;
    }

    try {
      const groupId =
        groupToEdit.id ||
        groupToEdit._id;

      const updated =
        await groupService.update(
          groupId,
          {
            name: formData.name.trim(),
            category:
              formData.category,
            description:
              formData.description.trim(),
          },
          currentUser
        );

      if (!updated) {
        toast.error(
          'Unable to update group'
        );

        return;
      }

      const updatedId =
        updated.id || updated._id;

      setGroups((prev) =>
        prev.map((g) => {
          const id = g.id || g._id;

          return String(id) ===
            String(updatedId)
            ? updated
            : g;
        })
      );

      toast.success(
        'Group updated successfully'
      );

      setEditModalOpen(false);
      setGroupToEdit(null);
    } catch (error) {
      console.error(
        'Error updating group:',
        error
      );

      toast.error(
        error.message ||
          'Unable to update group'
      );
    }
  };

  const handleOpenDelete = (group) => {
    setGroupToDelete(group);
    setDeleteConfirmOpen(true);
  };

  /*
   * DELETE GROUP
   *
   * The current backend does NOT have a delete-group
   * endpoint.
   *
   * Therefore we don't perform a local-only delete.
   */
  const handleConfirmDelete = async () => {
    if (!groupToDelete) {
      return;
    }

    try {
      setLoading(true);

      toast.error(
        'Group deletion is not supported by the backend yet.'
      );
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setGroupToDelete(null);
    }
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

        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenCreate}
        >
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
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() =>
                setSelectedCategory(cat)
              }
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
            const groupId =
              group.id || group._id;

            const groupExpenses =
              expenses.filter(
                (e) =>
                  String(e.groupId) ===
                  String(groupId)
              );

            const groupPayments =
              payments.filter(
                (p) =>
                  String(p.groupId) ===
                  String(groupId)
              );

            const balances =
              calculateGroupBalances(
                groupExpenses,
                groupPayments,
                group.members || []
              );

            const totalSpent =
              groupExpenses.reduce(
                (acc, e) =>
                  acc +
                  (Number(e.amount) || 0),
                0
              );

            const userNet =
              balances.netBalances[
                currentUser?.id || ''
              ] || 0;

            return (
              <GroupCard
                key={groupId}
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
        onClose={() =>
          setCreateModalOpen(false)
        }
        title="Create Group"
        subtitle="Set up a shared expense pot with friends"
        maxWidth="max-w-md"
      >
        <form
          onSubmit={handleSaveCreate}
          className="space-y-4"
        >
          <Input
            label="Group Name"
            placeholder="e.g. Goa Trip, Flat 304, Campus Hackathon"
            value={formData.name}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                name: e.target.value,
              }))
            }
            required
          />

          <Input
            label="Category"
            placeholder="Travel, Hostel, Food, etc."
            value={formData.category}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                category: e.target.value,
              }))
            }
            required
          />

          <Input
            label="Description"
            placeholder="Optional purpose notes"
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                description:
                  e.target.value,
              }))
            }
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setCreateModalOpen(
                  false
                )
              }
            >
              Cancel
            </Button>

            <Button
              type="submit"
              icon={FolderPlus}
            >
              Create Group
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Edit Group */}
      <Modal
        isOpen={editModalOpen}
        onClose={() =>
          setEditModalOpen(false)
        }
        title="Edit Group"
        subtitle="Modify group details and title"
        maxWidth="max-w-md"
      >
        <form
          onSubmit={handleSaveEdit}
          className="space-y-4"
        >
          <Input
            label="Group Name"
            value={formData.name}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                name: e.target.value,
              }))
            }
            required
          />

          <Input
            label="Category"
            value={formData.category}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                category: e.target.value,
              }))
            }
            required
          />

          <Input
            label="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData((p) => ({
                ...p,
                description:
                  e.target.value,
              }))
            }
          />

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() =>
                setEditModalOpen(
                  false
                )
              }
            >
              Cancel
            </Button>

            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal for Group Deletion */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() =>
          setDeleteConfirmOpen(
            false
          )
        }
        onConfirm={
          handleConfirmDelete
        }
        title="Delete Group?"
        message={`Are you sure you want to delete "${groupToDelete?.name}"? All associated expenses, splits, and settlement logs will be permanently removed.`}
        confirmText="Delete Group"
      />
    </div>
  );
};