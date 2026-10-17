import mongoose from 'mongoose';

const PrescriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, required: true },
  instructions: { type: String, default: '' },
});

const VaccinationSchema = new mongoose.Schema({
  vaccineName: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  documentUrl: { type: String, default: '' },
});

const PetSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId, //not string but database id
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Pet name is required'],
      trim: true,
    },
    species: {
      type: String,
      enum: ['Dog', 'Cat', 'Other'],
      required: true,
    },
    breed: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    weightKg: {
      type: Number,
      required: true,
    },
    microchipId: {
      type: String,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    dietCard: {
      feedingSchedule: [{ type: String }],
      portionSize: { type: String, default: '' },
      foodSpecifications: { type: String, default: '' },
      allergies: [{ type: String }],
      treatLimits: { type: String, default: '' },
    },
    medicalCard: {
      prescriptions: [PrescriptionSchema], //not using
      vaccinations: [VaccinationSchema],// not using
      chronicConditions: [{ type: String }],
      behavioralTriggers: [{ type: String }], // Thunderstorms, etc.
      emergencyVet: {
        clinicName: { type: String, default: '' },
        vetName: { type: String, default: '' },
        phone: { type: String, default: '' },
        address: { type: String, default: '' },
      },
    },
  },
  { timestamps: true }
);

export const Pet = mongoose.model('Pet', PetSchema);