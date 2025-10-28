import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

/** ✅ Tell Express we’re behind a proxy (Render) so secure cookies work */
app.set("trust proxy", 1);

/** Body parsing (keep before session) */
declare module "http" {
  interface IncomingMessage { rawBody: unknown }
}
app.use(express.json({
  verify: (req, _res, buf) => { (req as any).rawBody = buf; }
}));
app.use(express.urlencoded({ extended: false }));

/** Session typing */
declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
    email?: string;
  }
}

/** ✅ Session with secure cookie in production */
app.use(session({
  secret: process.env.SESSION_SECRET || "jaki-global-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // needs trust proxy = 1
    httpOnly: true,
    sameSite: "lax",
    maxAge: 24 * 60 * 60 * 1000,
  }
}));

/** Request/response logger (unchanged) */
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let captured: any;
  const ojson = res.json;
  res.json = function (b, ...a) { captured = b; return ojson.apply(res, [b, ...a]); };
  res.on("finish", () => {
    if (path.startsWith("/api")) {
      let line = `${req.method} ${path} ${res.statusCode} in ${Date.now() - start}ms`;
      if (captured) line += ` :: ${JSON.stringify(captured)}`;
      if (line.length > 80) line = line.slice(0, 79) + "…";
      log(line);
    }
  });
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
