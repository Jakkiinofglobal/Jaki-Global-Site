import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getShops, getProducts, getProduct } from "./printify";
import { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } from "./paypal";
import { insertPageConfigSchema, insertCartSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Page configuration routes
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getAllPageConfigs();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ error: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:id", async (req, res) => {
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

  app.post("/api/pages", async (req, res) => {
    try {
      const validated = insertPageConfigSchema.parse(req.body);
      const page = await storage.createPageConfig(validated);
      res.json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      res.status(400).json({ error: "Invalid page configuration" });
    }
  });

  app.put("/api/pages/:id", async (req, res) => {
    try {
      const page = await storage.updatePageConfig(req.params.id, req.body);
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  app.delete("/api/pages/:id", async (req, res) => {
    try {
      await storage.deletePageConfig(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ error: "Failed to delete page" });
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
