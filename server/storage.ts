import { 
  type PageConfig,
  type InsertPageConfig,
  type CartData,
  type InsertCart,
  pageConfigs,
  carts,
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getPageConfig(id: string): Promise<PageConfig | undefined>;
  getAllPageConfigs(): Promise<PageConfig[]>;
  createPageConfig(config: InsertPageConfig): Promise<PageConfig>;
  updatePageConfig(id: string, config: Partial<InsertPageConfig>): Promise<PageConfig>;
  deletePageConfig(id: string): Promise<void>;
  
  getCart(id: string): Promise<CartData | undefined>;
  createCart(cart: InsertCart): Promise<CartData>;
  updateCart(id: string, cart: Partial<InsertCart>): Promise<CartData>;
}

export class DatabaseStorage implements IStorage {
  async getPageConfig(id: string): Promise<PageConfig | undefined> {
    const [page] = await db.select().from(pageConfigs).where(eq(pageConfigs.id, id));
    return page || undefined;
  }

  async getAllPageConfigs(): Promise<PageConfig[]> {
    return await db.select().from(pageConfigs);
  }

  async createPageConfig(insertConfig: InsertPageConfig): Promise<PageConfig> {
    const [page] = await db
      .insert(pageConfigs)
      .values({
        ...insertConfig,
        components: insertConfig.components || [],
      })
      .returning();
    return page;
  }

  async updatePageConfig(id: string, updates: Partial<InsertPageConfig>): Promise<PageConfig> {
    const [updated] = await db
      .update(pageConfigs)
      .set(updates)
      .where(eq(pageConfigs.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`Page config ${id} not found`);
    }
    
    return updated;
  }

  async deletePageConfig(id: string): Promise<void> {
    await db.delete(pageConfigs).where(eq(pageConfigs.id, id));
  }

  async getCart(id: string): Promise<CartData | undefined> {
    const [cart] = await db.select().from(carts).where(eq(carts.id, id));
    return cart || undefined;
  }

  async createCart(insertCart: InsertCart): Promise<CartData> {
    const [cart] = await db
      .insert(carts)
      .values({
        ...insertCart,
        items: insertCart.items || [],
        total: insertCart.total || 0,
      })
      .returning();
    return cart;
  }

  async updateCart(id: string, updates: Partial<InsertCart>): Promise<CartData> {
    const [updated] = await db
      .update(carts)
      .set(updates)
      .where(eq(carts.id, id))
      .returning();
    
    if (!updated) {
      throw new Error(`Cart ${id} not found`);
    }
    
    return updated;
  }
}

export const storage = new DatabaseStorage();
