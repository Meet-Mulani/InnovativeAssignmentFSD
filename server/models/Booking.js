import mongoose from 'mongoose';

const TaskLogSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['FOOD', 'MEDICATION', 'WALK', 'SLEEP'],
    required: true,
  },
  taskName: {
    type: String,
    required: true,
  },
  targetTime: {
    type: String,
    default: '',
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  loggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  details: {
    portionGiven: { type: String, default: '' },
    medicationStatus: {
      type: String,
      enum: ['GIVEN', 'REFUSED', 'SKIPPED', 'NA'],
      default: 'NA',
    },
    walkDurationMinutes: { type: Number, default: 0 },
    bathroomStats: {
      pee: { type: Boolean, default: false },
      poop: { type: Boolean, default: false },
      stoolConsistency: {
        type: String,
        enum: ['Normal', 'Loose', 'Hard', 'NA'],
        default: 'NA',
      },
    },
    notes: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
  },
});

const DailyCareSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  tasks: [TaskLogSchema],
});

const BookingSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sitterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['DAY_SITTING', 'WALKING', 'BOARDING'],
      default: 'DAY_SITTING',
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    specialInstructions: {
      type: String,
      default: '',
    },
    dailyLogs: [DailyCareSchema],
    isReviewedByOwner: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Booking = mongoose.model('Booking', BookingSchema);