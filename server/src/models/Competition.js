const mongoose = require('mongoose');

// All possible competition states
const COMPETITION_STATUSES = [
  'UPCOMING',
  'REGISTRATION_OPEN',
  'REGISTRATION_CLOSED',
  'SUBMISSION_OPEN',
  'SUBMISSION_CLOSED',
  'RESULT_DECLARED',
  'CANCELLED',
];

const previousWinnerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    rank: { type: Number, required: true },
    prize: { type: String },
    avatar: { type: String, default: null },
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Competition title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Individual', 'Team'],
      default: 'Individual',
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    coverImage: {
      type: String,
      default: null,
    },

    // Prize and entry
    prizePool: {
      type: String,
      required: true,
    },
    entryFee: {
      type: Number,
      required: true,
      min: [0, 'Entry fee cannot be negative'],
    },

    // Capacity
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [1, 'Capacity must be at least 1'],
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: [0, 'Registered count cannot be negative'],
    },

    // Important dates
    registrationStart: {
      type: Date,
      required: [true, 'Registration start date is required'],
    },
    registrationEnd: {
      type: Date,
      required: [true, 'Registration end date is required'],
    },
    submissionStart: {
      type: Date,
      required: [true, 'Submission start date is required'],
    },
    submissionEnd: {
      type: Date,
      required: [true, 'Submission end date is required'],
    },
    resultDate: {
      type: Date,
      required: [true, 'Result date is required'],
    },

    // Judge
    judge: {
      name: { type: String, required: true },
      title: { type: String },
      avatar: { type: String, default: null },
    },

    // Details sections
    judgingParameters: [
      {
        name: { type: String, required: true },
        weightage: { type: Number }, // percentage
        description: { type: String },
      },
    ],
    rules: [{ type: String }],
    eligibility: [{ type: String }],
    rewards: [
      {
        rank: { type: Number, required: true },
        title: { type: String, required: true },
        prize: { type: String, required: true },
      },
    ],
    previousWinners: [previousWinnerSchema],

    // Status — derived from dates, but can be overridden (e.g. CANCELLED)
    status: {
      type: String,
      enum: COMPETITION_STATUSES,
      default: 'UPCOMING',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Compute the current competition state based on dates.
 * If status is manually set to CANCELLED or RESULT_DECLARED, that takes priority.
 * Otherwise the state is derived from the current server time.
 */
competitionSchema.methods.computeStatus = function () {
  // Manual overrides take priority
  if (this.status === 'CANCELLED' || this.status === 'RESULT_DECLARED') {
    return this.status;
  }

  const now = new Date();

  if (now < this.registrationStart) return 'UPCOMING';
  if (now >= this.registrationStart && now <= this.registrationEnd) {
    // Check if capacity is full
    if (this.registeredCount >= this.capacity) return 'REGISTRATION_CLOSED';
    return 'REGISTRATION_OPEN';
  }
  if (now > this.registrationEnd && now < this.submissionStart) return 'REGISTRATION_CLOSED';
  if (now >= this.submissionStart && now <= this.submissionEnd) return 'SUBMISSION_OPEN';
  if (now > this.submissionEnd && now < this.resultDate) return 'SUBMISSION_CLOSED';
  if (now >= this.resultDate) return 'RESULT_DECLARED';

  return this.status;
};

// Index for querying by status and category
competitionSchema.index({ status: 1 });
competitionSchema.index({ category: 1 });

module.exports = mongoose.model('Competition', competitionSchema);
module.exports.COMPETITION_STATUSES = COMPETITION_STATUSES;
