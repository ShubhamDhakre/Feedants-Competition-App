const Competition = require('../models/Competition');
const Participation = require('../models/Participation');

/**
 * GET /api/competitions
 * List all competitions with computed status and remaining spots.
 */
const getCompetitions = async (req, res, next) => {
  try {
    const competitions = await Competition.find().sort({ createdAt: -1 });

    const competitionsData = await Promise.all(
      competitions.map(async (competition) => {
        const data = competition.toObject();
        data.computedStatus = competition.computeStatus();
        data.remainingSpots = Math.max(0, competition.capacity - competition.registeredCount);

        let participation = null;
        if (req.user) {
          participation = await Participation.findOne({
            userId: req.user._id,
            competitionId: competition._id,
          });
        }

        data.userParticipation = participation
          ? {
              status: participation.status,
              registeredAt: participation.registeredAt,
              hasSubmitted: participation.status === 'SUBMITTED',
              submittedAt: participation.submittedAt,
            }
          : null;

        return data;
      })
    );

    res.json({
      success: true,
      data: {
        competitions: competitionsData,
        count: competitionsData.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/competitions/:id
 * Get competition details with computed status.
 * If the user is authenticated (optional auth), also returns their participation status.
 */
const getCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found',
        code: 'COMPETITION_NOT_FOUND',
      });
    }

    // Compute the real-time status from server dates
    const computedStatus = competition.computeStatus();

    // Build the response object
    const competitionData = competition.toObject();
    competitionData.computedStatus = computedStatus;
    competitionData.remainingSpots = Math.max(0, competition.capacity - competition.registeredCount);
    competitionData.serverTime = new Date().toISOString(); // so client can sync countdown

    // If user is authenticated, check their participation
    let participation = null;
    if (req.user) {
      participation = await Participation.findOne({
        userId: req.user._id,
        competitionId: competition._id,
      });
    }

    competitionData.userParticipation = participation
      ? {
          status: participation.status,
          registeredAt: participation.registeredAt,
          hasSubmitted: participation.status === 'SUBMITTED',
          submittedAt: participation.submittedAt,
        }
      : null;

    res.json({
      success: true,
      data: { competition: competitionData },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/competitions/:id/register
 * Register the authenticated user for a competition.
 *
 * CONCURRENCY STRATEGY:
 * Uses atomic findOneAndUpdate with conditions to prevent race conditions.
 * The operation only increments registeredCount if it's still below capacity.
 * The compound unique index on Participation (userId + competitionId) prevents duplicates.
 *
 * Steps:
 * 1. Validate competition exists and registration is open
 * 2. Atomically increment registeredCount (only if < capacity)
 * 3. Create participation record
 * 4. If participation insert fails (duplicate), rollback the count
 */
const registerForCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found',
        code: 'COMPETITION_NOT_FOUND',
      });
    }

    // Check if registration is open using server time
    const computedStatus = competition.computeStatus();

    if (computedStatus !== 'REGISTRATION_OPEN') {
      return res.status(400).json({
        success: false,
        message: 'Registration is not currently open for this competition',
        code: 'REGISTRATION_NOT_OPEN',
      });
    }

    // Pre-check: verify user is not already registered before attempting increment
    const existingParticipation = await Participation.findOne({
      userId: req.user._id,
      competitionId: competition._id,
    });

    if (existingParticipation) {
      return res.status(409).json({
        success: false,
        message: 'You are already registered for this competition',
        code: 'ALREADY_REGISTERED',
      });
    }

    // ATOMIC OPERATION: Increment registeredCount only if still below capacity.
    // This prevents two users from both seeing "1 spot left" and both registering.
    const updatedCompetition = await Competition.findOneAndUpdate(
      {
        _id: competition._id,
        registeredCount: { $lt: competition.capacity }, // condition: not full
      },
      {
        $inc: { registeredCount: 1 }, // atomic increment
      },
      {
        returnDocument: 'after', // return the updated document (Mongoose 9+)
      }
    );

    // If null, the competition is full (condition failed)
    if (!updatedCompetition) {
      return res.status(400).json({
        success: false,
        message: 'Competition is full — no spots remaining',
        code: 'COMPETITION_FULL',
      });
    }

    // Create participation record
    try {
      const participation = await Participation.create({
        userId: req.user._id,
        competitionId: competition._id,
        status: 'REGISTERED',
      });

      res.status(201).json({
        success: true,
        data: {
          participation: {
            _id: participation._id,
            competitionId: participation.competitionId,
            status: participation.status,
            registeredAt: participation.registeredAt,
          },
          remainingSpots: updatedCompetition.capacity - updatedCompetition.registeredCount,
        },
      });
    } catch (error) {
      // If participation creation fails (duplicate key = already registered),
      // rollback the registeredCount increment
      await Competition.findByIdAndUpdate(competition._id, {
        $inc: { registeredCount: -1 },
      });

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'You are already registered for this competition',
          code: 'ALREADY_REGISTERED',
        });
      }

      throw error; // re-throw unexpected errors
    }
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/competitions/:id/submission
 * Submit an entry for a competition.
 * User must be registered and submission period must be open.
 */
const submitEntry = async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id);

    if (!competition) {
      return res.status(404).json({
        success: false,
        message: 'Competition not found',
        code: 'COMPETITION_NOT_FOUND',
      });
    }

    // Check submission period
    const computedStatus = competition.computeStatus();

    if (computedStatus !== 'SUBMISSION_OPEN') {
      return res.status(400).json({
        success: false,
        message: 'Submission period is not currently open',
        code: 'SUBMISSION_NOT_OPEN',
      });
    }

    // Check if user is registered
    const participation = await Participation.findOne({
      userId: req.user._id,
      competitionId: competition._id,
    });

    if (!participation) {
      return res.status(403).json({
        success: false,
        message: 'You must be registered for this competition to submit',
        code: 'NOT_REGISTERED',
      });
    }

    // Check if already submitted
    if (participation.status === 'SUBMITTED') {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an entry',
        code: 'ALREADY_SUBMITTED',
      });
    }

    // Update participation with submission data
    const { title, description, linkUrl } = req.body;

    participation.submission = {
      title,
      description: description || '',
      linkUrl: linkUrl || '',
    };
    participation.status = 'SUBMITTED';
    participation.submittedAt = new Date();

    await participation.save();

    res.json({
      success: true,
      data: {
        participation: {
          _id: participation._id,
          status: participation.status,
          submission: participation.submission,
          submittedAt: participation.submittedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCompetitions, getCompetition, registerForCompetition, submitEntry };
