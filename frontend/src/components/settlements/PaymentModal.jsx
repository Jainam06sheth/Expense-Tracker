import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Avatar } from '../common/Avatar';
import { formatCurrency } from '../../utils/currencyFormatter';
import { ArrowRight, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

export const PaymentModal = ({
  isOpen,
  onClose,
  debtor,
  creditor,
  amount = 0,
  groupId,
  groups = [],
  onConfirmPayment,
  loading = false,
}) => {
  const [payAmount, setPayAmount] = useState(String(amount));
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || (groups[0]?.id || ''));
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('Settled shared expense via CampusSettle');

  // Keep state updated if props change
  React.useEffect(() => {
    if (amount) setPayAmount(String(amount));
    if (groupId) setSelectedGroupId(groupId);
  }, [amount, groupId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const num = Number(payAmount);
    if (!num || num <= 0) {
      toast.error('Payment amount must be greater than 0');
      return;
    }

    onConfirmPayment({
      fromUser: debtor?.id,
      toUser: creditor?.id,
      amount: num,
      groupId: selectedGroupId,
      method: paymentMethod,
      notes,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Simulated Payment"
      subtitle="Mark debt as settled in CampusSettle"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Payer and Payee Visualizer */}
        <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Avatar name={debtor?.name} size="sm" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Sender
              </span>
              <span className="text-xs font-bold text-slate-900">{debtor?.name}</span>
            </div>
          </div>

          <div className="p-1.5 rounded-full bg-blue-100 text-blue-600">
            <ArrowRight className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2.5 text-right">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Recipient
              </span>
              <span className="text-xs font-bold text-blue-600">{creditor?.name}</span>
            </div>
            <Avatar name={creditor?.name} size="sm" />
          </div>
        </div>

        {/* Group Selection (if multiple) */}
        {groups.length > 0 && (
          <Select
            label="Related Group"
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            options={groups.map((g) => ({ value: g.id, label: g.name }))}
            required
          />
        )}

        {/* Amount */}
        <Input
          label="Settlement Amount"
          type="number"
          step="0.01"
          value={payAmount}
          onChange={(e) => setPayAmount(e.target.value)}
          required
        />

        {/* Simulated Method */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
            Simulated Method
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPaymentMethod('upi')}
              className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                paymentMethod === 'upi'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Simulated UPI</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`p-2.5 rounded-xl border font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                paymentMethod === 'cash'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Cash in Hand</span>
            </button>
          </div>
        </div>

        {/* Notes */}
        <Input
          label="Note / Reference"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="e.g. Paid via GPay, settled dinner share"
        />

        {/* Demo Disclaimer Alert */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span>
            This is a frontend simulation. No real money or bank transactions will occur.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} icon={CheckCircle2}>
            Confirm & Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
