import { Request, Response } from "express";

// Check if PayPal credentials are available
const hasPayPalCredentials = Boolean(
  process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
);

// Lazy load PayPal module only if credentials exist
let paypalModule: typeof import("./paypal") | null = null;
let paypalLoadError: Error | null = null;

async function getPayPalModule() {
  if (!hasPayPalCredentials) {
    return null;
  }
  
  if (paypalModule) {
    return paypalModule;
  }
  
  if (paypalLoadError) {
    throw paypalLoadError;
  }
  
  try {
    paypalModule = await import("./paypal");
    return paypalModule;
  } catch (error) {
    paypalLoadError = error instanceof Error ? error : new Error(String(error));
    console.error("Failed to load PayPal module:", error);
    throw paypalLoadError;
  }
}

// Stub implementation for when PayPal is not configured
const createPayPalNotConfiguredResponse = (res: Response) => {
  return res.status(503).json({
    error: "PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.",
  });
};

export async function loadPaypalDefault(req: Request, res: Response) {
  const module = await getPayPalModule();
  if (!module) {
    console.warn("PayPal credentials not configured - returning 503");
    return createPayPalNotConfiguredResponse(res);
  }
  return module.loadPaypalDefault(req, res);
}

export async function createPaypalOrder(req: Request, res: Response) {
  const module = await getPayPalModule();
  if (!module) {
    console.warn("PayPal credentials not configured - returning 503");
    return createPayPalNotConfiguredResponse(res);
  }
  return module.createPaypalOrder(req, res);
}

export async function capturePaypalOrder(req: Request, res: Response) {
  const module = await getPayPalModule();
  if (!module) {
    console.warn("PayPal credentials not configured - returning 503");
    return createPayPalNotConfiguredResponse(res);
  }
  return module.capturePaypalOrder(req, res);
}
