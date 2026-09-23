const mongoose = require('mongoose');

const PARTICIPATION_STATUSES = ['REGISTERED', 'SUBMITTED', 'WINNER', 'DISQUALIFIED'];

const participationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    competitionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: [true, 'Competition ID is required'],
    },
    status: {
      type: String,
      enum: PARTICIPATION_STATUSES,
      default: 'REGISTERED',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },

    // Submission details
    submission: {
      title: { type: String, maxlength: 200 },
      description: { type: String, maxlength: 2000 },
      fileUrl: { type: String },
      linkUrl: { type: String },
    },
    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compound unique index: userId + competitionId
 *
 * WHY THIS IS NEEDED:
 * This index ensures that a single user cannot register for the same competition
 * more than once. Without it, race conditions could allow duplicate registrations
 * if two requests arrive at nearly the same time — both could pass the
 * application-level check and insert duplicate documents.
 *
 * With this unique index, MongoDB itself enforces the constraint at the database
 * level. If a duplicate insert is attempted, MongoDB throws a duplicate key error
 * (code 11000) which we catch and return a clean "already registered" response.
 *
 * This is a critical part of the concurrency safety strategy.
 */
participationSchema.index({ userId: 1, competitionId: 1 }, { unique: true });

// Index for querying all participants of a competition
participationSchema.index({ competitionId: 1 });

module.exports = mongoose.model('Participation', participationSchema);
module.exports.PARTICIPATION_STATUSES = PARTICIPATION_STATUSES;
