// =============================================================
// Mock Core Banking Service
// Abstract layer for all banking operations.
// Replace internals with real core banking API calls later.
// =============================================================
const { findById, updateCustomer } = require('../models/customer');

/**
 * Get account balance for a customer
 */
const getBalance = (customerId) => {
  const customer = findById(customerId);
  if (!customer) throw new Error('Customer not found');
  return {
    balance: customer.balance,
    accountNumber: customer.accountNumber,
    customerName: customer.name,
    currency: 'INR',
    asOf: new Date().toISOString()
  };
};

/**
 * Get last 5 transactions (mini statement)
 */
const getMiniStatement = (customerId) => {
  const customer = findById(customerId);
  if (!customer) throw new Error('Customer not found');
  return {
    accountNumber: customer.accountNumber,
    customerName: customer.name,
    transactions: customer.transactions.slice(0, 5),
    generatedAt: new Date().toISOString()
  };
};

/**
 * Block the customer's card
 */
const blockCard = (customerId) => {
  const customer = findById(customerId);
  if (!customer) throw new Error('Customer not found');
  if (customer.cardStatus === 'blocked') {
    return { alreadyBlocked: true, cardStatus: 'blocked', message: 'Card is already blocked.' };
  }
  updateCustomer(customerId, { cardStatus: 'blocked' });
  return {
    alreadyBlocked: false,
    cardStatus: 'blocked',
    referenceNumber: `BLK${Date.now()}`,
    message: 'Card blocked successfully. A new card will be dispatched within 7 working days.',
    timestamp: new Date().toISOString()
  };
};

/**
 * Loan eligibility check and pre-application
 */
const applyLoan = (customerId, loanDetails = {}) => {
  const customer = findById(customerId);
  if (!customer) throw new Error('Customer not found');
  const { loanType = 'personal', amount = 100000 } = loanDetails;

  if (!customer.loanEligible) {
    return {
      eligible: false,
      reason: 'Insufficient account history or low balance.',
      message: 'You are currently not eligible for this loan. Please visit a branch for detailed assessment.'
    };
  }

  const interestRates = { personal: 10.5, home: 8.75, vehicle: 9.25, education: 6.5 };
  const rate = interestRates[loanType] || 10.5;

  return {
    eligible: true,
    loanType,
    requestedAmount: amount,
    interestRate: `${rate}% p.a.`,
    tenure: '12-60 months',
    emi: Math.round((amount * (rate / 1200)) / (1 - Math.pow(1 + rate / 1200, -60))),
    referenceNumber: `LOAN${Date.now()}`,
    message: `Your ${loanType} loan application has been registered. Our team will contact you within 24 hours.`,
    nextSteps: ['Document verification', 'Credit score check', 'Disbursement within 3 working days']
  };
};

module.exports = { getBalance, getMiniStatement, blockCard, applyLoan };
