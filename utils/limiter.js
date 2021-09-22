const rateLimit = require('express-rate-limit');

// Настраиваем защиту от ДДОС-аттак.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // лимит запросов с одного IP за промежут windowsMs
});

module.exports = limiter;
