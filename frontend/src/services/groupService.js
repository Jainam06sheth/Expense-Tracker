import { activityService } from './activityService';
import { api } from './api';

export const groupService = {
  getAll: async () => {
    try {
      const response = await api.request('/groups');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching groups:', error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const response = await api.request(`/groups/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching group with id ${id}:`, error);
      return null;
    }
  },

  create: async (data, currentUser) => {
    try {
      const payload = {
        name: data.name,
        category: data.category,
        description: data.description,
      };

      const response = await api.request('/groups', {
        method: 'POST',
        body: payload,
      });

      // The backend creates the group and adds the current user as admin
      // We don't need to manually create activity here as the backend should do it
      // However, to maintain existing behavior, we can still create activity if needed
      // But let's rely on backend activity creation for consistency

      return response.data;
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  },

  update: async (id, updates, currentUser) => {
    try {
      const response = await api.request(`/groups/${id}`, {
        method: 'PUT',
        body: updates,
      });

      // Backend should handle activity creation
      return response.data;
    } catch (error) {
      console.error(`Error updating group with id ${id}:`, error);
      throw error;
    }
  },

  // Note: The backend does not have a group deletion endpoint
  // We'll need to add it or remove this functionality
  // For now, we'll simulate it by removing from local state
  // But ideally, we should add DELETE /api/groups/:groupId to backend
  delete: async (id, currentUser) => {
    try {
      // Since backend doesn't support group deletion, we'll need to add that endpoint
      // For now, we'll throw an error indicating this functionality needs backend support
      throw new Error('Group deletion is not supported by the backend. Please add DELETE /api/groups/:groupId endpoint.');

      // Alternatively, if we want to remove it optimistically and sync later:
      // const response = await api.request(`/groups/${id}`, {
      //   method: 'DELETE',
      // });
      // return response.data;
    } catch (error) {
      console.error(`Error deleting group with id ${id}:`, error);
      throw error;
    }
  },

  // Additional methods that might be needed based on frontend usage
  getMembers: async (groupId) => {
    try {
      const response = await api.request(`/groups/${groupId}/members`);
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching members for group ${groupId}:`, error);
      return [];
    }
  },

  addMember: async (groupId, memberData, currentUser) => {
    try {
      // This would require a backend endpoint like POST /api/groups/:groupId/members
      // Since it doesn't exist, we'll use the invitation system instead
      // Or we need to add this endpoint to backend
      throw new Error('Adding members directly is not supported. Use the invitation system instead.');
    } catch (error) {
      console.error(`Error adding member to group ${groupId}:`, error);
      throw error;
    }
  },

  updateMember: async (groupId, memberId, updates, currentUser) => {
    try {
      // This would require a backend endpoint like PUT /api/groups/:groupId/members/:memberId
      throw new Error('Updating members directly is not supported by the backend.');
    } catch (error) {
      console.error(`Error updating member in group ${groupId}:`, error);
      throw error;
    }
  },

  removeMember: async (groupId, memberId, currentUser) => {
    try {
      const response = await api.request(`/groups/${groupId}/member/${memberId}`, {
        method: 'DELETE',
      });
      return response.data;
    } catch (error) {
      console.error(`Error removing member from group ${groupId}:`, error);
      throw error;
    }
  }
};