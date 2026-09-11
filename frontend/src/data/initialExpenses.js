export const initialExpenses = [
  {
    id: 'expense-goa-cab',
    name: 'Airport Cab to Resort',
    groupId: 'group-goa-trip',
    category: 'Travel',
    amount: 800,
    paidBy: 'user-bharat',
    date: '2026-03-08T15:30:00.000Z',
    notes: 'Airport pickup taxi to Candolim',
    splitMethod: 'equal',
    items: [
      { id: 'item-cab-1', name: 'Airport Taxi', amount: 800, participants: ['user-bharat', 'user-aman', 'user-priya', 'user-neha'] }
    ],
    participants: ['user-bharat', 'user-aman', 'user-priya', 'user-neha'],
    splits: {
      'user-bharat': 200,
      'user-aman': 200,
      'user-priya': 200,
      'user-neha': 200,
    },
    status: 'unsettled',
    createdAt: '2026-03-08T15:35:00.000Z',
  },
  {
    id: 'expense-goa-dinner',
    name: 'Dinner',
    groupId: 'group-goa-trip',
    category: 'Food',
    amount: 2500,
    paidBy: 'user-bharat',
    date: '2026-03-09T20:45:00.000Z',
    notes: 'Italian dinner night at Fisherman Wharf',
    splitMethod: 'item-based',
    items: [
      { id: 'item-1', name: 'Pizza', amount: 800, participants: ['user-bharat', 'user-aman', 'user-priya'] },
      { id: 'item-2', name: 'Burger', amount: 300, participants: ['user-bharat', 'user-aman'] },
      { id: 'item-3', name: 'Pasta', amount: 600, participants: ['user-bharat', 'user-priya'] },
      { id: 'item-4', name: 'Drinks', amount: 400, participants: ['user-bharat', 'user-priya', 'user-neha'] },
      { id: 'item-5', name: 'Dessert', amount: 400, participants: ['user-bharat', 'user-neha'] },
    ],
    participants: ['user-bharat', 'user-aman', 'user-priya', 'user-neha'],
    splits: {
      'user-bharat': 1150,
      'user-aman': 450,
      'user-priya': 600,
      'user-neha': 300,
    },
    status: 'unsettled',
    createdAt: '2026-03-09T21:00:00.000Z',
  },
  {
    id: 'expense-hostel-wifi',
    name: 'Broadband WiFi Bill',
    groupId: 'group-hostel-304',
    category: 'Bills',
    amount: 999,
    paidBy: 'user-aman',
    date: '2026-03-05T11:00:00.000Z',
    notes: 'Fiber 200Mbps monthly plan',
    splitMethod: 'equal',
    items: [
      { id: 'item-wifi', name: 'Internet Bill', amount: 999, participants: ['user-bharat', 'user-aman'] }
    ],
    participants: ['user-bharat', 'user-aman'],
    splits: {
      'user-bharat': 499.5,
      'user-aman': 499.5,
    },
    status: 'settled',
    createdAt: '2026-03-05T11:05:00.000Z',
  },
  ...Array.from({ length: 15 }).map((_, i) => ({
    id: `expense-dummy-${i}`,
    name: `Dummy Expense ${i + 1}`,
    groupId: 'group-goa-trip',
    category: ['Food', 'Travel', 'Bills', 'Shopping', 'Entertainment'][i % 5],
    amount: (i + 1) * 150,
    paidBy: ['user-bharat', 'user-aman', 'user-priya', 'user-neha'][i % 4],
    date: new Date(Date.now() - i * 86400000).toISOString(),
    notes: `Dummy notes for expense ${i + 1}`,
    splitMethod: 'equal',
    items: [
      { id: `item-dummy-${i}`, name: 'General', amount: (i + 1) * 150, participants: ['user-bharat', 'user-aman'] }
    ],
    participants: ['user-bharat', 'user-aman'],
    splits: {
      'user-bharat': ((i + 1) * 150) / 2,
      'user-aman': ((i + 1) * 150) / 2,
    },
    status: i % 3 === 0 ? 'settled' : 'unsettled',
    createdAt: new Date().toISOString(),
  }))
];
