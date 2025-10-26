import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getShops, getProducts, getProduct } from "./printify";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypalAdapter";
import { insertPageConfigSchema, insertCartSchema } from "@shared/schema";
import { z } from "zod";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";

// Authentication credentials
const ADMIN_EMAIL = "jakiinfo.global@gmail.com";
const ADMIN_PASSWORD = "1234567";

// Auth middleware
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.session?.authenticated) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        req.session.authenticated = true;
        req.session.email = email;
        res.json({ success: true, email });
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ error: "Invalid request" });
    }
  });

  app.post("/api/auth/logout", async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        res.status(500).json({ error: "Failed to logout" });
      } else {
        res.json({ success: true });
      }
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (req.session?.authenticated) {
      res.json({ authenticated: true, email: req.session.email });
    } else {
      res.json({ authenticated: false });
    }
  });

  // PayPal routes (required by PayPal integration blueprint)
  app.get("/setup", async (req, res) => {
    await loadPaypalDefault(req, res);
  });

  app.post("/order", async (req, res) => {
    await createPaypalOrder(req, res);
  });

  app.post("/order/:orderID/capture", async (req, res) => {
    await capturePaypalOrder(req, res);
  });

  // Printify routes
  app.get("/api/printify/shops", async (req, res) => {
    try {
      const shops = await getShops();
      res.json(shops);
    } catch (error) {
      console.error("Error fetching shops:", error);
      res.status(500).json({ error: "Failed to fetch shops" });
    }
  });

  app.get("/api/products", async (req, res) => {
    try {
      // Get the first shop
      const shops = await getShops();
      if (shops.length === 0) {
        return res.json([]);
      }

      const products = await getProducts(shops[0].id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const shops = await getShops();
      if (shops.length === 0) {
        return res.status(404).json({ error: "No shops found" });
      }

      const product = await getProduct(shops[0].id, req.params.id);
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  // Page configuration routes (protected)
  app.get("/api/pages", requireAuth, async (req, res) => {
    try {
      const pages = await storage.getAllPageConfigs();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:id", requireAuth, async (req, res) => {
    try {
      const page = await storage.getPageConfig(req.params.id);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  app.post("/api/pages", requireAuth, async (req, res) => {
    try {
      const validated = insertPageConfigSchema.parse(req.body);
      const page = await storage.createPageConfig(validated);
      res.json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(400).json({ error: "Invalid page configuration" });
    }
  });

  app.put("/api/pages/:id", requireAuth, async (req, res) => {
    try {
      const page = await storage.updatePageConfig(req.params.id, req.body);
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  app.delete("/api/pages/:id", requireAuth, async (req, res) => {
    try {
      await storage.deletePageConfig(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ error: "Failed to delete page" });
    }
  });

  // Object Storage routes (referenced from blueprint:javascript_object_storage)
  // Endpoint for serving uploaded images (public access)
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Endpoint for getting upload URL (protected - requires auth)
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Endpoint for normalizing uploaded image URL (protected - requires auth)
  app.put("/api/images", requireAuth, async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(
        req.body.imageURL,
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Cart routes
  app.get("/api/cart/:id", async (req, res) => {
    try {
      const cart = await storage.getCart(req.params.id);
      if (!cart) {
        return res.status(404).json({ error: "Cart not found" });
      }
      res.json(cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ error: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const validated = insertCartSchema.parse(req.body);
      const cart = await storage.createCart(validated);
      res.json(cart);
    } catch (error) {
      console.error("Error creating cart:", error);
      res.status(400).json({ error: "Invalid cart data" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const cart = await storage.updateCart(req.params.id, req.body);
      res.json(cart);
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({ error: "Failed to update cart" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
