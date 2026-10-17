import { Pet } from '../models/Pet.js';

// POST /api/pets
export const createPet = async (req, res) => {
  try {
    const { name, species, breed, age, weightKg, microchipId } = req.body;

    const pet = await Pet.create({
      ownerId: req.user._id,
      name,
      species,
      breed,
      age: Number(age),
      weightKg: Number(weightKg),
      microchipId: microchipId || '',
    });

    res.status(201).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/pets/me
export const getMyPets = async (req, res) => {
  try {
    const pets = await Pet.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: pets.length, data: pets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/pets/:id
export const getPetById = async (req, res) => {
  try {
    const pet = await Pet.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }
    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/pets/id  :id
export const updatePetDossier = async (req, res) => {
  try {
    const { dietCard, medicalCard, name, breed, age, weightKg } = req.body;

    const pet = await Pet.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!pet) {
      return res.status(404).json({ success: false, message: 'Pet not found' });
    }

    if (name) pet.name = name;
    if (breed) pet.breed = breed;
    if (age) pet.age = Number(age);
    if (weightKg) pet.weightKg = Number(weightKg);
    if (dietCard) pet.dietCard = { ...pet.dietCard, ...dietCard };
    if (medicalCard) pet.medicalCard = { ...pet.medicalCard, ...medicalCard };

    await pet.save();

    res.status(200).json({ success: true, data: pet });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

