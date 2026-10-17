import jwt from 'jsonwebtoken'; //used for creating token
import { User } from '../models/User.js'; //importing user model
import { SitterProfile } from '../models/SitterProfile.js';

const generateToken = (id) => { //id is mongodb id
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const register = async (req, res) => {//res is tool
  try {
    const { name, email, password, role, phone, longitude, latitude, city, street } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'OWNER',
      phone: phone || '',
    });

    // If registering as sitter, create initial SitterProfile with coordinates
    if (user.role === 'SITTER') {
      const lng = parseFloat(longitude) || 72.5714; // Default Ahmedabad coords
      const lat = parseFloat(latitude) || 23.0225;

      await SitterProfile.create({
        userId: user._id,
        location: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        serviceAddress: {
          street: street || 'Satellite',
          city: city || 'Ahmedabad',
        },
      });
    }

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {  // avoids bypassing the frontend
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');//force include of password
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password); //custom built to cpmpare hash password
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id, //who is performing the action
        name: user.name,
        email: user.email,
        role: user.role, //need role for React frontend
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);//protected route but intercepted by middleware for ._id
    let sitterProfile = null;

    if (user.role === 'SITTER') {
      sitterProfile = await SitterProfile.findOne({ userId: user._id }); //pricing and location details, for dashboard details
    }

    res.status(200).json({
      success: true,
      user,
      sitterProfile,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};