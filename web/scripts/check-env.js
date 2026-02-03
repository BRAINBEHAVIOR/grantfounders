#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function loadEnv(file) {
  const fullPath = path.join(process.cwd(), file);
  if (!fs.existsSync(fullPath)) return;
  const lines = fs.readFileSync(fullPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv('.env.local');
loadEnv('.env');

// Development defaults for preview/dev environments
const devDefaults = {
  'SUPABASE_URL': 'https://placeholder.supabase.co',
  'SUPABASE_ANON_KEY': 'placeholder-anon-key',
  'SUPABASE_SERVICE_ROLE_KEY': 'placeholder-service-role-key',
  'JWT_SECRET': 'dev-jwt-secret-min-32-characters-long',
  'GF_SECRET_KEY': 'dev-gf-secret-key-for-development',
  'NEXT_PUBLIC_APP_VERSION': '1.0.0-dev',
  'NEXT_PUBLIC_ENVIRONMENT': 'development'
};

// Check if we're in a preview/development environment (no Supabase configured)
const isPreviewEnv = !process.env.SUPABASE_URL || process.env.SUPABASE_URL === '';

// Apply defaults for preview/dev environments
if (isPreviewEnv) {
  console.log("⚠️  Running in preview/development mode with placeholder values");
  for (const [key, value] of Object.entries(devDefaults)) {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

// Core required vars (always needed in production)
const coreRequired = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'JWT_SECRET',
  'GF_SECRET_KEY',
  'NEXT_PUBLIC_APP_VERSION',
  'NEXT_PUBLIC_ENVIRONMENT'
];

// Stripe vars (only required if ENABLE_STRIPE=true)
const stripeVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_PRO_PRICE_ID',
  'STRIPE_ENTERPRISE_PRICE_ID',
];

const enableStripe = process.env.ENABLE_STRIPE === 'true';

const required = enableStripe ? [...coreRequired, ...stripeVars] : coreRequired;
const missing = required.filter(k => !process.env[k]);

if (missing.length) {
  console.error("❌ Missing env vars:", missing.join(", "));
  if (!enableStripe && stripeVars.some(v => missing.includes(v))) {
    console.log("ℹ️  Tip: Stripe vars are optional unless ENABLE_STRIPE=true");
  }
  process.exit(1);
} else {
  if (isPreviewEnv) {
    console.log("✅ Preview mode: Using development defaults (database features disabled)");
  } else {
    console.log("✅ All required GrantFounders env vars OK");
  }
  if (enableStripe) {
    console.log("✅ Stripe integration enabled");
  } else {
    console.log("ℹ️  Stripe integration disabled (set ENABLE_STRIPE=true to enable)");
  }
  process.exit(0);
}
