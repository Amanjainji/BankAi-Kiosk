// =============================================================
// In-Memory Mock Customer Store
// Simulates core banking customer records
// =============================================================
const { v4: uuidv4 } = require('uuid');

const customers = [
  {
    id: 'cust_001',
    name: 'Arjun Sharma',
    mobile: '9876543210',
    balance: 1_25_420.50,
    transactions: [
      { id: uuidv4(), date: '2024-03-01', type: 'credit', amount: 50000, description: 'Salary Credit', balance: 125420.50 },
      { id: uuidv4(), date: '2024-02-28', type: 'debit',  amount: 3500,  description: 'Electricity Bill',  balance: 75420.50 },
      { id: uuidv4(), date: '2024-02-25', type: 'debit',  amount: 12000, description: 'Online Shopping',   balance: 78920.50 },
      { id: uuidv4(), date: '2024-02-20', type: 'credit', amount: 5000,  description: 'Fund Transfer In',  balance: 90920.50 },
      { id: uuidv4(), date: '2024-02-15', type: 'debit',  amount: 2000,  description: 'ATM Withdrawal',    balance: 85920.50 }
    ],
    cardStatus: 'active',
    accountNumber: 'XXXX XXXX 4321',
    loanEligible: true,
    languagePreference: 'en'
  },
  {
    id: 'cust_002',
    name: 'Priya Patel',
    mobile: '9988776655',
    balance: 87_350.00,
    transactions: [
      { id: uuidv4(), date: '2024-03-02', type: 'credit', amount: 40000, description: 'Salary Credit',     balance: 87350.00 },
      { id: uuidv4(), date: '2024-02-27', type: 'debit',  amount: 8000,  description: 'Rent Payment',      balance: 47350.00 },
      { id: uuidv4(), date: '2024-02-22', type: 'debit',  amount: 1500,  description: 'Restaurant',        balance: 55350.00 },
      { id: uuidv4(), date: '2024-02-18', type: 'credit', amount: 15000, description: 'Freelance Income',  balance: 56850.00 },
      { id: uuidv4(), date: '2024-02-10', type: 'debit',  amount: 5000,  description: 'Insurance Premium', balance: 41850.00 }
    ],
    cardStatus: 'active',
    accountNumber: 'XXXX XXXX 7788',
    loanEligible: true,
    languagePreference: 'hi'
  },
  {
    id: 'cust_003',
    name: 'Rajesh Kumar',
    mobile: '7700112233',
    balance: 4_200.75,
    transactions: [
      { id: uuidv4(), date: '2024-03-01', type: 'debit',  amount: 2000,  description: 'ATM Withdrawal',    balance: 4200.75 },
      { id: uuidv4(), date: '2024-02-26', type: 'credit', amount: 6000,  description: 'Fund Transfer',     balance: 6200.75 },
      { id: uuidv4(), date: '2024-02-20', type: 'debit',  amount: 1800,  description: 'Utility Bill',      balance: 200.75 },
      { id: uuidv4(), date: '2024-02-15', type: 'credit', amount: 1800,  description: 'Refund',            balance: 2000.75 },
      { id: uuidv4(), date: '2024-02-10', type: 'debit',  amount: 500,   description: 'Mobile Recharge',   balance: 200.75 }
    ],
    cardStatus: 'blocked',
    accountNumber: 'XXXX XXXX 5566',
    loanEligible: false,
    languagePreference: 'en'
  }
];

/**
 * Find a customer by their mobile number
 */
const findByMobile = (mobile) => customers.find(c => c.mobile === mobile) || null;

/**
 * Find a customer by their ID
 */
const findById = (id) => customers.find(c => c.id === id) || null;

/**
 * Update a customer record (mutates in-memory store)
 */
const updateCustomer = (id, updates) => {
  const idx = customers.findIndex(c => c.id === id);
  if (idx === -1) return null;
  customers[idx] = { ...customers[idx], ...updates };
  return customers[idx];
};

module.exports = { customers, findByMobile, findById, updateCustomer };
