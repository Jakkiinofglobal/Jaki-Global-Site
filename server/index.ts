import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Allow trusted proxy (Render needs this for cookies)
app.set("trust proxy", 1);

// Body parsing must come before session middleware
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: false }));

// Session configuration
declare module 'express-session' {
  interface SessionData {
    authenticated?: boolean;
    email?: string;
  }
}

app.use(session({
  secret: process.env.SESSION_SECRET || "jaki-global-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,           // Required for Render HTTPS
    httpOnly: true,
    sameSite: "none",       // Allow frontend/backend cookies
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));


/** Request/response logger (unchanged) */
  app.set("trust proxy", 1); // <--- add this line right above app.use(session)

app.use(session({
  secret: process.env.SESSION_SECRET || 'jaki-global-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,           // HTTPS only
    httpOnly: true,
    sameSite: "none",       // allow frontend <-> backend cookie use
    maxAge: 24 * 60 * 60 * 1000, // 24h
  },
}));

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();
