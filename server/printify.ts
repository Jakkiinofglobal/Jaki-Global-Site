import { PrintifyProduct, PrintifyVariant } from "@shared/schema";

const PRINTIFY_API_TOKEN = process.env.PRINTIFY_API_TOKEN;
const PRINTIFY_API_BASE = "https://api.printify.com/v1";

// Mock data for when API token is not configured
const MOCK_PRODUCTS: PrintifyProduct[] = [
  {
    id: "mock-1",
    title: "Sample T-Shirt",
    description: "Configure your Printify API token to see real products",
    images: ["https://via.placeholder.com/600x600?text=Sample+T-Shirt"],
    variants: [
      {
        id: 1,
        title: "Black / M",
        price: 2499,
        is_enabled: true,
        options: { color: "Black", size: "M" },
      },
      {
        id: 2,
        title: "White / M",
        price: 2499,
        is_enabled: true,
        options: { color: "White", size: "M" },
      },
      {
        id: 3,
        title: "Black / L",
        price: 2699,
        is_enabled: true,
        options: { color: "Black", size: "L" },
      },
    ],
    tags: ["sample"],
  },
  {
    id: "mock-2",
    title: "Sample Hoodie",
    description: "Configure your Printify API token to see real products",
    images: ["https://via.placeholder.com/600x600?text=Sample+Hoodie"],
    variants: [
      {
        id: 4,
        title: "Gray / M",
        price: 3999,
        is_enabled: true,
        options: { color: "Gray", size: "M" },
      },
      {
        id: 5,
        title: "Navy / M",
        price: 3999,
        is_enabled: true,
        options: { color: "Navy", size: "M" },
      },
    ],
    tags: ["sample"],
  },
];

interface PrintifyShop {
  id: number;
  title: string;
}

interface PrintifyAPIProduct {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: Array<{
    src: string;
    variant_ids: number[];
    position: string;
    is_default: boolean;
  }>;
  variants: Array<{
    id: number;
    title: string;
    price: number;
    is_enabled: boolean;
    options?: any;
  }>;
}

async function fetchPrintify(endpoint: string) {
  const response = await fetch(`${PRINTIFY_API_BASE}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${PRINTIFY_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Printify API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getShops(): Promise<PrintifyShop[]> {
  if (!PRINTIFY_API_TOKEN) {
    console.warn('PRINTIFY_API_TOKEN not configured - using mock data');
    return [{ id: 0, title: 'Mock Shop' }];
  }
  return fetchPrintify('/shops.json');
}

export async function getProducts(shopId: number): Promise<PrintifyProduct[]> {
  if (!PRINTIFY_API_TOKEN) {
    console.warn('PRINTIFY_API_TOKEN not configured - returning mock products');
    return MOCK_PRODUCTS;
  }

  const data = await fetchPrintify(`/shops/${shopId}/products.json`);
  
  // Transform Printify API response to our schema
  return data.data.map((product: PrintifyAPIProduct) => ({
    id: product.id,
    title: product.title,
    description: product.description || '',
    images: product.images
      .filter(img => img.is_default || img.position === '0')
      .map(img => img.src)
      .concat(
        product.images
          .filter(img => !img.is_default && img.position !== '0')
          .map(img => img.src)
      )
      .slice(0, 5), // Limit to 5 images
    variants: product.variants.map(variant => ({
      id: variant.id,
      title: variant.title,
      price: variant.price,
      is_enabled: variant.is_enabled,
      options: variant.options || {},
    })),
    tags: product.tags || [],
  }));
}

export async function getProduct(shopId: number, productId: string): Promise<PrintifyProduct> {
  if (!PRINTIFY_API_TOKEN) {
    const mockProduct = MOCK_PRODUCTS.find(p => p.id === productId);
    if (mockProduct) return mockProduct;
    throw new Error('Product not found');
  }

  const product: PrintifyAPIProduct = await fetchPrintify(
    `/shops/${shopId}/products/${productId}.json`
  );

  return {
    id: product.id,
    title: product.title,
    description: product.description || '',
    images: product.images
      .filter(img => img.is_default || img.position === '0')
      .map(img => img.src)
      .concat(
        product.images
          .filter(img => !img.is_default && img.position !== '0')
          .map(img => img.src)
      )
      .slice(0, 5),
    variants: product.variants.map(variant => ({
      id: variant.id,
      title: variant.title,
      price: variant.price,
      is_enabled: variant.is_enabled,
      options: variant.options || {},
    })),
    tags: product.tags || [],
  };
}
