import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'dounia_secret_key_change_me';

export const register = async (req: Request, res: Response): Promise<void> => {
console.log("RECEIVED REGISTER REQUEST!"); // <-- ADD THIS
  console.log("Body:", req.body);               // <-- ADD THIS
  try {
    const { name, email, password, role, phone, customerProfile } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists with this email' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      passwordHash,
      role: 'CUSTOMER',
      phone,
      customerProfile: customerProfile || { skinType: 'Normal', skinConcerns: [], hairType: 'Normal', allergies: [] }
    });

    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET || 'dunia_secret_key', // Runtime evaluation
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        customerProfile: newUser.customerProfile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration', error });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || 'dunia_secret_key', // Runtime evaluation
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        customerProfile: user.customerProfile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const user = await User.findById(req.user.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving user data', error });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const { name, phone, customerProfile } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (customerProfile) {
      user.customerProfile = {
        ageRange: customerProfile.ageRange || user.customerProfile.ageRange,
        sex: customerProfile.sex || user.customerProfile.sex,
        skinType: customerProfile.skinType || user.customerProfile.skinType,
        skinConcerns: customerProfile.skinConcerns || user.customerProfile.skinConcerns,
        hairType: customerProfile.hairType || user.customerProfile.hairType,
        allergies: customerProfile.allergies || user.customerProfile.allergies
      };
    }

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        customerProfile: user.customerProfile
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating profile', error });
  }
};