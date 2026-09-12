
import React, { useState, useEffect } from 'react';
import { invitationService } from '../services/invitationService';
import { groupService } from '../services/groupService';
import { userService } from '../services/userService';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';

import {
  Search,
  UserPlus,
  MessageSquare,
  Users,
  Plus,
} from 'lucide-react';

import toast from 'react-hot-toast';

export const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('pending');

  useEffect(() => {
    const loadInvitations = async () => {
      try {
        setLoading(true);

        // Get current user profile first
        const profileResult = await userService.loadProfile();

        if (!profileResult.success || !profileResult.user) {
          throw new Error('Unable to load user profile');
        }

        // Get all invitations for the current user
        const result = await invitationService.getAll();

        if (!result.success) {
          throw new Error(
            result.message || 'Unable to load invitations'
          );
        }

        // Enrich invitations with group and inviter details
        const enrichedInvitations = await Promise.all(
          (result.data || []).map(async (invitation) => {
            try {
              // Get group details
              const groupResult = await groupService.getById(
                invitation.groupId
              );

              const group = groupResult.data || {};

              // Get inviter details from invitation
              const inviter = invitation.invitedBy || {
                id: 'unknown',
                name: 'Unknown User',
                email: '',
              };

              return {
                ...invitation,
                group,
                inviter,
              };
            } catch (error) {
              console.error(
                'Error enriching invitation:',
                error
              );

              return invitation;
            }
          })
        );

        setInvitations(enrichedInvitations);
      } catch (error) {
        console.error(
          'Error loading invitations:',
          error
        );

        toast.error(
          error.message || 'Unable to load invitations'
        );

        setInvitations([]);
      } finally {
        setLoading(false);
      }
    };

    loadInvitations();
  }, []);

  // Accept invitation
  const handleAcceptInvitation = async (invitationId) => {
    try {
      const result = await invitationService.accept(
        invitationId
      );

      if (result.success) {
        toast.success(
          'Invitation accepted successfully!'
        );

        setInvitations((prev) =>
          prev.map((invitation) =>
            invitation._id === invitationId
              ? {
                  ...invitation,
                  status: 'accepted',
                }
              : invitation
          )
        );
      } else {
        throw new Error(
          result.message ||
            'Failed to accept invitation'
        );
      }
    } catch (error) {
      console.error(
        'Error accepting invitation:',
        error
      );

      toast.error(
        error.message ||
          'Unable to accept invitation'
      );
    }
  };

  // Reject invitation
  const handleRejectInvitation = async (invitationId) => {
    try {
      const result = await invitationService.reject(
        invitationId
      );

      if (result.success) {
        toast.success('Invitation rejected');

        setInvitations((prev) =>
          prev.filter(
            (invitation) =>
              invitation._id !== invitationId
          )
        );
      } else {
        throw new Error(
          result.message ||
            'Failed to reject invitation'
        );
      }
    } catch (error) {
      console.error(
        'Error rejecting invitation:',
        error
      );

      toast.error(
        error.message ||
          'Unable to reject invitation'
      );
    }
  };

  // Filter invitations
  const filteredInvitations = invitations.filter(
    (invitation) => {
      const searchText =
        searchQuery.toLowerCase();

      const matchesGroup =
        invitation.group?.name
          ?.toLowerCase()
          .includes(searchText);

      const matchesInviter =
        invitation.inviter?.name
          ?.toLowerCase()
          .includes(searchText);

      const matchesDescription =
        (invitation.description || '')
          .toLowerCase()
          .includes(searchText);

      const matchesSearch =
        matchesGroup ||
        matchesInviter ||
        matchesDescription;

      const matchesStatus =
        filterStatus === 'all' ||
        invitation.status === filterStatus;

      return (
        matchesSearch &&
        matchesStatus
      );
    }
  );

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Group Invitations
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage incoming group invitations
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm text-center">
          <p className="text-sm text-slate-500">
            Loading invitations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Group Invitations
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage incoming group invitations
          </p>
        </div>

        <Button
          variant="outline"
          icon={
            <Users className="w-4 h-4 mr-2" />
          }
          onClick={() => {
            window.location.href = '/groups';
          }}
        >
          View All Groups
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="flex-1">
          <Input
            placeholder="Search by group name or inviter..."
            icon={Search}
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
          />
        </div>

        {/* Filter */}
        <div className="w-full sm:w-48">
          <select
            value={filterStatus}
            onChange={(e) =>
              setFilterStatus(e.target.value)
            }
            className="w-full p-2 border border-slate-300 rounded-md bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled hidden>
              Select filter
            </option>

            <option value="pending">
              Pending Invitations
            </option>

            <option value="accepted">
              Accepted Invitations
            </option>

            <option value="rejected">
              Rejected Invitations
            </option>

            <option value="all">
              All Invitations
            </option>
          </select>
        </div>
      </div>

      {/* Invitations List */}
      {filteredInvitations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No invitations found"
          description={
            filterStatus === 'pending'
              ? 'You have no pending group invitations. When someone invites you to a group, it will appear here.'
              : `You have no ${filterStatus} invitations.`
          }
          actionLabel={
            filterStatus === 'pending'
              ? 'Browse Groups'
              : 'View All'
          }
          onAction={() => {
            window.location.href =
              filterStatus === 'pending'
                ? '/groups'
                : '/invitations';
          }}
          actionIcon={
            filterStatus === 'pending' ? (
              <Plus className="w-4 h-4 mr-1" />
            ) : (
              <Users className="w-4 h-4 mr-1" />
            )
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">

          <div className="space-y-4">

            {filteredInvitations.map(
              (invitation) => (
                <div
                  key={invitation._id}
                  className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
                >

                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">

                    {/* Left side */}
                    <div className="flex-1">

                      <div className="flex items-start gap-3">

                        {/* Icon */}
                        <div className="shrink-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>

                        {/* Information */}
                        <div>

                          <h3 className="text-sm font-bold text-slate-900">
                            {invitation.group?.name ||
                              'Unnamed Group'}
                          </h3>

                          <p className="text-xs text-slate-500 mt-1">
                            Invited by{' '}
                            {invitation.inviter?.name ||
                              'a user'}{' '}
                            ·{' '}
                            {invitation.createdAt
                              ? new Date(
                                  invitation.createdAt
                                ).toLocaleDateString()
                              : 'Unknown date'}
                          </p>

                          {invitation.description && (
                            <p className="text-xs text-slate-400 mt-1">
                              {invitation.description}
                            </p>
                          )}

                        </div>
                      </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">

                      {/* Pending */}
                      {invitation.status ===
                        'pending' && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              handleRejectInvitation(
                                invitation._id
                              )
                            }
                          >
                            Reject
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleAcceptInvitation(
                                invitation._id
                              )
                            }
                          >
                            Accept
                          </Button>
                        </>
                      )}

                      {/* Accepted */}
                      {invitation.status ===
                        'accepted' && (
                        <span className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                          Accepted
                        </span>
                      )}

                      {/* Rejected */}
                      {invitation.status ===
                        'rejected' && (
                        <span className="px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-800 rounded-full">
                          Rejected
                        </span>
                      )}

                    </div>
                  </div>
                </div>
              )
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default Invitations;