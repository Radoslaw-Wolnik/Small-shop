// src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import RevokedToken from '../models/revoked-token.model';
import User, { IUserDocument } from '../models/user.model';
import { generateToken, setTokenCookie, refreshToken as refreshAuthToken, generateShortLivedToken, setShortLivedTokenCookie } from '../middleware/auth.middleware';
import environment from '../config/environment';
import sendEmail from '../services/email.service';
import AuthRequest from '../../types/global';
import { MongoError } from 'mongodb';
import { ValidationError, UnauthorizedError, NotFoundError, ConflictError, InternalServerError, AuthenticationError, CustomError, BadRequestError, ResourceExistsError, GoneError } from '../utils/custom-errors.util';
import logger from '../utils/logger.util';

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface PostRegLoginRequest extends Request {
  user?: IUserDocument; // Set by handlePostRegistrationAuth middleware
}

export const login = async (req: LoginRequest, res: Response, next: NextFunction): Promise<void> => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required');
    }

    // Find user by email hash and compare at the same time
    const user = await User.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Failed login attempt', { email: req.body.email });
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if email is verified 
    if (!user.isVerified) {
      throw new UnauthorizedError('Please verify your email before logging in');
    }

    // Create and return JWT token
    const token = generateToken(user);
    setTokenCookie(res, token);

    logger.info('User logged in successfully', { userId: user._id });
    res.json({ message: 'Login successful', user: { id: user._id, role: user.role } });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

export const postRegistrationLogin = async (req: PostRegLoginRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new UnauthorizedError('Unauthorized');
    }

    // User is already authenticated via short-lived token
    res.json({ 
      message: 'Login successful', 
      user: { id: req.user._id, role: req.user.role, isVerified: req.user.isVerified }
    });

  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error in post-registration login'));
  }
};


export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    //const token = req.headers.authorization.split(' ')[1];
    //const token = extractToken(req);
    const token = req.cookies.token;
    if (!token) {
      throw new ValidationError('No token provided');
    }

    const decodedToken = jwt.decode(token);
    if (!decodedToken) {
      throw new ValidationError('Invalid token');
    }

    // Add the token to the revoked tokens list
    await RevokedToken.create({
      token: token,
      expiresAt: new Date((decodedToken as jwt.JwtPayload).exp! * 1000)
    });
    //console.log("Succes at revoking the token");

    //res.clearCookie('token');
    res.clearCookie('token', { httpOnly: true, secure: true, sameSite: 'strict' });
    logger.info('User logged out', { userId: req.user?.id });
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    if (error instanceof Error && (error as any).code === 11000) {
      next(new ConflictError('Token already revoked'));
    } else {
      next(error instanceof CustomError ? error : new InternalServerError('Error during logout'));
    }
  }
};

interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
  };
}

export const register = async (req: RegisterRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      throw new BadRequestError('Username, email, and password are required');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      throw new ResourceExistsError('User already exists');
    }

    // Check if username is already taken
    /* insted just try and if not possible send 409 error
    user = await User.findOne({ username });
    if (user) {
      res.status(401).json({ message: 'Username already exists' });
      return;
    }
    */

    const user = new User({ 
      username, 
      email,  // Will be automatically encrypted when saved
      password, // This will be hashed automatically before saving
      role: 'user'
    });

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    const verificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(verificationTokenExpires);

    await user.save();
    logger.info('New user registered', { userId: user._id, username: user.username });

    // Generate a short-lived token and set it as a cookie
    const shortLivedToken = generateShortLivedToken(user);
    setShortLivedTokenCookie(res, shortLivedToken);

    const verificationUrl = `${environment.app.frontend}/verify-email/${verificationToken}`;
    // console.log('Attempting to send email to:', user.email);
    //console.log('Verification URL:', verificationUrl);
    await sendEmail({
      to: email,
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
    if (error instanceof Error && (error as any).code === 11000) {
      let field = 'field';
      if ((error as any).keyPattern) {
        field = Object.keys((error as any).keyPattern)[0];
      }
      next(new ResourceExistsError(`User with that ${field}`));
    } else {
      next(error instanceof CustomError ? error : new InternalServerError('Error registering user'));
    }
  }
};


export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  // Use the existing refreshToken function from the auth module
  try {
    await refreshAuthToken(req, res);
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Failed to refresh token'));
  }
};

export const sendVerificationEmail = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new InternalServerError('User not attached to request');
    }

    if (req.user.isVerified) {
      throw new ConflictError('Email already verified');
    }

    const verificationToken = crypto.randomBytes(20).toString('hex');
    req.user.verificationToken = verificationToken;
    req.user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await req.user.save();

    const verificationUrl = `${environment.app.frontend}/verify-email/${verificationToken}`;

    const decryptedEmail = await req.user.getDecryptedEmail();
    
    await sendEmail({
      to: decryptedEmail,
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
    next(error instanceof CustomError ? error : new InternalServerError('Error sending verification email'));
  }
};

interface VerifyEmailRequest extends Request {
  params: {
    token: string;
  };
}

export const verifyEmail = async (req: VerifyEmailRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new GoneError('Verification token has expired or is invalid');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();
    logger.info('User email verified', { userId: user._id });

    res.json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error verifying email'));
  }
};

interface ChangePasswordRequest extends AuthRequest {
  body: {
    currentPassword: string;
    newPassword: string;
  };
}

export const changePassword = async (req: ChangePasswordRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new InternalServerError('User not attached to request');
    }

    const { currentPassword, newPassword } = req.body;
    // im not sure about bcrypt.compare becouse the current password wont be salted

    const isMatch = await req.user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ValidationError('Current password is incorrect');
    }

    req.user.password = newPassword;
    await req.user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error changing password'));
  }
};

interface RequestPasswordResetRequest extends Request {
  body: {
    email: string;
  };
}

export const requestPasswordReset = async (req: RequestPasswordResetRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    
    const { email } = req.body;

    const user = await User.findByEmail(email);

    if (!user) {
      throw new NotFoundError('User');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetUrl = `${environment.app.frontend}/reset-password/${resetToken}`;
    
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Please click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `
    });

    logger.info('Requested password reset for', { email: email });
    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error requesting password reset'));
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

export const resetPassword = async (req: ResetPasswordRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    next(error instanceof CustomError ? error : new InternalServerError('Error resetting password'));
  }
};