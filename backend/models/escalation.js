// =============================================================
// In-Memory Escalation Ticket Store
// =============================================================

/** @type {Array<EscalationTicket>} */
const escalations = [];
let ticketCounter = 1000;

/**
 * Create a new escalation ticket
 * @returns {EscalationTicket}
 */
const createEscalation = ({ customerId, customerName, mobile, intent, language, summary, turns, sentiment }) => {
  const ticket = {
    id: `ESC${++ticketCounter}`,
    customerId,
    customerName,
    mobile,
    intent,
    language,
    summary: summary || 'Customer requested agent escalation.',
    turns: turns || [],
    sentiment: sentiment || 'negative',
    status: 'open',
    createdAt: new Date().toISOString(),
    assignedAgent: null,
    resolvedAt: null
  };
  escalations.push(ticket);
  return ticket;
};

const getAllEscalations = () => [...escalations].reverse(); // newest first

const getOpenEscalations = () => escalations.filter(e => e.status === 'open');

const updateStatus = (id, status, agentName) => {
  const ticket = escalations.find(e => e.id === id);
  if (!ticket) return null;
  ticket.status = status;
  if (agentName) ticket.assignedAgent = agentName;
  if (status === 'resolved') ticket.resolvedAt = new Date().toISOString();
  return ticket;
};

module.exports = { escalations, createEscalation, getAllEscalations, getOpenEscalations, updateStatus };
