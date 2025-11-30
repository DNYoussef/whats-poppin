// ============================================================================
// What's Poppin! - Health Check API
// File: src/app/api/health/route.ts
// Description: Health check endpoint for Railway deployment
// ============================================================================

import { NextResponse } from 'next/server';

/**
 * GET /api/health
 * Health check endpoint for container orchestration
 * Returns 200 OK if the service is healthy
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '1.0.0',
  });
}

/* AGENT FOOTER BEGIN: DO NOT EDIT ABOVE THIS LINE */
// Version & Run Log
// | Version | Timestamp | Agent/Model | Change Summary | Status |
// |--------:|-----------|-------------|----------------|--------|
// | 1.0.0   | 2025-11-30T00:00:00 | claude@opus-4 | Health check endpoint for Railway | OK |
/* AGENT FOOTER END */
