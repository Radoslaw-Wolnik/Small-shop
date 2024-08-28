// src/controllers/authController.ts
import { Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import RevokedToken from '../models/RevokedToken';
import User, { IUserDocument } from '../models/User';
import { generateToken, setTokenCookie, refreshToken as refreshAuthToken, generateShortLivedToken, setShortLivedTokenCookie } from '../middleware/auth';
import env from '../config/environment';
import sendEmail from '../utils/sendEmail';

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface PostRegLoginRequest extends Request {
  user?: IUserDocument; // Set by handlePostRegistrationAuth middleware
}

export const login = async (req: LoginRequest, res: Response): Promise<void> => {
  try {

    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Check if email is verified 
    if (!user.isVerified) {
      res.status(401).json({ message: 'Please verify your email before logging in' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid credentials' });
      return;
    }

    // Create and return JWT token
    const token = generateToken(user);
    setTokenCookie(res, token);
    res.json({ message: 'Login successful', user: { id: user._id, role: user.role } });
    // http
    // res.json({ token, user: { id: user._id, username: user.username, role: user.role } });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

export const postRegistrationLogin = async (req: PostRegLoginRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // User is already authenticated via short-lived token
    res.json({ 
      message: 'Login successful', 
      user: { id: req.user._id, role: req.user.role, isVerified: req.user.isVerified }
    });

  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};


export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    //const token = req.headers.authorization.split(' ')[1];
    //const token = extractToken(req);
    const token = req.cookies.token;
    if (!token) {
      res.status(400).json({ message: 'No token provided.' });
      return;
    }

    const decodedToken = jwt.decode(token);
    if (!decodedToken) {
      res.status(400).json({ message: 'Invalid token.' });
      return;
    }

    // Add the token to the revoked tokens list
    await RevokedToken.create({
      token: token,
      expiresAt: new Date((decodedToken as jwt.JwtPayload).exp! * 1000)
    });
    //console.log("Succes at revoking the token");

    //res.clearCookie('token');
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'strict' });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    if (error as any === 11000) { // Duplicate key error
      res.status(400).json({ message: 'Token already revoked.' });
    }
    res.status(500).json({ message: 'Server error during logout' });
  }
};

interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
  };
}

export const register = async (req: RegisterRequest, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // Check if username is already taken
    user = await User.findOne({ username });
    if (user) {
      res.status(401).json({ message: 'Username already exists' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create new user
    user = new User({
      username,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpires,
      role: 'user'
    });

    await user.save();

    // Generate a short-lived token and set it as a cookie
    const shortLivedToken = generateShortLivedToken(user);
    setShortLivedTokenCookie(res, shortLivedToken);

    const verificationUrl = `${env.FRONTEND}/verify-email/${verificationToken}`;
    console.log('Attempting to send email to:', user.email);
    //console.log('Verification URL:', verificationUrl);
    await sendEmail({
      to: user.email,
      subject: 'Verify Your Email',
      html: `
        <h1>Verify Your Email</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `
    });
    console.log('Email sent successfully');

    res.status(201).json({ 
      message: 'User registered. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Error in registration process:', error);
    res.status(500).send('Server error');
  }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  // Use the existing refreshToken function from the auth module
  try {
    await refreshAuthToken(req, res);
  } catch (error) {
    res.status(500).json({ message: 'Failed to refresh token', error: (error as Error).message });
  }
};

export const sendVerificationEmail = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(500).json({ message: 'Internal server error: User not attached to request' });
      return;
    }

    if (req.user.isVerified) {
      res.status(400).json({ message: 'Email already verified' });
      return;
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    req.user.verificationToken = verificationToken;
    req.user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await req.user.save();

    const verificationUrl = `${env.FRONTEND}/verify-email/${verificationToken}`;
    
    await sendEmail({
      to: req.user.email,
      subject: 'Verify Your Email',
      html: `
        <h1>Verify Your Email</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `
    });

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

interface VerifyEmailRequest extends Request {
  params: {
    token: string;
  };
}

export const verifyEmail = async (req: VerifyEmailRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

interface ChangePasswordRequest extends AuthRequest {
  body: {
    currentPassword: string;
    newPassword: string;
  };
}

export const changePassword = async (req: ChangePasswordRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(500).json({ message: 'Internal server error: User not attached to request' });
      return;
    }

    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(currentPassword, req.user.password);
    if (!isMatch) {
      res.status(400).json({ message: 'Current password is incorrect' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    req.user.password = await bcrypt.hash(newPassword, salt);
    await req.user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

interface RequestPasswordResetRequest extends Request {
  body: {
    email: string;
  };
}

export const requestPasswordReset = async (req: RequestPasswordResetRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetUrl = `${env.FRONTEND}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

interface ResetPasswordRequest extends Request {
  params: {
    token: string;
  };
  body: {
    password: string;
  };
}

export const resetPassword = async (req: ResetPasswordRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Server error' });
  }
};