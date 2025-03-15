import express, { type Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Security: Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use("/api/", limiter);

// Security: Prevent HTTP Parameter Pollution
app.use(hpp());

// Disable caching for API routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Expires', '-1');
  res.set('Pragma', 'no-cache');
  next();
});

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Security: Add general security middleware
app.use((req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');

  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');

  next();
});

// Request logging middleware with enhanced debugging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Enhanced request logging
  if (path.startsWith("/api")) {
    console.log(`[${new Date().toISOString()}] Incoming ${req.method} ${path}`);
    console.log('Query params:', req.query);
    console.log('Request body:', req.body);
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
      if (capturedJsonResponse) {
        // Security: Sanitize sensitive data from logs
        const sanitizedResponse = { ...capturedJsonResponse };
        delete sanitizedResponse.password;
        delete sanitizedResponse.token;
        logLine += ` :: ${JSON.stringify(sanitizedResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Error handling middleware with enhanced error logging
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

  res.status(status).json({ message });
});

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