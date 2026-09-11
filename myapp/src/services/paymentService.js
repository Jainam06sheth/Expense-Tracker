import { getData, setData } from '../utils/storage';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { activityService } from './activityService';

export const paymentService = {
  getAll: () => {
    return getData(STORAGE_KEYS.PAYMENTS, []);
  },

  getById: (id) => {
    const payments = getData(STORAGE_KEYS.PAYMENTS, []);
    return payments.find((p) => p.id === id) || null;
  },

  create: (data, currentUser) => {
    const payments = getData(STORAGE_KEYS.PAYMENTS, []);
    const newPayment = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? `pay-${crypto.randomUUID()}` : `pay-${Date.now()}`,
      groupId: data.groupId,
      fromUser: data.fromUser,
      toUser: data.toUser,
      amount: Number(data.amount),
      date: data.date || new Date().toISOString(),
      status: data.status || 'paid', // Default to simulated instant paid
      notes: data.notes || 'Simulated payment',
      reference: `SIM-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newPayment, ...payments];
    setData(STORAGE_KEYS.PAYMENTS, updated);

    // Activity
    const users = getData(STORAGE_KEYS.USERS, []);
    const fromMember = users.find((u) => u.id === data.fromUser) || { name: 'Member' };
    const toMember = users.find((u) => u.id === data.toUser) || { name: 'Member' };

    activityService.create({
      type: 'payment_completed',
      description: `${fromMember.name} paid ${toMember.name} ₹${newPayment.amount}`,
      userId: currentUser?.id || data.fromUser,
      userName: currentUser?.name || fromMember.name,
      groupId: data.groupId,
      entityId: newPayment.id,
      entityType: 'payment',
    });

    return newPayment;
  },

  update: (id, updates, currentUser) => {
    const payments = getData(STORAGE_KEYS.PAYMENTS, []);
    let updatedPayment = null;

    const updated = payments.map((p) => {
      if (p.id === id) {
        updatedPayment = { ...p, ...updates, updatedAt: new Date().toISOString() };
        return updatedPayment;
      }
      return p;
    });

    setData(STORAGE_KEYS.PAYMENTS, updated);
    return updatedPayment;
  },

  delete: (id, currentUser) => {
    const payments = getData(STORAGE_KEYS.PAYMENTS, []);
    const toDelete = payments.find((p) => p.id === id);
    if (!toDelete) return false;

    const updated = payments.filter((p) => p.id !== id);
    setData(STORAGE_KEYS.PAYMENTS, updated);

    activityService.create({
      type: 'payment_deleted',
      description: `${currentUser?.name || 'User'} removed settlement record of ₹${toDelete.amount}`,
      userId: currentUser?.id || 'unknown',
      userName: currentUser?.name || 'User',
      groupId: toDelete.groupId,
      entityId: toDelete.id,
      entityType: 'payment',
    });

    return true;
  },
};
