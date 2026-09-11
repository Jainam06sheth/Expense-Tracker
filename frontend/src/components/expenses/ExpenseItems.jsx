import React, { useState } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { formatCurrency } from '../../utils/currencyFormatter';

export const ExpenseItems = ({
  items = [],
  totalBill = 0,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  error,
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');

  const itemsSum = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);
  const diff = Math.round((Number(totalBill) - itemsSum) * 100) / 100;
  const isMatch = Math.abs(diff) < 0.01;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemAmount || Number(newItemAmount) <= 0) return;

    onAddItem({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? `item-${crypto.randomUUID()}` : `item-${Date.now()}`,
      name: newItemName.trim(),
      amount: Number(newItemAmount),
      participants: [],
    });

    setNewItemName('');
    setNewItemAmount('');
  };

  return (
    <div className="space-y-5">
      {/* Bill vs Items Summary Pill */}
      <div
        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
          isMatch
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            : 'bg-amber-50/70 border-amber-200 text-amber-900'
        }`}
      >
        <div className="flex items-center gap-2">
          {isMatch ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          )}
          <div>
            <p className="font-bold text-sm">
              {isMatch
                ? 'Item totals match the bill amount perfectly'
                : "Item total doesn't match the bill total"}
            </p>
            <p className="opacity-80">
              Total Bill: <span className="font-bold">{formatCurrency(totalBill)}</span> |
              Items Total: <span className="font-bold">{formatCurrency(itemsSum)}</span>
            </p>
          </div>
        </div>

        {!isMatch && (
          <div className="bg-white/80 px-3 py-1.5 rounded-lg border border-amber-300/60 font-bold self-start sm:self-auto">
            Remaining to allocate: {formatCurrency(Math.abs(diff))}
          </div>
        )}
      </div>

      {/* Add Item Row */}
      <form
        onSubmit={handleAdd}
        className="flex flex-col sm:flex-row items-end gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80"
      >
        <div className="flex-1 w-full">
          <Input
            label="Line Item Name"
            placeholder="e.g. Pizza, Drinks, Dessert"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-44">
          <Input
            label="Item Amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={newItemAmount}
            onChange={(e) => setNewItemAmount(e.target.value)}
          />
        </div>
        <Button
          type="submit"
          icon={Plus}
          disabled={!newItemName.trim() || !newItemAmount || Number(newItemAmount) <= 0}
          className="w-full sm:w-auto h-[42px]"
        >
          Add Item
        </Button>
      </form>

      {/* Items List */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Itemized Line Items ({items.length})
        </h4>

        {items.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
            No items added yet. Add at least one item above to allocate costs.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
            {items.map((item, index) => (
              <div
                key={item.id || index}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold text-slate-800">
                    {item.name}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(item.amount)}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteItem(index)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-xs text-rose-600 font-medium">⚠ {error}</p>}
    </div>
  );
};
