import { SitterProfile } from '../models/SitterProfile.js';
import { User } from '../models/User.js';

// GET /api/sitters (Public Geospatial Search)
export const getNearbySitters = async (req, res) => {
  try {
    const { // default structuring
      lng,
      lat,
      radius = 10,
      minRating = 0,
      certifications,
      startDate,
      endDate,
      sortBy = 'distance',
      page = 1, //pagination
      limit = 12,
    } = req.query;

    if (!lng || !lat) {
      return res.status(400).json({
        success: false,
        message: 'Coordinates (lng and lat) are required for discovery',
      });
    }

    const radiusInMeters = parseFloat(radius) * 1000;
    const matchFilters = {
      averageRating: { $gte: parseFloat(minRating) },
    };

    if (certifications) {
      const certArray = certifications.split(',');
      matchFilters.certifications = {
        $elemMatch: {
          certType: { $in: certArray },
          verificationStatus: 'APPROVED',
        },
      };
    }

    if (startDate && endDate) {
      matchFilters.blockedDates = {
        $not: {
          $elemMatch: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      };
    }
    // https://www.mongodb.com/docs/manual/reference/operator/aggregation/geonear/
    const pipeline = [
      {
        $geoNear: { //mao engine og ongodb
          near: {    //epicenter
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          distanceField: 'distanceMeters',// calculates distance
          maxDistance: radiusInMeters,
          spherical: true,
          query: matchFilters,
        },
      },
      {
        $addFields: {
          distanceKm: { $round: [{ $divide: ['$distanceMeters', 1000] }, 1] },
        },
      },
    ];

    if (sortBy === 'rating') {
      pipeline.push({ $sort: { averageRating: -1, distanceMeters: 1 } });
    } else if (sortBy === 'price_asc') {
      pipeline.push({ $sort: { 'rates.daySitting': 1, distanceMeters: 1 } });
    } else if (sortBy === 'price_desc') {
      pipeline.push({ $sort: { 'rates.daySitting': -1, distanceMeters: 1 } });
    } else {
      pipeline.push({ $sort: { distanceMeters: 1 } });
    }
    // https://www.mongodb.com/docs/manual/reference/operator/aggregation/skip/ and https://www.mongodb.com/docs/manual/reference/operator/aggregation/limit/
    const skipCount = (parseInt(page) - 1) * parseInt(limit); //used for pagiantion but not required 
    pipeline.push({ $skip: skipCount }, { $limit: parseInt(limit) });

    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          'user.password': 0, //exclude password
        },
      }
    );

    const sitters = await SitterProfile.aggregate(pipeline);

    res.status(200).json({
      success: true,
      count: sitters.length,
      data: sitters,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/sitters/:id (Public Sitter Profile Dossier)
export const getSitterById = async (req, res) => {
  try {
    const profile = await SitterProfile.findById(req.params.id).populate(
      'userId',
      'name email phone avatarUrl'
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Sitter profile not found' });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/sitters/profile/me (Current Authenticated Sitter Profile)
export const getMySitterProfile = async (req, res) => {
  try {
    const profile = await SitterProfile.findOne({ userId: req.user._id }).populate(
      'userId',
      'name email phone avatarUrl'
    );

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Sitter profile not initialized' });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/sitters/profile (Update Service Coordinates, Rates, and Bio)
export const updateSitterProfile = async (req, res) => {
  try {
    const {
      bio,
      yearsOfExperience,
      daySittingRate,
      walkingRate,
      serviceRadiusKm,
      street,
      city,
      longitude,
      latitude,
      capabilities,
    } = req.body;

    const profile = await SitterProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Sitter profile not found' });
    }

    if (bio !== undefined) profile.bio = bio;
    if (yearsOfExperience !== undefined) profile.yearsOfExperience = Number(yearsOfExperience);
    if (daySittingRate !== undefined) profile.rates.daySitting = Number(daySittingRate);
    if (walkingRate !== undefined) profile.rates.walking = Number(walkingRate);
    if (serviceRadiusKm !== undefined) profile.serviceRadiusKm = Number(serviceRadiusKm);
    if (street !== undefined) profile.serviceAddress.street = street;
    if (city !== undefined) profile.serviceAddress.city = city;
    if (capabilities) profile.capabilities = { ...profile.capabilities, ...capabilities };

    if (longitude !== undefined && latitude !== undefined) {
      profile.location = {
        type: 'Point',
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Sitter profile updated successfully',
      data: profile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/sitters/availability/me
export const getMyAvailability = async (req, res) => {
  try {
    const profile = await SitterProfile.findOne({ userId: req.user._id }).select(
      'blockedDates maxConcurrentPets'
    );
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    res.status(200).json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/sitters/availability (Update Blocked Dates & Max Capacity)
export const updateMyAvailability = async (req, res) => {
  try {
    const { blockedDates, maxConcurrentPets } = req.body;

    const profile = await SitterProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    if (blockedDates !== undefined) {
      profile.blockedDates = blockedDates.map((d) => new Date(d));
      profile.markModified('blockedDates');
    }
    if (maxConcurrentPets !== undefined) {
      profile.maxConcurrentPets = Number(maxConcurrentPets);
    }

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: {
        blockedDates: profile.blockedDates,
        maxConcurrentPets: profile.maxConcurrentPets,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/sitters/certificates (Upload Certificate Proof Document)
export const uploadCertificate = async (req, res) => {
  try {
    const { certType, certificateId, issueDate, expiryDate, documentUrl } = req.body;

    if (!documentUrl || !certType || !certificateId || !issueDate) {
      return res.status(400).json({
        success: false,
        message: 'documentUrl, certType, certificateId, and issueDate are required fields',
      });
    }

    const profile = await SitterProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Sitter profile not found' });
    }

    const newCert = {
      certType,
      certificateId,
      issueDate: new Date(issueDate),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      documentUrl,
      verificationStatus: 'APPROVED',
    };

    profile.certifications.push(newCert);
    await profile.save();

    res.status(201).json({
      success: true,
      message: 'Certificate uploaded and queued for verification',
      data: profile.certifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/sitters/certificates/:certId
export const deleteCertificate = async (req, res) => {
  try {
    const profile = await SitterProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    profile.certifications = profile.certifications.filter(
      (cert) => cert._id.toString() !== req.params.certId
    );

    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Certificate entry deleted',
      data: profile.certifications,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};