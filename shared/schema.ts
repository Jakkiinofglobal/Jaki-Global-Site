import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Page Component Types
export type ComponentType = 'text' | 'image' | 'header' | 'background' | 'button' | 'productGrid';

export interface ComponentStyle {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  padding?: string;
  margin?: string;
  textAlign?: 'left' | 'center' | 'right';
  width?: string;
  height?: string;
  backgroundImage?: string;
  borderRadius?: string;
  border?: string;
}

export interface PageComponent {
  id: string;
  type: ComponentType;
  content: string;
  style: ComponentStyle;
  position: {
    x: number;
    y: number;
  };
  order: number;
}

export interface PageConfiguration {
  id: string;
  name: string;
  components: PageComponent[];
}

// Printify Product Types
export interface PrintifyVariant {
  id: number;
  title: string;
  price: number;
  is_enabled: boolean;
  options?: Record<string, string>; // e.g., { "color": "Black", "size": "M" }
}

export interface PrintifyProduct {
  id: string;
  title: string;
  description: string;
  images: string[];
  variants: PrintifyVariant[];
  tags: string[];
}

// Cart Types
export interface CartItem {
  productId: string;
  productTitle: string;
  variantId: number;
  variantTitle: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

// Database schemas (for in-memory storage)
export const pageConfigs = pgTable("page_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  components: jsonb("components").notNull().default('[]'),
});

export const carts = pgTable("carts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  items: jsonb("items").notNull().default('[]'),
  total: integer("total").notNull().default(0),
});

// Zod schemas
export const insertPageConfigSchema = createInsertSchema(pageConfigs).omit({
  id: true,
});

export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
});

export const componentStyleSchema = z.object({
  fontFamily: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  color: z.string().optional(),
  backgroundColor: z.string().optional(),
  padding: z.string().optional(),
  margin: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  backgroundImage: z.string().optional(),
  borderRadius: z.string().optional(),
  border: z.string().optional(),
});

export const pageComponentSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'image', 'header', 'background', 'button', 'productGrid']),
  content: z.string(),
  style: componentStyleSchema,
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  order: z.number(),
});

export const cartItemSchema = z.object({
  productId: z.string(),
  productTitle: z.string(),
  variantId: z.number(),
  variantTitle: z.string(),
  price: z.number(),
  quantity: z.number(),
  image: z.string(),
});

// Types
export type InsertPageConfig = z.infer<typeof insertPageConfigSchema>;
export type PageConfig = typeof pageConfigs.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;
export type CartData = typeof carts.$inferSelect;
