const express = require('express');
const { getCompetitions, getCompetition, registerForCompetition, submitEntry } = require('../controllers/competitionController');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateCompetitionId, validateSubmission } = require('../validators/competition');

const router = express.Router();

// GET /api/competitions — list all competitions (optional auth)
router.get('/', optionalAuth, getCompetitions);

// GET /api/competitions/:id — get competition details (optional auth)
// Optional auth: if user is logged in, returns their participation status too
router.get('/:id', validateCompetitionId, optionalAuth, getCompetition);

// POST /api/competitions/:id/register — register for competition (auth required)
router.post('/:id/register', validateCompetitionId, auth, registerForCompetition);

// POST /api/competitions/:id/submission — submit entry (auth required)
router.post('/:id/submission', validateSubmission, auth, submitEntry);

module.exports = router;
