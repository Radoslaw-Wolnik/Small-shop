// src/middleware/auth.ts

import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import RevokedToken from '../models/RevokedToken';
import User, { IUserDocument } from '../models/User';

// Helper function to generate a short-lived token
export const generateShortLivedToken = (user: IUserDocument): string => {
  return jwt.sign(
    { userId: user._id, shortLived: true },
    process.env.JWT_SECRET!,
    { expiresIn: '5m' }
  );
};

// Helper function to set a short-lived token as a cookie
export const setShortLivedTokenCookie = (res: Response, token: string): void => {
  res.cookie('shortLivedToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 300000
  });
};

export const generateToken = (user: IUserDocument): string => {
  return jwt.sign(
    { user: { id: user._id, role: user.role } },
    process.env.JWT_SECRET!,
    { expiresIn: '1h' }
  );
};

export const setTokenCookie = (res: Response, token: string): void => {
  res.cookie('token', token, {
    httpOnly: true,
    //secure: process.env.NODE_ENV === 'production', // Use secure in production
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour in milliseconds
  });
};

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    // Check if the token has been revoked
    const revokedToken = await RevokedToken.findOne({ token: token });
    if (revokedToken) {
      res.status(403).json({ message: 'Token has been revoked.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    
    // Fetch the user from the database to get the most up-to-date role information
    const user = await User.findById(decoded.user.id);
    
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Invalid token.' });
    } else {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'Access denied. No token provided.' });
    return;
  }

  try {
    // Check if the token has been revoked
    const revokedToken = await RevokedToken.findOne({ token: token });
    if (revokedToken) {
      res.status(403).json({ message: 'Token has been revoked.' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    const user = await User.findById(decoded.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    req.user = user; // Attach the full user object
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Invalid token.' });
    } else {
      res.status(500).json({ message: 'Internal server error.' });
    }
  }
};

export const refreshToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await User.findById(decoded.user.id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    /* Check if the user's email is verified
     * if (!user.isVerified) {
     *   return res.status(403).json({ message: 'Email not verified. Please verify your email to continue.' });
     * }
    */

    const newToken = generateToken(user);
    setTokenCookie(res, newToken);

    res.json({ message: 'Token refreshed successfully', user: { id: user._id, role: user.role } });
  } catch (error) {
    res.status(403).json({ message: 'Invalid token' });
  }
};


export const handlePostRegistrationAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const shortLivedToken = req.cookies.shortLivedToken;

  if (!shortLivedToken) {
    return next(); // Proceed to next middleware if no short-lived token
  }

  try {
    const decoded = jwt.verify(shortLivedToken, process.env.JWT_SECRET!) as JwtPayload;
    
    if (!decoded.shortLived) {
      next();
      return; // Not a short-lived token, proceed to next middleware
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Clear the short-lived token cookie
    res.clearCookie('shortLivedToken');

    // Set the user on the request object
    req.user = user;

    // Generate and set a regular session token
    const sessionToken = generateToken(user);
    setTokenCookie(res, sessionToken);

    // Proceed to the next middleware
    next();

  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      // Clear the invalid short-lived token and proceed
      res.clearCookie('shortLivedToken');
      next();
    } else {
      console.error('Error in post-registration auth:', error);
      res.status(500).send('Server error');
    }
  }
};