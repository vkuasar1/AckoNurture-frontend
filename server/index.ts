import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import dotenv from "dotenv";

const app = express();
const httpServer = createServer(app);
dotenv.config();

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// Only parse JSON for non-multipart requests
app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    // Skip body parsing for multipart requests - we'll stream the raw body in the proxy
    return next();
  }
  express.json({
    limit: "10mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  })(req, res, next);
});

// Only parse urlencoded for non-multipart requests
app.use((req, res, next) => {
  const contentType = req.headers["content-type"] || "";
  if (contentType.includes("multipart/form-data")) {
    return next();
  }
  express.urlencoded({ extended: false, limit: "10mb" })(req, res, next);
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

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
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

// API Proxy middleware - must be before Vite setup
const VITE_API_BASE_URL = process.env.VITE_API_BASE_URL;

app.use("/api/v1", async (req, res, next) => {
  try {
    const targetUrl = `${VITE_API_BASE_URL}${req.originalUrl}`;
    const isGetOrHead = req.method === "GET" || req.method === "HEAD";
    const contentType = req.headers["content-type"] || "";
    const isMultipart = contentType.includes("multipart/form-data");

    // For multipart requests, we need to collect the raw body stream
    let body: BodyInit | undefined;

    if (!isGetOrHead) {
      if (isMultipart) {
        // Collect raw body chunks for multipart requests
        // The stream should still be readable since we skip parsing for multipart
        const chunks: Buffer[] = [];

        // Collect all data chunks using event handlers
        await new Promise<void>((resolve, reject) => {
          // If stream is already ended, we can't read it
          if (req.readableEnded) {
            reject(new Error("Request stream already ended"));
            return;
          }

          // Ensure stream is in flowing mode (not paused)
          if (req.isPaused()) {
            req.resume();
          }

          // Set up event handlers
          const dataHandler = (chunk: Buffer) => {
            chunks.push(chunk);
          };

          const endHandler = () => {
            // Clean up listeners
            req.removeListener("data", dataHandler);
            req.removeListener("end", endHandler);
            req.removeListener("error", errorHandler);
            body = Buffer.concat(chunks);
            resolve();
          };

          const errorHandler = (err: Error) => {
            // Clean up listeners
            req.removeListener("data", dataHandler);
            req.removeListener("end", endHandler);
            req.removeListener("error", errorHandler);
            reject(err);
          };

          // Attach listeners
          req.on("data", dataHandler);
          req.on("end", endHandler);
          req.on("error", errorHandler);
        });
      } else if (contentType.includes("application/json")) {
        body = JSON.stringify(req.body);
      } else {
        body = req.body;
      }
    }

    // Build headers - forward all original headers for multipart
    const headers: Record<string, string> = {};
    Object.keys(req.headers).forEach((key) => {
      const value = req.headers[key];
      if (value && typeof value === "string") {
        headers[key] = value;
      } else if (Array.isArray(value) && value.length > 0) {
        headers[key] = value[0];
      }
    });

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      body,
    };

    const response = await fetch(targetUrl, fetchOptions);

    // Forward status and headers
    res.status(response.status);
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    // Stream the response body
    const responseData = await response.text();

    // Try to parse as JSON, otherwise send as text
    try {
      const jsonData = JSON.parse(responseData);
      res.json(jsonData);
    } catch {
      res.send(responseData);
    }
  } catch (error) {
    next(error);
  }
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "3000", 10);
  httpServer.listen(
    {
      port,
      host: "::",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
