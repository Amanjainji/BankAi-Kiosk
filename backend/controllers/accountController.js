// =============================================================
// Account Controller
// =============================================================
const bankingService = require('../services/bankingService');

const getBalance = (req, res) => {
  try {
    const data = bankingService.getBalance(req.user.customerId);
    res.locals.audit?.('GET_BALANCE', 'success');
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const getMiniStatement = (req, res) => {
  try {
    const data = bankingService.getMiniStatement(req.user.customerId);
    res.locals.audit?.('GET_MINI_STATEMENT', 'success');
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

const blockCard = (req, res) => {
  try {
    const data = bankingService.blockCard(req.user.customerId);
    res.locals.audit?.('BLOCK_CARD', 'success', { cardStatus: 'blocked' });
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = { getBalance, getMiniStatement, blockCard };
