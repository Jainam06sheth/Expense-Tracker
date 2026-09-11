import React from 'react';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Receipt, Calendar, IndianRupee, Tag, Users } from 'lucide-react';

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

  const payerOptions = members.map((m) => ({
    value: m.id,
    label: m.name,
  }));

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
          value={formData.date ? formData.date.split('T')[0] : ''}
          onChange={onChange}
          error={errors.date}
          icon={Calendar}
          required
        />
      </div>

      {formData.category === 'Other' && (
        <div className="animate-fadeIn">
          <Input
            label="Custom Category Name"
            name="customCategory"
            placeholder="e.g. Project Supplies, Maintenance"
            value={formData.customCategory || ''}
            onChange={onChange}
            icon={Tag}
            required
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Paid By"
          name="paidBy"
          value={formData.paidBy}
          onChange={onChange}
          options={payerOptions}
          placeholder="Who paid the bill?"
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
    </div>
  );
};
