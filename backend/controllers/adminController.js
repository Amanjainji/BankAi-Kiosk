// =============================================================
// Admin Controller: Analytics & Escalation Management
// =============================================================
const { getAllEscalations, escalations } = require('../models/escalation');
const { sessionStore } = require('../models/session');
const { auditLogs } = require('../middleware/audit');
const { findById } = require('../models/customer');

const getMetrics = (_req, res) => {
  // Compute analytics from in-memory stores
  const totalSessions = sessionStore.size;
  const allEscalations = getAllEscalations();
  const totalEscalations = allEscalations.length;
  const openEscalations = allEscalations.filter(e => e.status === 'open').length;
  const escalationRate = totalSessions > 0
    ? ((totalEscalations / totalSessions) * 100).toFixed(1)
    : 0;

  // Intent frequency
  const intentCounts = {};
  const languageCounts = { en: 0, hi: 0 };

  sessionStore.forEach(sess => {
    languageCounts[sess.language] = (languageCounts[sess.language] || 0) + 1;
    sess.turns.forEach(turn => {
      if (turn.intent) intentCounts[turn.intent] = (intentCounts[turn.intent] || 0) + 1;
    });
  });

  const topIntents = Object.entries(intentCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([intent, count]) => ({ intent, count }));

  // Avg handling time from sessions (minutes)
  let avgHandlingTime = 0;
  if (totalSessions > 0) {
    let totalMs = 0;
    sessionStore.forEach(sess => {
      const lastTurn = sess.turns[sess.turns.length - 1];
      if (lastTurn) totalMs += lastTurn.timestamp - sess.startTime;
    });
    avgHandlingTime = ((totalMs / totalSessions) / 60000).toFixed(1);
  }

  // Recent audit logs (last 20)
  const recentAuditLogs = auditLogs.slice(-20).reverse();

  return res.json({
    success: true,
    metrics: {
      totalSessions,
      totalEscalations,
      openEscalations,
      escalationRate: `${escalationRate}%`,
      totalAIHandled: totalSessions - totalEscalations,
      avgHandlingTimeMin: avgHandlingTime,
      languageUsage: languageCounts,
      topIntents,
      recentAuditLogs
    }
  });
};

const getEscalations = (_req, res) => {
  const tickets = getAllEscalations().map(ticket => {
    const customer = findById(ticket.customerId);
    return {
      ...ticket,
      customer: customer ? {
        name: customer.name,
        mobile: customer.mobile,
        accountNumber: customer.accountNumber,
        balance: customer.balance
      } : null
    };
  });

  return res.json({ success: true, escalations: tickets, total: tickets.length });
};

module.exports = { getMetrics, getEscalations };
