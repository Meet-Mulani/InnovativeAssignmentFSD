import mongoose from 'mongoose';

const SitterCertificationSchema = new mongoose.Schema({
  certType: {
    type: String,
    enum: [
      'CPPS',
      'CPS-DW',
      'CPACP',
      'IPPC',
      'PUPP Institute',
      'PawSpace Internal',
      'Cat & Dog First Aid',
    ],
    required: true,
  },
  certificateId: {
    type: String,
    required: true,
  },
  issueDate: {
    type: Date,
    required: true,
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  documentUrl: {
    type: String,
    required: true,
  },
  verificationStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    default: 'PENDING',
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
});

const SitterProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: '',
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },                  //https://www.mongodb.com/community/forums/t/geonear-aggregation-query-example-causing-strange-error/214974
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',// it also supports point and polygon
        required: true,
      },
      // note longitude must come first
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    serviceAddress: {
      street: { type: String, default: '' },
      city: { type: String, default: 'Ahmedabad' },
    },
    serviceRadiusKm: {
      type: Number,
      default: 10,
      min: 1,
      max: 50,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    maxConcurrentPets: {
      type: Number,
      default: 1,
    },
    rates: {
      daySitting: {
        type: Number,
        required: true,
        default: 500,
      },
      walking: {
        type: Number,
        default: 200,
      },
    },
    capabilities: {
      oralMedication: { type: Boolean, default: false },
      injectionAdministration: { type: Boolean, default: false },
      reactiveDogsExperience: { type: Boolean, default: false },
      seniorPetCare: { type: Boolean, default: false },
    },
    certifications: [SitterCertificationSchema],
    blockedDates: [Date],
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewsCount: {
      type: Number,
      default: 0,
    },
    completedStays: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

SitterProfileSchema.index({ location: '2dsphere' });

export const SitterProfile = mongoose.model('SitterProfile', SitterProfileSchema);