import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Rate limiter: 300 requests per minute
export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // Limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after a minute.',
    error: 'Rate limit exceeded'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health check endpoint
  skip: (req) => req.path === '/api/health',
  // Custom handler to log rate limit hits
  handler: (req: Request, res: Response) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const path = req.path;
    console.log(`[RATE LIMITER] Rate limit exceeded for IP: ${ip}, Path: ${path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again after a minute.',
      error: 'Rate limit exceeded'
    });
  },
});

