import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BillDetails } from './BillDetails';
import { ExpenseItems } from './ExpenseItems';
import { MemberSelector } from './MemberSelector';
import { SplitMethod } from './SplitMethod';
import { ExpensePreview } from './ExpensePreview';
import { Button } from '../common/Button';
import {
  calculateEqualSplit,
  calculateItemBasedSplit,
  validateSplits,
} from '../../utils/splitCalculator';
import {
  validateRequired,
  validateAmount,
  validateDate,
} from '../../utils/validation';
import { Check, ArrowRight, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, title: 'Bill Details' },
  { id: 2, title: 'Items' },
  { id: 3, title: 'Members' },
  { id: 4, title: 'Split Method' },
  { id: 5, title: 'Preview & Save' },
];

export const ExpenseWizard = ({
  groups = [],
  initialData = null,
  onSaveExpense,
  loading = false,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    groupId: initialData?.groupId || (groups[0]?.id || ''),
    category: initialData?.category || 'Food',
    amount: initialData?.amount !== undefined ? String(initialData.amount) : '',
    paidBy: initialData?.paidBy || '',
    date: initialData?.date || new Date().toISOString(),
    notes: initialData?.notes || '',
    splitMethod: initialData?.splitMethod || 'equal',
  });

  const [items, setItems] = useState(initialData?.items || []);
  const [overallParticipants, setOverallParticipants] = useState(
    initialData?.participants || []
  );
  const [customSplits, setCustomSplits] = useState(initialData?.splits || {});
  const [errors, setErrors] = useState({});

  // Active Group and its members
  const selectedGroup = groups.find((g) => g.id === formData.groupId) || groups[0];
  const members = selectedGroup?.members || [];

  // Set default paidBy and overallParticipants when group changes
  React.useEffect(() => {
    if (members.length > 0) {
      if (!formData.paidBy || !members.some((m) => m.id === formData.paidBy)) {
        setFormData((prev) => ({ ...prev, paidBy: members[0].id }));
      }
      if (overallParticipants.length === 0) {
        setOverallParticipants(members.map((m) => m.id));
      }
    }
  }, [formData.groupId, members]);

  const membersMap = useMemo(() => {
    const map = {};
    members.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [members]);

  // Dynamically calculate splits based on current splitMethod
  const calculatedSplits = useMemo(() => {
    const total = Number(formData.amount) || 0;
    if (formData.splitMethod === 'equal') {
      return calculateEqualSplit(total, overallParticipants);
    }
    if (formData.splitMethod === 'item-based') {
      if (items.length > 0) {
        return calculateItemBasedSplit(items);
      }
      return calculateEqualSplit(total, overallParticipants);
    }
    if (formData.splitMethod === 'custom') {
      return customSplits;
    }
    return {};
  }, [formData.splitMethod, formData.amount, overallParticipants, items, customSplits]);

  // Handlers for Form Data
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Handlers for Items
  const handleAddItem = (item) => {
    // Default participants to all group members
    setItems((prev) => [...prev, { ...item, participants: members.map((m) => m.id) }]);
  };

  const handleUpdateItem = (index, updatedItem) => {
    setItems((prev) => prev.map((it, idx) => (idx === index ? updatedItem : it)));
  };

  const handleDeleteItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleToggleItemParticipant = (itemIndex, memberId) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== itemIndex) return it;
        const currentParts = it.participants || [];
        const nextParts = currentParts.includes(memberId)
          ? currentParts.filter((id) => id !== memberId)
          : [...currentParts, memberId];
        return { ...it, participants: nextParts };
      })
    );
  };

  const handleSelectAllForItem = (itemIndex, allMemberIds) => {
    setItems((prev) =>
      prev.map((it, idx) => {
        if (idx !== itemIndex) return it;
        const isAll = it.participants?.length === allMemberIds.length;
        return { ...it, participants: isAll ? [] : allMemberIds };
      })
    );
  };

  // Handlers for Custom Split
  const handleCustomSplitChange = (memberId, value) => {
    setCustomSplits((prev) => ({ ...prev, [memberId]: Number(value) || 0 }));
  };

  // Step Validation Logic
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      const nameErr = validateRequired(formData.name, 'Expense Title');
      if (nameErr) newErrors.name = nameErr;

      const groupErr = validateRequired(formData.groupId, 'Group');
      if (groupErr) newErrors.groupId = groupErr;

      const amtErr = validateAmount(formData.amount, 'Total Bill Amount');
      if (amtErr) newErrors.amount = amtErr;

      const dateErr = validateDate(formData.date);
      if (dateErr) newErrors.date = dateErr;

      const payerErr = validateRequired(formData.paidBy, 'Payer');
      if (payerErr) newErrors.paidBy = payerErr;
    }

    if (step === 2 && formData.splitMethod === 'item-based') {
      if (items.length === 0) {
        newErrors.items = 'Please add at least one line item';
      } else {
        const itemsTotal = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
        const billTotal = Number(formData.amount) || 0;
        if (Math.abs(itemsTotal - billTotal) > 0.01) {
          newErrors.items = `Item sum (₹${itemsTotal}) must match total bill (₹${billTotal})`;
        }
      }
    }

    if (step === 3) {
      if (formData.splitMethod === 'equal') {
        if (overallParticipants.length === 0) {
          newErrors.participants = 'Select at least one participant';
        }
      } else if (formData.splitMethod === 'item-based') {
        const anyEmpty = items.some((it) => !it.participants || it.participants.length === 0);
        if (anyEmpty) {
          newErrors.participants = 'Each line item must have at least one assigned participant';
        }
      }
    }

    if (step === 4 && formData.splitMethod === 'custom') {
      const val = validateSplits(formData.amount, customSplits);
      if (!val.isValid) {
        newErrors.customSplits = `Custom splits must sum up to ₹${formData.amount}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Compile full validation messages for Step 5 preview
  const getFullValidationErrors = () => {
    const errs = [];
    if (!formData.name) errs.push('Expense title is required');
    if (!formData.amount || Number(formData.amount) <= 0) errs.push('Amount must be greater than 0');
    if (!formData.paidBy) errs.push('A valid payer is required');

    const total = Number(formData.amount) || 0;
    const splitValidation = validateSplits(total, calculatedSplits);
    if (!splitValidation.isValid) {
      errs.push(`Splits total (₹${splitValidation.sum}) does not equal bill amount (₹${total})`);
    }

    return errs;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      // If equal split and moving past step 1, skip step 2 items if user doesn't need them
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    } else {
      toast.error('Please resolve the required fields to continue');
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    const validationErrors = getFullValidationErrors();
    if (validationErrors.length > 0) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    // Determine involved participants
    let finalParticipants = [];
    if (formData.splitMethod === 'equal') {
      finalParticipants = overallParticipants;
    } else if (formData.splitMethod === 'item-based') {
      const set = new Set();
      items.forEach((it) => it.participants?.forEach((p) => set.add(p)));
      finalParticipants = Array.from(set);
    } else {
      finalParticipants = Object.keys(calculatedSplits).filter((id) => calculatedSplits[id] > 0);
    }

    const payload = {
      ...formData,
      amount: Number(formData.amount),
      items: formData.splitMethod === 'item-based' ? items : [],
      participants: finalParticipants,
      splits: calculatedSplits,
    };

    onSaveExpense(payload);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Stepper Header */}
      <div className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-6">
        <div className="flex items-center justify-between max-w-2xl mx-auto overflow-x-auto pb-2 sm:pb-0">
          {STEPS.map((s, idx) => {
            const isCompleted = currentStep > s.id;
            const isCurrent = currentStep === s.id;

            return (
              <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCompleted
                      ? 'bg-blue-600 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.id}
                </div>
                <span
                  className={`text-xs font-bold ${
                    isCurrent ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  {s.title}
                </span>

                {idx < STEPS.length - 1 && (
                  <div className="w-6 sm:w-10 h-0.5 bg-slate-200 mx-1" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content Body */}
      <div className="p-6 sm:p-8 max-w-3xl mx-auto">
        {currentStep === 1 && (
          <BillDetails
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
            groups={groups}
            members={members}
          />
        )}

        {currentStep === 2 && (
          <ExpenseItems
            items={items}
            totalBill={formData.amount}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            error={errors.items}
          />
        )}

        {currentStep === 3 && (
          <MemberSelector
            items={items}
            members={members}
            splitMethod={formData.splitMethod}
            selectedOverallParticipants={overallParticipants}
            onToggleOverallParticipant={setOverallParticipants}
            onToggleItemParticipant={handleToggleItemParticipant}
            onSelectAllForItem={handleSelectAllForItem}
          />
        )}

        {currentStep === 4 && (
          <SplitMethod
            splitMethod={formData.splitMethod}
            onSelectMethod={(method) =>
              setFormData((prev) => ({ ...prev, splitMethod: method }))
            }
            members={members}
            totalBill={formData.amount}
            customSplits={customSplits}
            onCustomSplitChange={handleCustomSplitChange}
          />
        )}

        {currentStep === 5 && (
          <ExpensePreview
            formData={formData}
            items={items}
            membersMap={membersMap}
            calculatedSplits={calculatedSplits}
            validationErrors={getFullValidationErrors()}
          />
        )}

        {/* Wizard Footer Controls */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div>
            {currentStep > 1 ? (
              <Button variant="secondary" onClick={handlePrev} icon={ArrowLeft}>
                Back
              </Button>
            ) : (
              <Button variant="ghost" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            )}
          </div>

          <div>
            {currentStep < 5 ? (
              <Button variant="primary" onClick={handleNext}>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleFinalSubmit}
                loading={loading}
                icon={Save}
              >
                Save & Settle
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
