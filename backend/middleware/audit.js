// =============================================================
// Audit Logging Middleware
// Captures all mutating API calls for compliance trail
// =============================================================

/** @type {Array<AuditLog>} */
const auditLogs = [];

/**
 * Middleware: attach audit logger to res.locals
 */
const auditMiddleware = (req, res, next) => {
  res.locals.audit = (action, result = 'success', details = {}) => {
    auditLogs.push({
      timestamp: new Date().toISOString(),
      userId: req.user?.customerId || 'anonymous',
      mobile: req.user?.mobile || 'unknown',
      ip: req.ip,
      method: req.method,
      path: req.path,
      action,
      result,
      details
    });
  };
  next();
};

const getAuditLogs = () => [...auditLogs];

module.exports = { auditMiddleware, getAuditLogs, auditLogs };
