import { 
  type PageConfig,
  type InsertPageConfig,
  type CartData,
  type InsertCart,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Page Configuration
  getPageConfig(id: string): Promise<PageConfig | undefined>;
  getAllPageConfigs(): Promise<PageConfig[]>;
  createPageConfig(config: InsertPageConfig): Promise<PageConfig>;
  updatePageConfig(id: string, config: Partial<InsertPageConfig>): Promise<PageConfig>;
  deletePageConfig(id: string): Promise<void>;
  
  // Cart
  getCart(id: string): Promise<CartData | undefined>;
  createCart(cart: InsertCart): Promise<CartData>;
  updateCart(id: string, cart: Partial<InsertCart>): Promise<CartData>;
}

export class MemStorage implements IStorage {
  private pageConfigs: Map<string, PageConfig>;
  private carts: Map<string, CartData>;

  constructor() {
    this.pageConfigs = new Map();
    this.carts = new Map();
  }

  // Page Configuration methods
  async getPageConfig(id: string): Promise<PageConfig | undefined> {
    return this.pageConfigs.get(id);
  }

  async getAllPageConfigs(): Promise<PageConfig[]> {
    return Array.from(this.pageConfigs.values());
  }

  async createPageConfig(insertConfig: InsertPageConfig): Promise<PageConfig> {
    const id = randomUUID();
    const config: PageConfig = { 
      ...insertConfig,
      id,
      components: insertConfig.components || [],
    };
    this.pageConfigs.set(id, config);
    return config;
  }

  async updatePageConfig(id: string, updates: Partial<InsertPageConfig>): Promise<PageConfig> {
    const existing = this.pageConfigs.get(id);
    if (!existing) {
      throw new Error(`Page config ${id} not found`);
    }
    const updated: PageConfig = { ...existing, ...updates };
    this.pageConfigs.set(id, updated);
    return updated;
  }

  async deletePageConfig(id: string): Promise<void> {
    this.pageConfigs.delete(id);
  }

  // Cart methods
  async getCart(id: string): Promise<CartData | undefined> {
    return this.carts.get(id);
  }

  async createCart(insertCart: InsertCart): Promise<CartData> {
    const id = randomUUID();
    const cart: CartData = { 
      ...insertCart,
      id,
      items: insertCart.items || [],
      total: insertCart.total || 0,
    };
    this.carts.set(id, cart);
    return cart;
  }

  async updateCart(id: string, updates: Partial<InsertCart>): Promise<CartData> {
    const existing = this.carts.get(id);
    if (!existing) {
      throw new Error(`Cart ${id} not found`);
    }
    const updated: CartData = { ...existing, ...updates };
    this.carts.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
