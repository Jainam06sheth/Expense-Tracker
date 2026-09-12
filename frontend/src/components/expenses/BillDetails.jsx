import React from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import {
  Receipt,
  IndianRupee,
  Tag,
  Calendar,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'Food', label: 'Food & Dining' },
  { value: 'Travel', label: 'Travel & Transport' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Bills', label: 'Bills & Utilities' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'College', label: 'College & Books' },
  { value: 'Hostel', label: 'Hostel & Rent' },
  { value: 'Other', label: 'Other' },
];

export const BillDetails = ({
  formData,
  onChange,
  errors = {},
  groups = [],
  members = [],
}) => {
  const groupOptions = groups.map((g) => ({
    value: g.id,
    label: g.name,
  }));

  // Get selected group
  const selectedGroup =
    groups.find(
      (g) => String(g.id) === String(formData.groupId)
    ) || groups[0];

  /*
   * PAID BY OPTIONS
   *
   * If members exist:
   *    show all members
   *
   * If no members:
   *    show group admin/creator
   */
  let payerOptions = [];

  if (members.length > 0) {
    payerOptions = members.map((member) => ({
      value: member.id,
      label:
        member.name ||
        member.username ||
        member.email ||
        'Member',
    }));
  } else if (selectedGroup?.createdBy) {
    const admin = selectedGroup.createdBy;

    /*
     * createdBy can be:
     *
     * 1. Just an ID
     * 2. Populated user object
     */
    if (typeof admin === 'object') {
      payerOptions = [
        {
          value: admin.id || admin._id,
          label:
            admin.name ||
            admin.username ||
            admin.email ||
            'Admin',
        },
      ];
    } else {
      payerOptions = [
        {
          value: admin,
          label:
            selectedGroup.createdByName ||
            selectedGroup.adminName ||
            'Admin',
        },
      ];
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Select Group"
          name="groupId"
          value={formData.groupId}
          onChange={onChange}
          options={groupOptions}
          placeholder="Choose a group"
          error={errors.groupId}
          required
        />

        <Input
          label="Expense Description / Title"
          name="name"
          placeholder="e.g. Dinner, Grocery, Taxi"
          value={formData.name}
          onChange={onChange}
          error={errors.name}
          icon={Receipt}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="Total Bill Amount"
          name="amount"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={formData.amount}
          onChange={onChange}
          error={errors.amount}
          icon={IndianRupee}
          required
        />

        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={onChange}
          options={CATEGORIES}
          placeholder="Select category"
          error={errors.category}
          required
        />

        <Input
          label="Expense Date"
          name="date"
          type="date"
          value={
            formData.date
              ? formData.date.split('T')[0]
              : ''
          }
          onChange={onChange}
          error={errors.date}
          icon={Calendar}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Paid By"
          name="paidBy"
          value={formData.paidBy}
          onChange={onChange}
          options={payerOptions}
          placeholder={
            payerOptions.length > 0
              ? 'Select who paid'
              : 'No payer available'
          }
          error={errors.paidBy}
          required
        />

        <Input
          label="Notes / Location (Optional)"
          name="notes"
          placeholder="e.g. Fishermans Wharf, Candolim"
          value={formData.notes}
          onChange={onChange}
        />
      </div>

      {formData.category === 'Other' && (
        <div className="animate-fadeIn">
          <Input
            label="Custom Category Name"
            name="customCategory"
            placeholder="e.g. Visa Fees, Maintenance"
            value={formData.customCategory || ''}
            onChange={onChange}
            icon={Tag}
            required
          />
        </div>
      )}
    </div>
  );
};