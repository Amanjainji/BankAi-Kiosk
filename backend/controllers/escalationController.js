// =============================================================
// Escalation Controller
// =============================================================
const { createEscalation } = require('../models/escalation');
const { findById } = require('../models/customer');

const createTicket = (req, res) => {
  const { customerId, name: agentName } = req.user;
  const { intent, language, summary, turns, sentiment } = req.body;

  const customer = findById(customerId);
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  const ticket = createEscalation({
    customerId,
    customerName: customer.name,
    mobile: customer.mobile,
    intent: intent || 'unknown',
    language: language || 'en',
    summary: summary || 'Customer requested escalation.',
    turns: turns || [],
    sentiment: sentiment || 'negative'
  });

  return res.status(201).json({
    success: true,
    message: 'Escalation ticket created. Connecting to human agent.',
    ticket
  });
};

module.exports = { createTicket };
