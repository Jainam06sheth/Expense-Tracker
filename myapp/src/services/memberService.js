import { getData, setData } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { activityService } from './activityService';

export const memberService = {
  getByGroupId: (groupId) => {
    const groups = getData(STORAGE_KEYS.GROUPS, []);
    const group = groups.find((g) => g.id === groupId);
    return group ? group.members || [] : [];
  },

  create: (groupId, memberData, currentUser) => {
    const groups = getData(STORAGE_KEYS.GROUPS, []);
    let addedMember = null;

    const updatedGroups = groups.map((g) => {
      if (g.id === groupId) {
        const members = g.members || [];
        // Prevent duplicate member by email
        const exists = members.some(
          (m) => m.email?.toLowerCase().trim() === memberData.email?.toLowerCase().trim()
        );
        if (exists) {
          throw new Error('A member with this email already exists in this group');
        }

        addedMember = {
          id: memberData.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? `user-${crypto.randomUUID()}` : `user-${Date.now()}`),
          name: memberData.name.trim(),
          email: memberData.email.trim(),
          role: memberData.role || 'member',
          status: 'active',
        };

        return { ...g, members: [...members, addedMember] };
      }
      return g;
    });

    if (addedMember) {
      setData(STORAGE_KEYS.GROUPS, updatedGroups);
      const group = groups.find((g) => g.id === groupId);

      activityService.create({
        type: 'member_added',
        description: `${currentUser?.name || 'User'} added ${addedMember.name} to "${group?.name}"`,
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'User',
        groupId: groupId,
        groupName: group?.name || 'Group',
        entityId: addedMember.id,
        entityType: 'member',
      });
    }

    return addedMember;
  },

  update: (groupId, memberId, updates, currentUser) => {
    const groups = getData(STORAGE_KEYS.GROUPS, []);
    let updatedMember = null;

    const updatedGroups = groups.map((g) => {
      if (g.id === groupId) {
        const members = (g.members || []).map((m) => {
          if (m.id === memberId) {
            updatedMember = { ...m, ...updates };
            return updatedMember;
          }
          return m;
        });
        return { ...g, members };
      }
      return g;
    });

    if (updatedMember) {
      setData(STORAGE_KEYS.GROUPS, updatedGroups);
      const group = groups.find((g) => g.id === groupId);

      activityService.create({
        type: 'member_updated',
        description: `${currentUser?.name || 'User'} updated member details for ${updatedMember.name}`,
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'User',
        groupId: groupId,
        groupName: group?.name || 'Group',
        entityId: updatedMember.id,
        entityType: 'member',
      });
    }

    return updatedMember;
  },

  delete: (groupId, memberId, currentUser) => {
    const groups = getData(STORAGE_KEYS.GROUPS, []);
    let removedMember = null;

    // Check if member has active expense contributions to prevent breaking history
    const expenses = getData(STORAGE_KEYS.EXPENSES, []);
    const groupExpenses = expenses.filter((e) => e.groupId === groupId);
    const hasActiveExpenses = groupExpenses.some(
      (e) => e.paidBy === memberId || (e.splits && e.splits[memberId] > 0)
    );

    if (hasActiveExpenses) {
      throw new Error(
        'Cannot remove member because they have associated expenses or splits. Settle debts or mark inactive instead.'
      );
    }

    const updatedGroups = groups.map((g) => {
      if (g.id === groupId) {
        removedMember = (g.members || []).find((m) => m.id === memberId);
        const members = (g.members || []).filter((m) => m.id !== memberId);
        return { ...g, members };
      }
      return g;
    });

    if (removedMember) {
      setData(STORAGE_KEYS.GROUPS, updatedGroups);
      const group = groups.find((g) => g.id === groupId);

      activityService.create({
        type: 'member_removed',
        description: `${currentUser?.name || 'User'} removed ${removedMember.name} from "${group?.name}"`,
        userId: currentUser?.id || 'unknown',
        userName: currentUser?.name || 'User',
        groupId: groupId,
        groupName: group?.name || 'Group',
        entityId: memberId,
        entityType: 'member',
      });
    }

    return true;
  },
};
