import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Security: Significantly increased rate limits with proper request queuing
const activityLogLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Allow 1000 requests per minute
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests",
      retryAfter: Math.ceil(res.getHeader('Retry-After') as number / 1000)
    });
  },
  keyGenerator: (req) => {
    return req.ip + ':' + req.path; // Separate limits for different endpoints
  }
});

const exerciseLogLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // Allow 1000 requests per minute
  message: "Too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: "Too many requests",
      retryAfter: Math.ceil(res.getHeader('Retry-After') as number / 1000)
    });
  },
  keyGenerator: (req) => {
    return req.ip + ':' + req.path; // Separate limits for different endpoints
  }
});

// Apply separate rate limiters to different endpoints
app.use("/api/activity-logs", activityLogLimiter);
app.use("/api/exercise-logs", exerciseLogLimiter);

// Security: Prevent HTTP Parameter Pollution
app.use(hpp());

// Enhanced CORS configuration
app.use((req, res, next) => {
  // Allow specific origins in production
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Expose-Headers', 'X-Total-Count, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Disable caching for API routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Expires', '-1');
  res.set('Pragma', 'no-cache');
  next();
});

// Body parsing with increased limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

// Enhanced security middleware
app.use((req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('Feature-Policy', "camera 'none'; microphone 'none'");

  next();
});

// Enhanced request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  if (path.startsWith("/api")) {
    console.log(`[${new Date().toISOString()}] Incoming ${req.method} ${path}`);
    if (!path.includes('password') && !path.includes('token')) {
      console.log('Headers:', {
        'User-Agent': req.headers['user-agent'],
        'Content-Type': req.headers['content-type'],
        'Accept': req.headers['accept']
      });
    }
  }

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;

      // Only log response for non-200 status codes
      if (res.statusCode !== 200 && capturedJsonResponse) {
        const sanitizedResponse = { ...capturedJsonResponse };
        delete sanitizedResponse.password;
        delete sanitizedResponse.token;
        logLine += ` :: ${JSON.stringify(sanitizedResponse)}`;
      }

      if (res.statusCode >= 400) {
        console.error(logLine);
      } else {
        console.log(logLine);
      }
    }
  });

  next();
});

// Enhanced error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error details:', {
    message: err.message,
    stack: err.stack,
    code: err.code,
    name: err.name
  });

  const status = err.status || err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message || 'Internal Server Error';

  if (status >= 500) {
    console.error('Server Error:', err);
  }

  res.status(status).json({ 
    error: message,
    retryAfter: status === 429 ? 30 : undefined // Suggest retry after 30 seconds for rate limit errors
  });
});

// Start server with enhanced error handling
(async () => {
  try {
    const server = await registerRoutes(app);

    // Security: Use secure session configuration
    app.set('trust proxy', 1);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();