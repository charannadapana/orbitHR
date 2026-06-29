import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { sendError } from '../utils/response.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return sendError(res, 401, 'Not authorized to access this route');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, env.jwtSecret);
      req.user = await User.findById(decoded.id);

      if (!req.user) {
        return sendError(res, 404, 'No user found with this id');
      }

      next();
    } catch (error) {
      return sendError(res, 401, 'Not authorized to access this route');
    }
  } catch (error) {
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }
    next();
  };
};
