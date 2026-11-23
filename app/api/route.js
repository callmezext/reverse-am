const express = require('express');
const statusRoute = require('./status/route');
const sendLinkRoute = require('./send-link/route');
const verifyLinkRoute = require('./verify-link/route');
const statsRoute = require('./stats/route');

const createApiRouter = (authLimiter) => {
  const router = express.Router();
  router.use('/status', statusRoute);
  router.use('/send-link', authLimiter, sendLinkRoute);
  router.use('/verify-link', authLimiter, verifyLinkRoute);
  router.use('/stats', statsRoute);
  return router;
};

module.exports = createApiRouter;
